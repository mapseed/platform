var Util = require('../utils.js');

// Views
var MapView = require('mapseed-map-view');
var PagesNavView = require('mapseed-pages-nav-view');
var AuthNavView = require('mapseed-auth-nav-view');
var LandmarkDetailView = require('mapseed-landmark-detail-view');
var PlaceListView = require('mapseed-place-list-view');
var SidebarView = require('mapseed-sidebar-view');
var ActivityView = require('mapseed-activity-view');
var GeocodeAddressView = require('mapseed-geocode-address-view');
var PlaceCounterView = require('mapseed-place-counter-view');
var PlaceDetailView = require('mapseed-place-detail-view');
var PlaceFormView = require('mapseed-place-form-view');
var RightSidebarView = require('mapseed-right-sidebar-view');
var FilterMenuView = require('mapseed-filter-menu-view');

// Models
var PlaceModel = require('../models/place-model.js');
var LandmarkModel = require('../models/landmark-model.js');

// Spinner options -- these need to be own modules
Shareabouts.bigSpinnerOptions = {
  lines: 13, length: 0, width: 10, radius: 30, corners: 1, rotate: 0,
  direction: 1, color: '#000', speed: 1, trail: 60, shadow: false,
  hwaccel: false, className: 'spinner', zIndex: 2e9, top: 'auto',
  left: 'auto'
};

Shareabouts.smallSpinnerOptions = {
  lines: 13, length: 0, width: 3, radius: 10, corners: 1, rotate: 0,
  direction: 1, color: '#000', speed: 1, trail: 60, shadow: false,
  hwaccel: false, className: 'spinner', zIndex: 2e9, top: 'auto',
  left: 'auto'
};

module.exports = Backbone.View.extend({
  events: {
    'click #add-place': 'onClickAddPlaceBtn',
    'click .close-btn': 'onClickClosePanelBtn',
    'click .collapse-btn': 'onToggleSidebarVisibility',
    'click .list-toggle-btn': 'toggleListView'
  },
  initialize: function() {
    // store promises returned from collection fetches
    Shareabouts.deferredCollections = [];

    var self = this,
        // Only include submissions if the list view is enabled (anything but false)
        includeSubmissions = Shareabouts.Config.flavor.app.list_enabled !== false,
        placeParams = {
          // NOTE: this is to simply support the list view. It won't
          // scale well, so let's think about a better solution.
          include_submissions: includeSubmissions
        };

    // Use the page size as dictated by the server by default, unless
    // directed to do otherwise in the configuration.
    if (Shareabouts.Config.flavor.app.places_page_size) {
      placeParams.page_size = Shareabouts.Config.flavor.app.places_page_size;
    }

    // Bootstrapped data from the page
    this.activities = this.options.activities;
    this.places = this.options.places;
    this.landmarks = this.options.landmarks;

    // Caches of the views (one per place)
    this.placeFormView = null;
    this.placeDetailViews = {};
    this.landmarkDetailViews = {};
    this.activeDetailView;

    // this flag is used to distinguish between user-initiated zooms and
    // zooms initiated by a leaflet method
    this.isProgrammaticZoom = false;
    this.isStoryActive = false;

    $("body").ajaxError(function(evt, request, settings) {
      $("#ajax-error-msg").show();
    });

    $("body").ajaxSuccess(function(evt, request, settings) {
      $("#ajax-error-msg").hide();
    });

    if (this.options.activityConfig.show_in_right_panel === true) {
      $("body").addClass("right-sidebar-visible");
      $("#right-sidebar-container").html(
        "<ul class='recent-points unstyled-list'></ul>",
      );
    }

    $(document).on("click", ".activity-item a", function(evt) {
      window.app.clearLocationTypeFilter();
    });

    // Globally capture clicks. If they are internal and not in the pass
    // through list, route them through Backbone's navigate method.
    $(document).on("click", 'a[href^="/"]', function(evt) {
      var $link = $(evt.currentTarget),
        href = $link.attr("href"),
        url,
        isLinkToPlace = false;

      _.each(self.options.datasetConfigs.places, function(dataset) {
        if (href.indexOf("/" + dataset.slug) === 0) isLinkToPlace = true;
      });

      // Allow shift+click for new tabs, etc.
      if (
        ($link.attr("rel") === "internal" ||
          href === "/" ||
          isLinkToPlace ||
          href.indexOf("/filter") === 0) &&
        !evt.altKey &&
        !evt.ctrlKey &&
        !evt.metaKey &&
        !evt.shiftKey
      ) {
        evt.preventDefault();

        // Remove leading slashes and hash bangs (backward compatablility)
        url = href.replace(/^\//, "").replace("#!/", "");

        // # Instruct Backbone to trigger routing events
        self.options.router.navigate(url, {
          trigger: true,
        });

        return false;
      }
    });

    // On any route (/place or /page), hide the list view
    this.options.router.bind(
      "route",
      function(route) {
        if (
          !_.contains(this.getListRoutes(), route) &&
          this.listView &&
          this.listView.isVisible()
        ) {
          this.hideListView();
        }
      },
      this,
    );

    // Only append the tools to add places (if supported)
    $("#map-container").append(Handlebars.templates["centerpoint"]());
    // NOTE: append add place/story buttons after the #map-container
    // div (rather than inside of it) in order to support bottom-clinging buttons
    $("#map-container").after(
      Handlebars.templates["add-places"](this.options.placeConfig),
    );

    this.pagesNavView = new PagesNavView({
      el: "#pages-nav-container",
      pagesConfig: this.options.pagesConfig,
      placeConfig: this.options.placeConfig,
      router: this.options.router,
    }).render();

    this.authNavView = new AuthNavView({
      el: "#auth-nav-container",
      router: this.options.router,
    }).render();

    this.basemapConfigs = _.find(this.options.sidebarConfig.panels, function(
      panel,
    ) {
      return "basemaps" in panel;
    }).basemaps;
    // Init the map view to display the places
    this.mapView = new MapView({
      el: "#map",
      mapConfig: this.options.mapConfig,
      sidebarConfig: this.options.sidebarConfig,
      basemapConfigs: this.basemapConfigs,
      legend_enabled: !!this.options.sidebarConfig.legend_enabled,
      places: this.places,
      landmarks: this.landmarks,
      router: this.options.router,
      placeTypes: this.options.placeTypes,
      cluster: this.options.cluster,
      placeDetailViews: this.placeDetailViews,
      placeConfig: this.options.placeConfig
    });

    if (self.options.sidebarConfig.enabled) {
      new SidebarView({
        el: "#sidebar-container",
        mapView: this.mapView,
        sidebarConfig: this.options.sidebarConfig,
        placeConfig: this.options.placeConfig
      }).render();
    }

    // Activity is enabled by default (undefined) or by enabling it
    // explicitly. Set it to a falsey value to disable activity.
    if (
      _.isUndefined(this.options.activityConfig.enabled) ||
      this.options.activityConfig.enabled
    ) {
      // Init the view for displaying user activity
      this.activityView = new ActivityView({
        el: "ul.recent-points",
        activities: this.activities,
        places: this.places,
        landmarks: this.landmarks,
        placeConfig: this.options.placeConfig,
        router: this.options.router,
        placeTypes: this.options.placeTypes,
        surveyConfig: this.options.surveyConfig,
        supportConfig: this.options.supportConfig,
        placeConfig: this.options.placeConfig,
        mapConfig: this.options.mapConfig,
        // How often to check for new content
        interval: this.options.activityConfig.interval || 30000,
      });
    }

    // Init the address search bar
    this.geocodeAddressView = new GeocodeAddressView({
      el: "#geocode-address-bar",
      router: this.options.router,
      mapConfig: this.options.mapConfig,
    }).render();

    // Init the place-counter
    this.placeCounterView = new PlaceCounterView({
      el: "#place-counter",
      router: this.options.router,
      mapConfig: this.options.mapConfig,
      places: this.places,
    }).render();

    // When the user chooses a geocoded address, the address view will fire
    // a geocode event on the namespace. At that point we center the map on
    // the geocoded location.
    $(Shareabouts).on("geocode", function(evt, locationData) {
      self.mapView.zoomInOn(locationData.latLng);

      if (self.isAddingPlace()) {
        self.placeFormView.setLatLng(locationData.latLng);
        // Don't pass location data into our geolocation's form field
        // self.placeFormView.setLocation(locationData);
      }
    });

    // When the map center moves, the map view will fire a mapmoveend event
    // on the namespace. If the move was the result of the user dragging, a
    // mapdragend event will be fired.
    //
    // If the user is adding a place, we want to take the opportunity to
    // reverse geocode the center of the map, if geocoding is enabled. If
    // the user is doing anything else, we just want to clear out any text
    // that's currently set in the address search bar.
    $(Shareabouts).on("mapdragend", function(evt) {
      if (self.isAddingPlace()) {
        self.conditionallyReverseGeocode();
      } else if (self.geocodeAddressView) {
        self.geocodeAddressView.setAddress("");
      }
    });

    // After reverse geocoding, the map view will fire a reversegeocode
    // event. This should only happen when adding a place while geocoding
    // is enabled.
    $(Shareabouts).on("reversegeocode", function(evt, locationData) {
      var locationString = Handlebars.templates["location-string"](
        locationData,
      );
      self.geocodeAddressView.setAddress($.trim(locationString));
      self.placeFormView.geocodeAddressPlaceView.setAddress(
        $.trim(locationString),
      );
      self.placeFormView.setLatLng(locationData.latLng);
      // Don't pass location data into our geolocation's form field
      // self.placeFormView.setLocation(locationData);
    });

    // List view is enabled by default (undefined) or by enabling it
    // explicitly. Set it to a falsey value to disable activity.
    if (
      _.isUndefined(Shareabouts.Config.flavor.app.list_enabled) ||
      Shareabouts.Config.flavor.app.list_enabled
    ) {
      this.listView = new PlaceListView({
        el: "#list-container",
        placeCollections: self.places,
        placeConfig: this.options.placeConfig,
      }).render();
    }

    // Cache panel elements that we use a lot
    this.$panel = $("#content");
    this.$panelContent = $("#content article");
    this.$panelCloseBtn = $(".close-btn");
    this.$centerpoint = $("#centerpoint");
    this.$addButton = $("#add-place-btn-container");

    // Bind to map move events so we can style our center points
    // with utmost awesomeness.
    this.mapView.map.on("zoomend", this.onMapZoomEnd, this);
    this.mapView.map.on("movestart", this.onMapMoveStart, this);
    this.mapView.map.on("moveend", this.onMapMoveEnd, this);
    // For knowing if the user has moved the map after opening the form.
    this.mapView.map.on("dragend", this.onMapDragEnd, this);

    // If report stories are enabled, build the data structure
    // we need to enable story navigation
    _.each(this.options.storyConfig, function(story) {
      var storyStructure = {},
        totalStoryElements = story.order.length;
      _.each(story.order, function(config, i) {
        storyStructure[config.url] = {
          zoom: config.zoom || story.default_zoom,
          hasCustomZoom: config.zoom ? true : false,
          panTo: config.panTo || null,
          visibleLayers: config.visible_layers || story.default_visible_layers,
          previous:
            story.order[(i - 1 + totalStoryElements) % totalStoryElements].url,
          next: story.order[(i + 1) % totalStoryElements].url,
          basemap: config.basemap || story.default_basemap,
          spotlight: config.spotlight === false ? false : true,
          sidebarIconUrl: config.sidebar_icon_url,
        };
      });
      story.order = storyStructure;
    });

    // This is the "center" when the popup is open
    this.offsetRatio = { x: 0.2, y: 0.0 };

    _.each(this.places, function(value, key) {
      self.placeDetailViews[key] = {};
    });

    _.each(this.landmarks, function(value, key) {
      self.landmarkDetailViews[key] = {};
    });

    // Show tools for adding data
    this.setBodyClass();
    this.showCenterPoint();

    // Load places from the API
    this.loadPlaces(placeParams);

    // Load landmarks from the API
    this.loadLandmarks();

    // Load activities from the API
    _.each(this.activities, function(collection, key) {
      collection.fetch({
        reset: true,
        attribute: "target",
        attributesToAdd: {
          datasetId: _.find(self.options.mapConfig.layers, function(layer) {
            return layer.id == key;
          }).id,
          datasetSlug: _.find(self.options.mapConfig.layers, function(layer) {
            return layer.id == key;
          }).slug,
        },
      });
    });

    if (this.options.rightSidebarConfig.show) {
      $("body").addClass("right-sidebar-active");
      if (this.options.rightSidebarConfig.visibleDefault) {
        $("body").addClass("right-sidebar-visible");
      }

      new RightSidebarView({
        el: "#right-sidebar-container",
        router: this.options.router,
        rightSidebarConfig: this.options.rightSidebarConfig,
        placeConfig: this.options.placeConfig,
        layers: this.options.mapConfig.layers,
        storyConfig: this.options.storyConfig,
        activityConfig: this.options.activityConfig,
        activityView: this.activityView,
        appView: this,
        layerViews: this.mapView.layerViews,
      }).render();
    }
  },

  getListRoutes: function() {
    // Return a list of the routes that are allowed to show the list view.
    // Navigating to any other route will automatically hide the list view.
    return ["showList", "filterMap"];
  },

  isAddingPlace: function(model) {
    return this.$panel.is(":visible") && this.$panel.hasClass("place-form");
  },
  loadLandmarks: function() {
    var self = this;

    // loop through landmark configs
    _.each(_.values(this.options.datasetConfigs.landmarks), function(
      landmarkConfig,
    ) {
      self.mapView.map.fire("layer:loading", {id: landmarkConfig.id});
      if (landmarkConfig.placeType) {
        var deferred = self.landmarks[landmarkConfig.id].fetch({
          attributesToAdd: { location_type: landmarkConfig.placeType },
          success: function() {
            self.mapView.map.fire("layer:loaded", {id: landmarkConfig.id});
          },
          error: function() {
            self.mapView.map.fire("layer:error", {id: landmarkConfig.id});
          }
        });
        Shareabouts.deferredCollections.push(deferred);
      } else {
        var deferred = self.landmarks[landmarkConfig.id].fetch({
          success: function() {
            self.mapView.map.fire("layer:loaded", {id: landmarkConfig.id});
          },
          error: function() {
            self.mapView.map.fire("layer:error", {id: landmarkConfig.id});
          }
        });
        Shareabouts.deferredCollections.push(deferred);
      }
    });
  },
  loadPlaces: function(placeParams) {
    var self = this,
      $progressContainer = $("#map-progress"),
      $currentProgress = $("#map-progress .current-progress"),
      pageSize,
      totalPages,
      pagesComplete = 0;

    // loop over all place collections
    _.each(self.places, function(collection, key) {
      self.mapView.map.fire("layer:loading", {id: key});
      var deferred = collection.fetchAllPages({
        remove: false,
        // Check for a valid location type before adding it to the collection
        validate: true,
        data: placeParams,
        // get the dataset slug and id from the array of map layers
        attributesToAdd: {
          datasetSlug: _.find(self.options.mapConfig.layers, function(layer) {
            return layer.id == key;
          }).slug,
          datasetId: _.find(self.options.mapConfig.layers, function(layer) {
            return layer.id == key;
          }).id,
        },
        attribute: "properties",

        // Only do this for the first page...
        pageSuccess: _.once(function(collection, data) {
          pageSize = data.features.length;
          totalPages = Math.ceil(data.metadata.length / pageSize);

          if (data.metadata.next) {
            $progressContainer.show();
          }
        }),

        // Do this for every page...
        pageComplete: function() {
          var percent;

          pagesComplete++;
          percent = pagesComplete / totalPages * 100;
          $currentProgress.width(percent + "%");

          if (pagesComplete === totalPages) {
            _.delay(function() {
              $progressContainer.hide();
            }, 2000);
          }
        },

        success: function() {
          self.mapView.map.fire("layer:loaded", {id: key});
        },

        error: function() {
          self.mapView.map.fire("layer:error", {id: key});
        }
      });
      Shareabouts.deferredCollections.push(deferred);
    });
  },

  setPlaceFormViewLatLng: function(centerLatLng) {
    if (this.placeFormView) {
      this.placeFormView.setLatLng(centerLatLng);
    }
  },
  onMapZoomEnd: function(evt) {
    if (
      this.hasBodyClass("content-visible") === true &&
      !this.isProgrammaticZoom
    ) {
      this.hideSpotlightMask();
    }
    this.isProgrammaticZoom = false;
  },
  onMapMoveStart: function(evt) {
    this.$centerpoint.addClass("dragging");
  },
  onMapMoveEnd: function(evt) {
    var ll = this.mapView.map.getCenter(),
      zoom = this.mapView.map.getZoom();

    this.$centerpoint.removeClass("dragging");

    // Never set the placeFormView's latLng until the user does it with a
    // drag event (below)
    if (this.placeFormView && this.placeFormView.center) {
      this.setPlaceFormViewLatLng(ll);
    }

    if (this.hasBodyClass("content-visible") === false) {
      this.setLocationRoute(zoom, ll.lat, ll.lng);
    }
  },
  onMapDragEnd: function(evt) {
    if (this.hasBodyClass("content-visible") === true) {
      this.hideSpotlightMask();
    }
    this.setPlaceFormViewLatLng(this.mapView.map.getCenter());
  },
  onClickAddPlaceBtn: function(evt) {
    evt.preventDefault();
    Util.log("USER", "map", "new-place-btn-click");
    this.options.router.navigate("/new", { trigger: true });
  },
  onClickClosePanelBtn: function(evt) {
    evt.preventDefault();

    Util.log("USER", "panel", "close-btn-click");
    // remove map mask if the user closes the side panel
    this.hideSpotlightMask();
    if (this.mapView.locationTypeFilter) {
      this.options.router.navigate(
        "filter/" + this.mapView.locationTypeFilter,
        { trigger: true },
      );
      this.hidePanel();
    } else {
      this.options.router.navigate("/", { trigger: true });
    }

    if (this.isStoryActive) {
      this.isStoryActive = false;
      this.restoreDefaultLayerVisibility();
    }
  },
  onToggleSidebarVisibility: function() {
    $("body").toggleClass("right-sidebar-visible");
    this.mapView.map.invalidateSize();
  },
  setBodyClass: function(/* newBodyClasses */) {
    var bodyClasses = [
      "content-visible",
      "place-form-visible",
      "page-visible",
      "content-expanded",
      "content-expanded-mid",
    ],
      newBodyClasses = Array.prototype.slice.call(arguments, 0),
      i,
      $body = $("body");

    for (i = 0; i < bodyClasses.length; ++i) {
      $body.removeClass(bodyClasses[i]);
    }
    for (i = 0; i < newBodyClasses.length; ++i) {
      // If the newBodyClass isn't among the ones that will be cleared
      // (bodyClasses), then we probably don't want to use this method and
      // should fail loudly.
      if (_.indexOf(bodyClasses, newBodyClasses[i]) === -1) {
        Util.console.error(
          "Setting an unrecognized body class.\nYou should probably just use jQuery directly.",
        );
      }
      $body.addClass(newBodyClasses[i]);
    }
  },
  hasBodyClass: function(className) {
    return $("body").hasClass(className);
  },
  conditionallyReverseGeocode: function() {
    if (this.options.mapConfig.geocoding_enabled) {
      this.mapView.reverseGeocodeMapCenter();
    }
  },
  onRemovePlace: function(model) {
    if (this.placeDetailViews[model.cid]) {
      this.placeDetailViews[model.cid].remove();
      delete this.placeDetailViews[model.cid];
    }
  },

  // TODO: clean up landmark/place distinction here
  getLandmarkDetailView: function(collectionId, model) {
    var landmarkDetailView;
    if (
      this.landmarkDetailViews[collectionId] &&
      this.landmarkDetailViews[collectionId][model.id]
    ) {
      landmarkDetailView = this.landmarkDetailViews[collectionId][model.id];
    } else {
      landmarkDetailView = new LandmarkDetailView({
        model: model,
        description: model.get("properties")["description"],
        originalDescription: model.get("properties")["originalDescription"],
        mapConfig: this.options.mapConfig,
        mapView: this.mapView,
        router: this.options.router,
      });
      this.landmarkDetailViews[collectionId][model.id] = landmarkDetailView;
    }
    return landmarkDetailView;
  },
  getPlaceDetailView: function(model, layerView) {
    var placeDetailView;
    if (this.placeDetailViews[model.cid]) {
      placeDetailView = this.placeDetailViews[model.cid];
    } else {
      placeDetailView = new PlaceDetailView({
        model: model,
        appView: this,
        layerView: layerView,
        surveyConfig: this.options.surveyConfig,
        supportConfig: this.options.supportConfig,
        placeConfig: this.options.placeConfig,
        storyConfig: this.options.storyConfig,
        mapConfig: this.options.mapConfig,
        placeTypes: this.options.placeTypes,
        userToken: this.options.userToken,
        mapView: this.mapView,
        geometryEditorView: this.mapView.geometryEditorView,
        router: this.options.router,
        datasetId: _.find(this.options.mapConfig.layers, function(layer) {
          return layer.slug == model.attributes.datasetSlug;
        }).id,
        collectionsSet: {
          places: this.places,
          landmarks: this.landmarks,
        },
      });
      this.placeDetailViews[model.cid] = placeDetailView;
    }

    return placeDetailView;
  },
  setLocationRoute: function(zoom, lat, lng) {
    this.options.router.navigate(
      "/" +
        zoom +
        "/" +
        parseFloat(lat).toFixed(5) +
        "/" +
        parseFloat(lng).toFixed(5),
    );
  },

  viewMap: function(zoom, lat, lng) {
    var self = this,
      ll;

    // If the map locatin is part of the url already
    if (zoom && lat && lng) {
      ll = L.latLng(parseFloat(lat), parseFloat(lng));

      // Why defer? Good question. There is a mysterious race condition in
      // some cases where the view fails to set and the user is left in map
      // limbo. This condition is seemingly eliminated by defering the
      // execution of this step.
      _.defer(function() {
        self.mapView.map.setView(ll, parseInt(zoom, 10));
      });
    }

    this.hidePanel();
    this.hideNewPin();
    this.destroyNewModels();
    this.setBodyClass();
  },
  newPlace: function() {
    var self = this;

    if (!this.placeFormView) {
      this.placeFormView = new PlaceFormView({
        appView: this,
        router: this.options.router,
        placeConfig: this.options.placeConfig,
        mapConfig: this.options.mapConfig,
        userToken: this.options.userToken,
        geometryEditorView: this.mapView.geometryEditorView,
        collectionsSet: {
          places: this.places,
          landmarks: this.landmarks,
        },
      });
    }

    this.$panel.removeClass().addClass("place-form");
    this.showPanel(this.placeFormView.render(false).$el);
    this.placeFormView.delegateEvents();
    this.showNewPin();
    this.setBodyClass("content-visible", "place-form-visible");

    if (this.options.placeConfig.default_basemap) {
      this.setLayerVisibility(this.options.placeConfig.default_basemap, true, true);
    }
  },

  // If a model has a story object, set the appropriate layer
  // visilbilities and update legend checkboxes
  setStoryLayerVisibility: function(model) {
    // change the basemap if it's been set in the story config
    if (model.get("story").basemap) {
      this.setLayerVisibility(model.get("story").basemap, true, true);
    }

    // set layer visibility based on story config
    _.each(
      model.get("story").visibleLayers,
      function(targetLayer) {
        this.setLayerVisibility(targetLayer, true, false);
      },
      this,
    );

    // switch off all other layers
    _.each(
      this.options.mapConfig.layers,
      function(targetLayer) {
        if (!_.contains(model.attributes.story.visibleLayers, targetLayer.id)) {
          // don't turn off basemap layers!
          if (targetLayer.type !== "basemap") {
            this.setLayerVisibility(targetLayer.id, false, false);
          }
        }
      },
      this,
    );
  },

  restoreDefaultLayerVisibility: function() {
    var gisLayersPanel = _.find(this.options.sidebarConfig.panels, function(
      panel,
    ) {
      return panel.id === "gis-layers";
    }),
      defaultBasemapId = _.find(gisLayersPanel.basemaps, function(basemap) {
        return basemap.visibleDefault === true;
      }).id;

    this.setLayerVisibility(defaultBasemapId, true, true);

    _.each(
      gisLayersPanel.groupings,
      function(grouping) {
        _.each(
          grouping.layers,
          function(layer) {
            this.setLayerVisibility(
              layer.id,
              layer.visibleDefault ? true : false,
              false,
            );
          },
          this,
        );
      },
      this,
    );
  },

  ensureLayerVisibility: function(datasetId) {
    this.setLayerVisibility(datasetId, true, false);
  },

  setLayerVisibility: function(id, isVisible, isBasemap) {
    $(Shareabouts).trigger("visibility", [id, isVisible, isBasemap]);
    $("#map-" + id).prop("checked", isVisible);
  },

  viewPlaceOrLandmark: function(args) {
    var self = this,
      layout = Util.getPageLayout();

    Util.getPlaceFromCollections(
      {
        places: this.places,
        landmarks: this.landmarks,
      },
      args,
      this.options.mapConfig,
      {
        onFound: _.bind(onFound, this),
        onNotFound: _.bind(onNotFound, this),
      },
    );

    function onFound(model, type, datasetId) {
      var map = self.mapView.map,
        layer,
        center,
        zoom,
        detailView,
        $responseToScrollTo;

      if (type === "place") {
        // If this model is a duplicate of one that already exists in the
        // places collection, it may not correspond to a layerView. For this
        // case, get the model that's actually in the places collection.
        if (_.isUndefined(self.mapView.layerViews[model.cid])) {
          model = self.places[datasetId].get(model.id);
        }

        // TODO: We need to handle the non-deterministic case when
        // 'self.mapView.layerViews[datasetId][model.cid]` is undefined
        if (
          self.mapView.layerViews[datasetId] &&
          self.mapView.layerViews[datasetId][model.cid]
        ) {
          layer = self.mapView.layerViews[datasetId][model.cid].layer;
        }

        detailView = self
          .getPlaceDetailView(
            model,
            self.mapView.layerViews[datasetId][model.cid],
          );

        self.showPanel(detailView.render().$el, !!args.responseId, detailView);
        detailView.delegateEvents();
      } else if (type === "landmark") {
        layer = self.mapView.layerViews[datasetId][model.id].layer;
        detailView = self
          .getLandmarkDetailView(datasetId, model);

        self.showPanel(detailView.render().$el, false, detailView);
      }

      self.hideNewPin();
      self.destroyNewModels();
      self.hideCenterPoint();
      self.setBodyClass("content-visible");
      self.showSpotlightMask();

      if (layer) {
        center = layer.getLatLng
          ? layer.getLatLng()
          : layer.getBounds().getCenter();
        zoom = map.getZoom();

        self.ensureLayerVisibility(datasetId);

        if (model.get("story")) {
          if (!model.get("story").spotlight) {
            self.hideSpotlightMask();
          }
          self.isStoryActive = true;
          self.isProgrammaticZoom = true;
          self.setStoryLayerVisibility(model);
          center = model.get("story").panTo || center;
          zoom = model.get("story").zoom;
        }

        if (layer.getLatLng) {
          map.setView(center, zoom, {
            animate: true,
          });
        } else {
          // If we've defined a custom zoom for a polygon layer for some reason,
          // don't use fitBounds and instead set the zoom defined
          if (model.get("story") && model.get("story").hasCustomZoom) {
            map.setView(center, model.get("story").zoom, {
              animate: true,
            });
          } else {
            map.fitBounds(layer.getBounds(), {
              animate: true,
            });
          }
        }
      }

      if (args.responseId) {
        $responseToScrollTo = detailView.$el.find(
          '[data-response-id="' + args.responseId + '"]',
        );
        if ($responseToScrollTo.length > 0) {
          if (layout === '"desktop"') {
            // For desktop, the panel content is scrollable
            self.$panelContent.scrollTo($responseToScrollTo, 500);
          } else {
            // For mobile, it's the window
            $(window).scrollTo($responseToScrollTo, 500);
          }
        }
      }

      model.trigger("focus");

      if (!model.get("story") && self.isStoryActive) {
        self.isStoryActive = false;
        self.restoreDefaultLayerVisibility();
      }
    }

    function onNotFound() {
      self.options.router.navigate("/");
      return;
    }
  },

  viewPage: function(slug) {
    var pageConfig = Util.findPageConfig(this.options.pagesConfig, {
      slug: slug,
    }),
      pageTemplateName = "pages/" + (pageConfig.name || pageConfig.slug),
      pageHtml = Handlebars.templates[pageTemplateName]({
        config: this.options.config,
      });

    this.$panel.removeClass().addClass("page page-" + slug);
    this.showPanel(pageHtml);
    this.hideNewPin();
    this.destroyNewModels();
    this.hideCenterPoint();
    this.setBodyClass("content-visible", "content-expanded");
  },

  showPanel: function(markup, preventScrollToTop, detailView) {
    var map = this.mapView.map;

    this.unfocusAllPlaces();
    this.$panelContent.html(markup);
    this.$panel.show();
    detailView && detailView.delegateEvents();

    if (!preventScrollToTop) {
      // will be "mobile" or "desktop", as defined in default.css
      var layout = Util.getPageLayout();
      if (layout === "desktop") {
        // For desktop, the panel content is scrollable
        this.$panelContent.scrollTo(0, 0);
      } else {
        // Scroll to the top of window when showing new content on mobile. Does
        // nothing on desktop. (Except when embedded in a scrollable site.)
        window.scrollTo(0, 0);
      }
    }

    this.setBodyClass("content-visible");

    // Set a very short timeout here to hopefully avoid a race condition
    // between the CSS transition that resizes the map container and
    // invalidateSize(). Otherwise, invalidateSize() may fire before the new
    // map container dimensions have been set by CSS, resulting in the
    // infamous off-center bug.
    // NOTE: the timeout duration in use here was arbitrarily selected.
    setTimeout(function() {
      map.invalidateSize({ animate:true, pan:true });
    }, 1);

    $(Shareabouts).trigger("panelshow", [
      this.options.router,
      Backbone.history.getFragment(),
    ]);

    $("#main-btns-container").attr("class", "pos-top-left");

    Util.log("APP", "panel-state", "open");
  },
  showNewPin: function() {
    this.$centerpoint.show().addClass("newpin");

    this.showSpotlightMask();
  },
  showAddButton: function() {
    this.$addButton.show();
  },
  hideAddButton: function() {
    this.$addButton.hide();
  },
  showCenterPoint: function() {
    this.$centerpoint.show().removeClass("newpin");
  },
  hideCenterPoint: function() {
    this.$centerpoint.hide();
  },
  hidePanel: function() {
    var map = this.mapView.map;

    this.unfocusAllPlaces();
    this.$panel.hide();
    this.setBodyClass();
    map.invalidateSize({ animate: true, pan: true });

    $("#main-btns-container").attr("class", "pos-top-left");

    Util.log("APP", "panel-state", "closed");
    this.hideSpotlightMask();
  },
  hideNewPin: function() {
    this.showCenterPoint();
  },
  showSpotlightMask: function() {
    $("#spotlight-mask").show();
  },
  hideSpotlightMask: function() {
    $("#spotlight-mask").hide();
  },
  unfocusAllPlaces: function() {
    // Unfocus all of the place markers
    _.each(this.places, function(collection) {
      collection.each(function(model) {
        if (!model.isNew()) {
          model.trigger("unfocus");
        }
      });
    });

    // Unfocus all of the landmark markers
    _.each(this.landmarks, function(collection) {
      collection.each(function(model) {
        if (!model.isNew()) {
          model.trigger("unfocus");
        }
      });
    });
  },
  destroyNewModels: function() {
    _.each(this.places, function(collection) {
      collection.each(function(model) {
        if (model && model.isNew()) {
          model.destroy();
        }
      });
    });

    _.each(this.landmarks, function(collection) {
      collection.each(function(model) {
        if (model && model.isNew()) {
          model.destroy();
        }
      });
    });
  },

  render: function() {
    this.mapView.render();
  },
  showListView: function() {
    // Re-sort if new places have come in
    this.listView.sort();
    // Show
    this.listView.$el.addClass("is-exposed");
    $(".show-the-list").addClass("is-visuallyhidden");
    $(".show-the-map").removeClass("is-visuallyhidden");
  },
  hideListView: function() {
    this.listView.$el.removeClass("is-exposed");
    $(".show-the-list").removeClass("is-visuallyhidden");
    $(".show-the-map").addClass("is-visuallyhidden");
  },
  toggleListView: function() {
    if (this.listView.isVisible()) {
      this.options.router.navigate("/", { trigger: true });
    } else {
      this.options.router.navigate("list", { trigger: true });
    }
    this.mapView.clearFilter();
  },
});

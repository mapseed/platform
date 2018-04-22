// REACT PORT SECTION //////////////////////////////////////////////////////////
import React from "react";
import ReactDOM from "react-dom";
import emitter from "../../utils/emitter";
import languageModule from "../../language-module";

import InputForm from "../../components/input-form";
import VVInputForm from "../../components/vv-input-form";
import PlaceDetail from "../../components/place-detail";
import FormCategoryMenuWrapper from "../../components/input-form/form-category-menu-wrapper";
import GeocodeAddressBar from "../../components/geocode-address-bar";

import transformCommonFormElements from "../../utils/common-form-elements";
// END REACT PORT SECTION //////////////////////////////////////////////////////

var Util = require("../utils.js");

// Views
var MapView = require("mapseed-map-view");
var PagesNavView = require("mapseed-pages-nav-view");
var AuthNavView = require("mapseed-auth-nav-view");
var PlaceListView = require("mapseed-place-list-view");
var SidebarView = require("mapseed-sidebar-view");
var ActivityView = require("mapseed-activity-view");
var PlaceCounterView = require("mapseed-place-counter-view");
var RightSidebarView = require("mapseed-right-sidebar-view");
var FilterMenuView = require("mapseed-filter-menu-view");

// Spinner options -- these need to be own modules
Shareabouts.bigSpinnerOptions = {
  lines: 13,
  length: 0,
  width: 10,
  radius: 30,
  corners: 1,
  rotate: 0,
  direction: 1,
  color: "#000",
  speed: 1,
  trail: 60,
  shadow: false,
  hwaccel: false,
  className: "spinner",
  zIndex: 2e9,
  top: "auto",
  left: "auto",
};

Shareabouts.smallSpinnerOptions = {
  lines: 13,
  length: 0,
  width: 3,
  radius: 10,
  corners: 1,
  rotate: 0,
  direction: 1,
  color: "#000",
  speed: 1,
  trail: 60,
  shadow: false,
  hwaccel: false,
  className: "spinner",
  zIndex: 2e9,
  top: "auto",
  left: "auto",
};

module.exports = Backbone.View.extend({
  events: {
    "click #add-place": "onClickAddPlaceBtn",
    "click .close-btn": "onClickClosePanelBtn",
    "click .collapse-btn": "onToggleSidebarVisibility",
    "click .list-toggle-btn": "toggleListView",
  },
  initialize: function() {
    // store promises returned from collection fetches
    Shareabouts.deferredCollections = [];

    languageModule.changeLanguage(this.options.languageCode);

    var self = this,
      // Only include submissions if the list view is enabled (anything but false)
      includeSubmissions = this.options.appConfig.list_enabled !== false,
      placeParams = {
        // NOTE: this is to simply support the list view. It won't
        // scale well, so let's think about a better solution.
        include_submissions: includeSubmissions,
      };

    // REACT PORT SECTION //////////////////////////////////////////////////////
    this.options.placeConfig.place_detail = transformCommonFormElements(
      this.options.placeConfig.place_detail,
      this.options.placeConfig.common_form_elements,
    );
    // END REACT PORT SECTION //////////////////////////////////////////////////

    // Use the page size as dictated by the server by default, unless
    // directed to do otherwise in the configuration.
    if (this.options.appConfig.places_page_size) {
      placeParams.page_size = this.options.appConfig.places_page_size;
    }

    // Bootstrapped data from the page
    this.activities = this.options.activities;
    this.places = this.options.places;

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
      apiRoot: this.options.apiRoot,
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
      router: this.options.router,
      placeTypes: this.options.placeTypes,
      cluster: this.options.cluster,
      placeConfig: this.options.placeConfig,
    });

    if (self.options.sidebarConfig.enabled) {
      new SidebarView({
        el: "#sidebar-container",
        mapView: this.mapView,
        sidebarConfig: this.options.sidebarConfig,
        placeConfig: this.options.placeConfig,
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
        placeConfig: this.options.placeConfig,
        router: this.options.router,
        placeTypes: this.options.placeTypes,
        surveyConfig: this.options.surveyConfig,
        supportConfig: this.options.supportConfig,
        mapConfig: this.options.mapConfig,
        // How often to check for new content
        interval: this.options.activityConfig.interval || 30000,
      });
    }

    // REACT PORT SECTION /////////////////////////////////////////////////////
    if (this.options.mapConfig.geocoding_bar_enabled) {
      ReactDOM.render(
        <GeocodeAddressBar mapConfig={this.options.mapConfig} />,
        document.getElementById("geocode-address-bar"),
      );
    }
    // END REACT PORT SECTION /////////////////////////////////////////////////

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

    // REACT PORT SECTION //////////////////////////////////////////////////////
    emitter.addListener("geocode", locationData => {
      this.mapView.zoomInOn(locationData.latLng);
    });
    // END REACT PORT SECTION //////////////////////////////////////////////////

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

    if (
      _.isUndefined(this.options.appConfig.list_enabled) ||
      this.options.appConfig.list_enabled
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

    // Show tools for adding data
    this.setBodyClass();
    this.showCenterPoint();

    // Load places from the API
    this.loadPlaces(placeParams);

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
  loadPlaces: function(placeParams) {
    var self = this,
      $progressContainer = $("#map-progress"),
      $currentProgress = $("#map-progress .current-progress"),
      pageSize,
      totalPages,
      pagesComplete = 0;

    // loop over all place collections
    _.each(self.places, function(collection, key) {
      self.mapView.map.fire("layer:loading", { id: key });
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
          self.mapView.map.fire("layer:loaded", { id: key });
        },

        error: function() {
          self.mapView.map.fire("layer:error", { id: key });
        },
      });
      Shareabouts.deferredCollections.push(deferred);
    });
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

    if (this.hasBodyClass("content-visible") === false) {
      this.setLocationRoute(zoom, ll.lat, ll.lng);
    }
  },
  onMapDragEnd: function(evt) {
    if (this.hasBodyClass("content-visible") === true) {
      this.hideSpotlightMask();
    }
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

    // REACT PORT SECTION //////////////////////////////////////////////////////
    // NOTE: This wrapper component is temporary, and will be factored out
    // when the AppView is ported.
    ReactDOM.render(
      <FormCategoryMenuWrapper
        hideSpotlightMask={this.hideSpotlightMask.bind(this)}
        hideCenterPoint={this.hideCenterPoint.bind(this)}
        showNewPin={this.showNewPin.bind(this)}
        hideNewPin={this.hideNewPin.bind(this)}
        hidePanel={this.hidePanel.bind(this)}
        map={this.mapView.map}
        places={this.places}
        router={this.options.router}
        customHooks={this.options.customHooks}
        container={document.querySelector("#content article")}
        render={(state, props) => {
          if (
            props.customComponents &&
            props.customComponents.InputForm === "VVInputForm"
          ) {
            return (
              <VVInputForm
                {...props}
                selectedCategory={state.selectedCategory}
              />
            );
          } else {
            return (
              <InputForm {...props} selectedCategory={state.selectedCategory} />
            );
          }
        }}
        customComponents={this.options.customComponents}
      />,
      document.querySelector("#content article"),
    );

    this.$panel.removeClass().addClass("place-form");
    this.$panel.show();
    this.setBodyClass("content-visible", "content-expanded");
    this.mapView.map.invalidateSize({ animate: true, pan: true });
    // END REACT PORT SECTION //////////////////////////////////////////////////

    this.setBodyClass("content-visible", "place-form-visible");

    if (this.options.placeConfig.default_basemap) {
      this.setLayerVisibility(
        this.options.placeConfig.default_basemap,
        true,
        true,
      );
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
          // but don't turn off basemap layers!
          if (
            !this.basemapConfigs
              .map(config => config.id)
              .includes(targetLayer.id)
          ) {
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

        // REACT PORT SECTION //////////////////////////////////////////////////
        this.unfocusAllPlaces();
        ReactDOM.unmountComponentAtNode(
          document.querySelector("#content article"),
        );

        ReactDOM.render(
          <PlaceDetail
            container={document.querySelector("#content article")}
            currentUser={Shareabouts.bootstrapped.currentUser}
            isGeocodingBarEnabled={this.options.mapConfig.geocoding_bar_enabled}
            map={this.mapView.map}
            model={model}
            appView={this}
            layerView={this.mapView.layerViews[datasetId][model.cid]}
            places={this.places}
            scrollToResponseId={args.responseId}
            router={this.options.router}
            userToken={this.options.userToken}
          />,
          document.querySelector("#content article"),
        );

        this.$panel.show();
        this.setBodyClass("content-visible", "content-expanded");
        this.mapView.map.invalidateSize({ animate: true, pan: true });

        $("#main-btns-container").addClass(
          this.options.placeConfig.add_button_location || "pos-top-left",
        );
        // END REACT PORT SECTION //////////////////////////////////////////////
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
      pageTemplateName = pageConfig.name || pageConfig.slug,
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

  showPanel: function(markup, preventScrollToTop) {
    var map = this.mapView.map;

    this.unfocusAllPlaces();

    // REACT PORT SECTION //////////////////////////////////////////////////////
    ReactDOM.unmountComponentAtNode(document.querySelector("#content article"));
    // END REACT PORT SECTION //////////////////////////////////////////////////

    this.$panelContent.html(markup);
    this.$panel.show();

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
      map.invalidateSize({ animate: true, pan: true });
    }, 1);

    $(Shareabouts).trigger("panelshow", [
      this.options.router,
      Backbone.history.getFragment(),
    ]);

    $("#main-btns-container").addClass(
      this.options.placeConfig.add_button_location || "pos-top-left",
    );

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

    // REACT PORT SECTION //////////////////////////////////////////////////////
    ReactDOM.unmountComponentAtNode(document.querySelector("#content article"));
    // END REACT PORT SECTION //////////////////////////////////////////////////

    this.$panel.hide();
    this.setBodyClass();
    map.invalidateSize({ animate: true, pan: true });

    $("#main-btns-container").addClass(
      this.options.placeConfig.add_button_location || "pos-top-left",
    );

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
  },
  destroyNewModels: function() {
    _.each(this.places, function(collection) {
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
    if (this.listView && this.listView.isVisible()) {
      this.options.router.navigate("/", { trigger: true });
    } else {
      this.options.router.navigate("list", { trigger: true });
    }
    this.mapView.clearFilter();
  },
});

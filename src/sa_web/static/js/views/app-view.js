/*globals _ jQuery L Backbone Handlebars */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  // Spinner options
  S.bigSpinnerOptions = {
    lines: 13, length: 0, width: 10, radius: 30, corners: 1, rotate: 0,
    direction: 1, color: '#000', speed: 1, trail: 60, shadow: false,
    hwaccel: false, className: 'spinner', zIndex: 2e9, top: 'auto',
    left: 'auto'
  };

  S.smallSpinnerOptions = {
    lines: 13, length: 0, width: 3, radius: 10, corners: 1, rotate: 0,
    direction: 1, color: '#000', speed: 1, trail: 60, shadow: false,
    hwaccel: false, className: 'spinner', zIndex: 2e9, top: 'auto',
    left: 'auto'
  };

  S.AppView = Backbone.View.extend({
    events: {
      'click #add-place': 'onClickAddPlaceBtn',
      'click .close-btn': 'onClickClosePanelBtn'
    },
    initialize: function(){
      var self = this,
          // Only include submissions if the list view is enabled (anything but false)
          includeSubmissions = S.Config.flavor.app.list_enabled !== false,
          placeParams = {
            // NOTE: this is to simply support the list view. It won't
            // scale well, so let's think about a better solution.
            include_submissions: includeSubmissions
          };

      // Use the page size as dictated by the server by default, unless
      // directed to do otherwise in the configuration.
      if (S.Config.flavor.app.places_page_size) {
        placeParams.page_size = S.Config.flavor.app.places_page_size;
      }

      // Boodstrapped data from the page
      this.activities = this.options.activities;
      this.places = this.collection;
      this.landmarkCollections = this.options.landmarkCollections;

      $('body').ajaxError(function(evt, request, settings){
        $('#ajax-error-msg').show();
      });

      $('body').ajaxSuccess(function(evt, request, settings){
        $('#ajax-error-msg').hide();
      });

      $('.list-toggle-btn').click(function(evt){
        evt.preventDefault();
        self.toggleListView();
      });

      $(document).on('click', '.activity-item a', function(evt) {
        window.app.clearLocationTypeFilter();
      });

      // Globally capture clicks. If they are internal and not in the pass
      // through list, route them through Backbone's navigate method.
      $(document).on('click', 'a[href^="/"]', function(evt) {
        var $link = $(evt.currentTarget),
            href = $link.attr('href'),
            url;

        // Allow shift+click for new tabs, etc.
        if (($link.attr('rel') === 'internal' ||
             href === '/' ||
             href.indexOf(self.options.placeConfig.dataset_slug) === 0 ||
             href.indexOf('/filter') === 0) &&
             !evt.altKey && !evt.ctrlKey && !evt.metaKey && !evt.shiftKey) {
          evt.preventDefault();

          // Remove leading slashes and hash bangs (backward compatablility)
          url = href.replace(/^\//, '').replace('#!/', '');

          // # Instruct Backbone to trigger routing events
          self.options.router.navigate(url, {
            trigger: true
          });

          return false;
        }
      });

      // Handle collection events
      this.collection.on('add', this.onAddPlace, this);
      this.collection.on('remove', this.onRemovePlace, this);

      // On any route (/place or /page), hide the list view
      this.options.router.bind('route', function(route) {
        if (!_.contains(this.getListRoutes(), route) && this.listView && this.listView.isVisible()) {
          this.hideListView();
        }
      }, this);

      // Only append the tools to add places (if supported)
      $('#map-container').append(Handlebars.templates['add-places'](this.options.placeConfig));

      this.pagesNavView = (new S.PagesNavView({
              el: '#pages-nav-container',
              pagesConfig: this.options.pagesConfig,
              router: this.options.router
            })).render();

      this.authNavView = (new S.AuthNavView({
              el: '#auth-nav-container',
              router: this.options.router
            })).render();

      // Activity is enabled by default (undefined) or by enabling it
      // explicitly. Set it to a falsey value to disable activity.
      if (_.isUndefined(this.options.activityConfig.enabled) ||
        this.options.activityConfig.enabled) {
        // Init the view for displaying user activity
        this.activityView = new S.ActivityView({
          el: 'ul.recent-points',
          collection: this.activities,
          places: this.places,
          router: this.options.router,
          placeTypes: this.options.placeTypes,
          surveyConfig: this.options.surveyConfig,
          supportConfig: this.options.supportConfig,
          placeConfig: this.options.placeConfig,
          // How often to check for new content
          interval: this.options.activityConfig.interval || 30000
        });
      }

      // Init the map view to display the places
      this.mapView = new S.MapView({
        el: '#map',
        mapConfig: this.options.mapConfig,
        collection: this.collection,
        landmarkCollections: this.options.landmarkCollections,
        router: this.options.router,
        placeTypes: this.options.placeTypes,
        cluster: this.options.cluster
      });

      if (self.options.leafletSidebarConfig.enabled){
          (new S.LegendView({
          el: '#master-legend',
          mapView: this.mapView,
          items: this.options.sidebarConfig.panels.legend.items
        })).render();

        // GIS Layers (leaflet-sidebar-view.js, leaflet-sidebar-content.html)
        (new S.GISLegendView({
          el: '#gis-legend',
          mapView: this.mapView,
          groupings: this.options.sidebarConfig.panels.gis_layers.groupings
        })).render();
      }

      if (self.options.sidebarConfig.enabled) {
        // Start Master Legend
      }

      // Init the address search bar
      this.geocodeAddressView = (new S.GeocodeAddressView({
        el: '#geocode-address-bar',
        router: this.options.router,
        mapConfig: this.options.mapConfig
      })).render();

      // Init the place-counter
      this.placeCounterView = (new S.PlaceCounterView({
        el: '#place-counter',
        router: this.options.router,
        mapConfig: this.options.mapConfig,
        collection: this.collection
      })).render();

      // When the user chooses a geocoded address, the address view will fire
      // a geocode event on the namespace. At that point we center the map on
      // the geocoded location.
      $(S).on('geocode', function(evt, locationData) {
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
      $(S).on('mapdragend', function(evt) {
        if (self.isAddingPlace()) {
          self.conditionallyReverseGeocode();
        } else if (self.geocodeAddressView) {
          self.geocodeAddressView.setAddress('');
        }
      });

      // After reverse geocoding, the map view will fire a reversegeocode
      // event. This should only happen when adding a place while geocoding
      // is enabled.
      $(S).on('reversegeocode', function(evt, locationData) {
        var locationString = Handlebars.templates['location-string'](locationData);
        self.geocodeAddressView.setAddress($.trim(locationString));
        self.geocodeAddressPlaceView.setAddress($.trim(locationString));
        self.placeFormView.setLatLng(locationData.latLng);
        // Don't pass location data into our geolocation's form field
        // self.placeFormView.setLocation(locationData);
      });


      // List view is enabled by default (undefined) or by enabling it
      // explicitly. Set it to a falsey value to disable activity.
      if (_.isUndefined(S.Config.flavor.app.list_enabled) ||
        S.Config.flavor.app.list_enabled) {
          this.listView = new S.PlaceListView({
            el: '#list-container',
            collection: this.collection
          }).render();
      }

      // Cache panel elements that we use a lot
      this.$panel = $('#content');
      this.$panelContent = $('#content article');
      this.$panelCloseBtn = $('.close-btn');
      this.$centerpoint = $('#centerpoint');
      this.$addButton = $('#add-place-btn-container');

      // Bind to map move events so we can style our center points
      // with utmost awesomeness.
      this.mapView.map.on('movestart', this.onMapMoveStart, this);
      this.mapView.map.on('moveend', this.onMapMoveEnd, this);
      // For knowing if the user has moved the map after opening the form.
      this.mapView.map.on('dragend', this.onMapDragEnd, this);


      // This is the "center" when the popup is open
      this.offsetRatio = {x: 0.2, y: 0.0};

      // Caches of the views (one per place)
      this.placeFormView = null;
      this.placeDetailViews = {};
      this.landmarkDetailViews = {};
      _.each(Object.keys(this.landmarkCollections), function(collectionId) {
        self.landmarkDetailViews[collectionId] = {};
      });

      // Show tools for adding data
      this.setBodyClass();
      this.showCenterPoint();

      // Load places from the API
      this.loadPlaces(placeParams);

      // Load landmarks from the API
      this.loadLandmarks();

      // Fetch the first page of activity
      this.activities.fetch({
        reset: true,
        attribute: 'target',
        attributesToAdd: { datasetSlug: this.options.placeConfig.dataset_slug }
      });
    },

    getListRoutes: function() {
      // Return a list of the routes that are allowed to show the list view.
      // Navigating to any other route will automatically hide the list view.
      return ['showList', 'filterMap'];
    },

    isAddingPlace: function(model) {
      return this.$panel.is(":visible") && this.$panel.hasClass('place-form');
    },
    loadLandmarks: function() {
      var self = this;
      _.each(_.values(this.options.landmarkConfigs), function(landmarkConfig) {
        if (landmarkConfig.placeType) {
          self.landmarkCollections[landmarkConfig.id].fetch({
            attributesToAdd: { location_type: landmarkConfig.placeType }
          });
        } else {
          self.landmarkCollections[landmarkConfig.id].fetch();
        }
      });
    },
    loadPlaces: function(placeParams) {
      var self = this,
          $progressContainer = $('#map-progress'),
          $currentProgress = $('#map-progress .current-progress'),
          pageSize,
          totalPages,
          pagesComplete = 0;

      this.collection.fetchAllPages({
        remove: false,
        // Check for a valid location type before adding it to the collection
        validate: true,
        data: placeParams,
        attributesToAdd: { datasetSlug: this.options.placeConfig.dataset_slug },
        attribute: 'properties',

        success: function() {
          // Sort the list view after all of the pages have been fetched
          if (self.listView) {
            self.listView.sort();
            self.listView.updateSortLinks();
          }
        },

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
          percent = (pagesComplete/totalPages*100);
          $currentProgress.width(percent + '%');

          if (pagesComplete === totalPages) {
            _.delay(function() {
              $progressContainer.hide();
            }, 2000);
          }
        }
      });
    },

    setPlaceFormViewLatLng: function(centerLatLng) {
      if (this.placeFormView) {
        this.placeFormView.setLatLng(centerLatLng);
      }
    },
    onMapMoveStart: function(evt) {
      this.$centerpoint.addClass('dragging');
    },
    onMapMoveEnd: function(evt) {
      var ll = this.mapView.map.getCenter(),
          zoom = this.mapView.map.getZoom();

      this.$centerpoint.removeClass('dragging');

      // Never set the placeFormView's latLng until the user does it with a
      // drag event (below)
      if (this.placeFormView && this.placeFormView.center) {
        // remove map mask once the user has dragged and set a location
        $("#new-place-mask").remove();
        this.setPlaceFormViewLatLng(ll);
      }

      if (this.hasBodyClass('content-visible') === false) {
        this.setLocationRoute(zoom, ll.lat, ll.lng);
      }
    },
    onMapDragEnd: function(evt) {
      this.setPlaceFormViewLatLng(this.mapView.map.getCenter());
    },
    onClickAddPlaceBtn: function(evt) {
      evt.preventDefault();
      S.Util.log('USER', 'map', 'new-place-btn-click');
      this.options.router.navigate('/' + this.options.placeConfig.dataset_slug + '/new', {trigger: true});
    },
    onClickClosePanelBtn: function(evt) {
      evt.preventDefault();
      S.Util.log('USER', 'panel', 'close-btn-click');
      // remove map mask if the user closes the side panel
      $("#new-place-mask").remove();
      if (this.mapView.locationTypeFilter) {
        this.options.router.navigate('filter/' + this.mapView.locationTypeFilter, {trigger: true});
      } else {
        this.options.router.navigate('/', {trigger: true});
      }
    },
    // This gets called for every model that gets added to the place
    // collection, not just new ones.
    onAddPlace: function(model) {
      // If it's new, then show the form in order to edit and save it.
      if (model.isNew()) {

        this.placeFormView = new S.PlaceFormView({
          model: model,
          appView: this,
          router: this.options.router,
          defaultPlaceTypeName: this.options.defaultPlaceTypeName,
          placeTypes: this.options.placeTypes,
          placeConfig: this.options.placeConfig,
          userToken: this.options.userToken
        });

        this.$panel.removeClass().addClass('place-form');
        this.showPanel(this.placeFormView.render().$el);

//      Init the place form's address search bar
        this.geocodeAddressPlaceView = (new S.GeocodeAddressPlaceView({
          el: '#geocode-address-place-bar',
          router: this.options.router,
          mapConfig: this.options.mapConfig
        })).render();
        this.showNewPin();
        this.setBodyClass('content-visible', 'place-form-visible');
      }
    },
    setBodyClass: function(/* newBodyClasses */) {
      var bodyClasses = ['content-visible', 'place-form-visible'],
          newBodyClasses = Array.prototype.slice.call(arguments, 0),
          i, $body = $('body');

      for (i = 0; i < bodyClasses.length; ++i) {
        $body.removeClass(bodyClasses[i]);
      }
      for (i = 0; i < newBodyClasses.length; ++i) {
        // If the newBodyClass isn't among the ones that will be cleared
        // (bodyClasses), then we probably don't want to use this method and
        // should fail loudly.
        if (_.indexOf(bodyClasses, newBodyClasses[i]) === -1) {
          S.Util.console.error('Setting an unrecognized body class.\nYou should probably just use jQuery directly.');
        }
        $body.addClass(newBodyClasses[i]);
      }
    },
    hasBodyClass: function(className) {
      return $('body').hasClass(className);
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
    getLandmarkDetailView: function(collectionId, model) {
      var landmarkDetailView;
      if (this.landmarkDetailViews[collectionId] && this.landmarkDetailViews[collectionId][model.id]) {
        landmarkDetailView = this.landmarkDetailViews[collectionId][model.id];
      } else {
        landmarkDetailView = new S.LandmarkDetailView({
          description: model.get('properties')['description']
        });
        this.landmarkDetailViews[collectionId][model.id] = landmarkDetailView;
      }
      return landmarkDetailView;
    },
    getPlaceDetailView: function(model) {
      var placeDetailView;
      if (this.placeDetailViews[model.cid]) {
        placeDetailView = this.placeDetailViews[model.cid];
      } else {
        placeDetailView = new S.PlaceDetailView({
          model: model,
          surveyConfig: this.options.surveyConfig,
          supportConfig: this.options.supportConfig,
          placeConfig: this.options.placeConfig,
          placeTypes: this.options.placeTypes,
          userToken: this.options.userToken
        });
        this.placeDetailViews[model.cid] = placeDetailView;
      }

      return placeDetailView;
    },
    setLocationRoute: function(zoom, lat, lng) {
      this.options.router.navigate('/' + zoom + '/' +
        parseFloat(lat).toFixed(5) + '/' + parseFloat(lng).toFixed(5));
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
      // Called by the router
      this.collection.add({});
    },
    viewLandmark: function(model, options) {
      var self = this,
          includeSubmissions = S.Config.flavor.app.list_enabled !== false,
          layout = S.Util.getPageLayout(),
          onLandmarkFound, onLandmarkNotFound, modelId;

      onLandmarkFound = function(model, response, newOptions) {
        var map = self.mapView.map,
            layer, center, landmarkDetailView, $responseToScrollTo;
        options = newOptions ? newOptions : options;

        layer = self.mapView.landmarkLayerViews[options.collectionId][model.id].layer

        if (layer) {
          center = layer.getLatLng ? layer.getLatLng() : layer.getBounds().getCenter();
        }
        landmarkDetailView = self.getLandmarkDetailView(options.collectionId, model);

        self.$panel.removeClass().addClass('place-detail place-detail-' + model);
        self.showPanel(landmarkDetailView.render().$el, false);
        self.hideNewPin();
        self.destroyNewModels();
        self.hideCenterPoint();
        self.setBodyClass('content-visible');

        if (layer) {
          if (options.zoom) {
            if (layer.getLatLng) {
              map.setView(center, map.getMaxZoom()-1, {reset: true});
            } else {
              map.fitBounds(layer.getBounds());
            }

          } else {
            map.panTo(center, {animate: true});
          }
        }

        // Focus the one we're looking
        model.trigger('focus');
      };

      onLandmarkNotFound = function(model, response, newOptions) {
        console.log("appView.onLandmarkNotFound: model:", model);
        options.stillSearching[options.collectionId] = false;
        var allCollectionsSearched = true;
        _.each(_.values(options.stillSearching), function(stillSearching) {
          if (stillSearching) {
            allCollectionsSearched = false;
          }
        });
        if (allCollectionsSearched) {
          self.options.router.navigate('/');
        }
      };

      // If a collectionId is not specified, then we need to search all collections
      if (options['collectionId'] === undefined) {
        // First, let's check the caches of all of our collections for the
        // model to avoid making unnecessary api calls for each collection:
        var cachedModel;
        var collectionId;
        _.find(Object.keys(self.options.landmarkConfigs), function(landmarkConfigId) {
          collectionId = landmarkConfigId;
          cachedModel = self.landmarkCollections[landmarkConfigId].get(model);
          return cachedModel;
        });
        if (cachedModel) {
          onLandmarkFound(cachedModel, {}, { collectionId: collectionId,
                                          zoom: options.zoom });
          return;
        }

        // If the model is not already in our collections, then we must fetch it
        // by making a call to each collection:
        var stillSearching = {};
        _.each(self.options.landmarkConfigs, function(landmarkConfig) {
          stillSearching[landmarkConfig.id] = true;
        });
        _.each(self.options.landmarkConfigs, function(landmarkConfig) {
          self.viewLandmark(model, { collectionId: landmarkConfig.id,
                                     zoom: options.zoom,
                                     stillSearching: stillSearching });
        });
        return;
      }

      // If we are passed a LandmarkModel then show it immediately.
      if (model instanceof S.LandmarkModel) {
        onLandmarkFound(model)
        return;
      }

      // Otherwise, assume we have a model ID.
      modelId = model;
      var landmarkCollection = this.landmarkCollections[options.collectionId];
      if (!landmarkCollection) {
        onLandmarkNotFound();
        return;
      }
      model = landmarkCollection.get(modelId);

      // If the model was found in the landmarks, go ahead and use it.
      if (model) {
        onLandmarkFound(model);

      // Otherwise, fetch and use the result.
      } else {
        var placeId = self.options.landmarkConfigs[options.collectionId].placeType;
        landmarkCollection.fetch({
          success: function(collection, response, options) {
            var foundModel = collection.findWhere({ id: modelId });
            if (foundModel) {
              onLandmarkFound(foundModel);
            } else {
              onLandmarkNotFound();
            }
          },
          error: onLandmarkNotFound,
          attributesToAdd: { location_type: placeId }
        })
      }
    },
    viewPlace: function(model, responseId, zoom) {
      var self = this,
          includeSubmissions = S.Config.flavor.app.list_enabled !== false,
          layout = S.Util.getPageLayout(),
          onPlaceFound, onPlaceNotFound, modelId;

      onPlaceFound = function(model) {
        var map = self.mapView.map,
            layer, center, placeDetailView, $responseToScrollTo;

        // If this model is a duplicate of one that already exists in the
        // places collection, it may not correspond to a layerView. For this
        // case, get the model that's actually in the places collection.
        if (_.isUndefined(self.mapView.layerViews[model.cid])) {
          model = self.places.get(model.id);
        }

        layer = self.mapView.layerViews[model.cid].layer;
        placeDetailView = self.getPlaceDetailView(model);

        if (layer) {
          center = layer.getLatLng ? layer.getLatLng() : layer.getBounds().getCenter();
        }

        self.$panel.removeClass().addClass('place-detail place-detail-' + model.id);
        self.showPanel(placeDetailView.render().$el, !!responseId);
        self.hideNewPin();
        self.destroyNewModels();
        self.hideCenterPoint();
        self.setBodyClass('content-visible');

        if (layer) {
          if (zoom) {
            if (layer.getLatLng) {
              map.setView(center, map.getMaxZoom()-1, { reset: true });
            } else {
              map.fitBounds(layer.getBounds());
            }

          } else {
            map.panTo(center, {animate: true});
          }
        }

        if (responseId) {
          // get the element based on the id
          $responseToScrollTo = placeDetailView.$el.find('[data-response-id="'+ responseId +'"]');

          // call scrollIntoView()
          if ($responseToScrollTo.length > 0) {
            if (layout === 'desktop') {
              // For desktop, the panel content is scrollable
              self.$panelContent.scrollTo($responseToScrollTo, 500);
            } else {
              // For mobile, it's the window
              $(window).scrollTo($responseToScrollTo, 500);
            }
          }
        }

        // Focus the one we're looking
        model.trigger('focus');
      };

      onPlaceNotFound = function() {
        self.options.router.navigate('/');
      };

      // If we get a PlaceModel then show it immediately.
      if (model instanceof S.PlaceModel) {
        onPlaceFound(model);
        return;
      }

      // Otherwise, assume we have a model ID.
      modelId = model;
      model = this.places.get(modelId);

      // If the model was found in the places, go ahead and use it.
      if (model) {
        onPlaceFound(model);

      // Otherwise, fetch and use the result.
      } else {
        this.places.fetchById(modelId, {
          // Check for a valid location type before adding it to the collection
          validate: true,
          success: onPlaceFound,
          error: onPlaceNotFound,
          data: {
            include_submissions: includeSubmissions
          }
        });
      }
    },
    viewPage: function(slug) {
      var pageConfig = S.Util.findPageConfig(this.options.pagesConfig, {slug: slug}),
          pageTemplateName = 'pages/' + (pageConfig.name || pageConfig.slug),
          pageHtml = Handlebars.templates[pageTemplateName]({config: this.options.config});

      this.$panel.removeClass().addClass('page page-' + slug);
      this.showPanel(pageHtml);

      this.hideNewPin();
      this.destroyNewModels();
      this.hideCenterPoint();
      this.setBodyClass('content-visible');
    },
    showPanel: function(markup, preventScrollToTop) {
      var map = this.mapView.map;

      this.unfocusAllPlaces();

      this.$panelContent.html(markup);
      this.$panel.show();

      if (!preventScrollToTop) {
        // will be "mobile" or "desktop", as defined in default.css
        var layout = S.Util.getPageLayout();
        if (layout === 'desktop') {
          // For desktop, the panel content is scrollable
          this.$panelContent.scrollTo(0, 0);
        } else {
          // Scroll to the top of window when showing new content on mobile. Does
          // nothing on desktop. (Except when embedded in a scrollable site.)
          window.scrollTo(0, 0);
        }
      }

      this.setBodyClass('content-visible');
      map.invalidateSize({ animate:true, pan:true });

      $(S).trigger('panelshow', [this.options.router, Backbone.history.getFragment()]);
      S.Util.log('APP', 'panel-state', 'open');
    },
    showNewPin: function() {
      this.$centerpoint.show().addClass('newpin');

      // add map mask and spotlight effect
      var spotlightDiameter = 200,
          xOffset = $("#map").width() / 2 - (spotlightDiameter / 2),
          yOffset = $("#map").height() / 2 - (spotlightDiameter / 2);
      $("#map").append("<div id='new-place-mask'><div id='new-place-mask-fill'></div></div>");
      $("#new-place-mask-fill").css("left", xOffset + "px")
                               .css("top", yOffset + "px")
                               .css("width", spotlightDiameter + "px")
                               .css("height", spotlightDiameter + "px")
                               // scale the box shadow to the largest screen dimension; an arbitrarily large box shadow won't get drawn in Safari
                               .css("box-shadow", "0px 0px 0px " + Math.max((yOffset * 2), (xOffset * 2)) + "px rgba(0,0,0,0.4), inset 0px 0px 20px 30px rgba(0,0,0,0.4)");
    },
    showAddButton: function() {
      this.$addButton.show();
    },
    hideAddButton: function() {
      this.$addButton.hide();
    },
    showCenterPoint: function() {
      this.$centerpoint.show().removeClass('newpin');
    },
    hideCenterPoint: function() {
      this.$centerpoint.hide();
    },
    hidePanel: function() {
      var map = this.mapView.map;

      this.unfocusAllPlaces();
      this.$panel.hide();
      this.setBodyClass();
      map.invalidateSize({ animate:true, pan:true });

      S.Util.log('APP', 'panel-state', 'closed');
    },
    hideNewPin: function() {
      this.showCenterPoint();
    },
    unfocusAllPlaces: function() {
      // Unfocus all of the markers
      this.collection.each(function(m){
        if (!m.isNew()) {
          m.trigger('unfocus');
        }
      });
      _.each(this.options.landmarkCollections, function(landmarkCollection) {
        landmarkCollection.each(function(m) {
          m.trigger('unfocus');
        });
      });
    },
    destroyNewModels: function() {
      this.collection.each(function(m){
        if (m && m.isNew()) {
          m.destroy();
        }
      });
    },

    render: function() {
      this.mapView.render();
    },
    showListView: function() {
      // Re-sort if new places have come in
      this.listView.sort();
      // Show
      this.listView.$el.addClass('is-exposed');
      $('.show-the-list').addClass('is-visuallyhidden');
      $('.show-the-map').removeClass('is-visuallyhidden');
    },
    hideListView: function() {
      this.listView.$el.removeClass('is-exposed');
      $('.show-the-list').removeClass('is-visuallyhidden');
      $('.show-the-map').addClass('is-visuallyhidden');
    },
    toggleListView: function() {
      if (this.listView.isVisible()) {
        this.viewMap();
        this.hideListView();
        this.options.router.navigate('');
      } else {
        this.showListView();
        this.options.router.navigate('list');
      }
      this.mapView.clearFilter();
    }
  });
}(Shareabouts, jQuery, Shareabouts.Util.console));

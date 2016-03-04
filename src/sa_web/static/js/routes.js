/*globals Backbone jQuery _ */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.App = Backbone.Router.extend({
    routes: {
      '': 'viewMap',
      'filter/:locationtype': 'filterMap',
      'page/:slug': 'viewPage',
      ':dataset/new': 'newPlace',
      ':dataset/:id': 'viewPlace',
      ':dataset/:id/response/:response_id': 'viewPlace',
      ':dataset/:id/edit': 'editPlace',
      'list': 'showList',
      ':id': 'viewLandmark',
      ':zoom/:lat/:lng': 'viewMap'
    },

    initialize: function(options) {
      var self = this,
          startPageConfig,
          filteredRoutes;

      this.collection = {
        "landmark": {},
        "place": {}
      };
      this.activities = {
        "place": {}
      };

      /*
      this.collection = {
        landmark: {
          vision: new S.LandmarkCollection([]),
          restoration: new S.LandmarkCollection([])
        },
        shareabouts: {
          duwamish: new S.PlaceCollection([]),
          air: new S.PlaceCollection([])
        }
      }
       */

      if (!options.placeConfig.dataset_slug) {
        options.placeConfig.dataset_slug = 'place';
      }
      S.PlaceModel.prototype.getLoggingDetails = function() {
        return this.id;
      };
      S.LandmarkModel.prototype.getLoggingDetails = function() {
        return this.id;
      };

      // Reject a place that does not have a supported location type. This will
      // prevent invalid places from being added or saved to the collection.
      S.PlaceModel.prototype.validate = function(attrs, options) {
        var locationType = attrs.location_type,
            locationTypes = _.map(S.Config.placeTypes, function(config, key){ return key; });

        if (!_.contains(locationTypes, locationType)) {
          console.warn(locationType + ' is not supported.');
          return locationType + ' is not supported.';
        }
      };

      // Global route changes
      this.bind('route', function(route, router) {
        S.Util.log('ROUTE', self.getCurrentPath());
      });

      filteredRoutes = this.getFilteredRoutes();
      this.bind('route', function(route) {
        // If the route shouldn't be filtered, then clear the filter. Otherwise
        // leave it alone.
        if (!_.contains(filteredRoutes, route)) {
          this.clearLocationTypeFilter();
        }
      }, this);

      this.loading = true;
      //this.collection = new S.PlaceCollection([]);
      //this.activities = new S.ActionCollection(options.activity);
      

      var configArrays = {};

      configArrays.landmark = options.mapConfig.layers.filter(function(layer) {
        return layer.type && layer.type === 'landmark';
      });
      configArrays.place = options.mapConfig.layers.filter(function(layer) {
        return layer.type && layer.type === 'place';
      });

      /*
      this.activities = {
        "duwamish": S.ActionCollection(options.activity),
        "trees": S.ActionCollection(options.activity)
      };
      */
     
      _.each(configArrays, function(configArray) {
        _.each(configArray, function(config) {
          var collection;
          if (config.type == "place") {
            collection = new S.ActionCollection([]);
            collection.url += "?url=" + config.url + "&id=" + config.id;
            self.activities[config.type][config.id] = collection;
          }
        });
      });

      console.log("THIS.ACTIVITIES", this.activities);


      //this.landmarkCollections = {};
      
      //var landmarkConfigs = {};
      /*
        configArrays = {
          landmark: [...],
          place: [...]
        }

       */

      _.each(configArrays, function(configArray) {
        _.each(configArray, function(config) {
          var collection;
          if (config.type == "place") {
            collection = new S.PlaceCollection([]);

            collection.url += "?url=" + config.url + "&id=" + config.id;
            console.log("collection.url", collection.url);
          } else if (config.type == "landmark") {
            collection = new S.LandmarkCollection([]);
            collection.url = config.url;
          }
          
          self.collection[config.type][config.id] = collection;

        });
      });

      /*
      _.each(configsArray, function(config) {
        var collection;

        if (config.type == "place") {
          collection = new S.PlaceCollection([]);
        } else if (config.type == "landmark") {
          collection = new S.LandmarkCollection([]);
        }

        collection.url = config.url;
        self.collection[config.type][config.id] = collection;
        //landmarkConfigs[collectionId] = landmarkConfig;
      });
*/

      this.appView = new S.AppView({
        el: 'body',
        collection: this.collection,
        activities: this.activities,

        //landmarkCollections: this.landmarkCollections,
        //landmarkConfigs: landmarkConfigs,

        datasetConfigs: configArrays,
        config: options.config,

        defaultPlaceTypeName: options.defaultPlaceTypeName,
        placeTypes: options.placeTypes,
        cluster: options.cluster,
        surveyConfig: options.surveyConfig,
        supportConfig: options.supportConfig,
        pagesConfig: options.pagesConfig,
        mapConfig: options.mapConfig,
        placeConfig: options.placeConfig,
        sidebarConfig: options.sidebarConfig,
        activityConfig: options.activityConfig,
        userToken: options.userToken,
        router: this
      });

      // Start tracking the history
      var historyOptions = {pushState: true};
      if (options.defaultPlaceTypeName) {
        historyOptions.root = '/' + options.defaultPlaceTypeName + '/';
      }

      Backbone.history.start(historyOptions);

      // Load the default page when there is no page already in the url
      if (Backbone.history.getFragment() === '') {
        startPageConfig = S.Util.findPageConfig(options.pagesConfig, {start_page: true});

        if (startPageConfig && startPageConfig.slug) {
          this.navigate('page/' + startPageConfig.slug, {trigger: true});
        }
      }

      this.loading = false;
    },

    getCurrentPath: function() {
      var root = Backbone.history.root,
          fragment = Backbone.history.fragment;
      return root + fragment;
    },

    viewMap: function(zoom, lat, lng) {
      if (this.appView.mapView.locationTypeFilter) {
        // If there's a filter applied, actually go to that filtered route.
        this.navigate('/filter/' + this.appView.mapView.locationTypeFilter, {trigger: false});
      }

      this.appView.viewMap(zoom, lat, lng);
      this.appView.mapView.clearFilter();
    },

    // Open view for first step in multi-step form
    newPlace: function() {
      this.appView.newPlace();
    },

    viewLandmark: function(id) {
      this.appView.viewLandmark(id, { zoom: this.loading });
    },

    viewPlace: function(datasetSlug, id, responseId) {
      // TODO: When we handle multiple datasets, we will need to
      // implement appView.viewPlace(..) to accept a datasetSlug parameter
      this.appView.viewPlace(id, responseId, this.loading);
    },

    editPlace: function(){},

    viewPage: function(slug) {
      this.appView.viewPage(slug);
    },

    showList: function() {
      this.appView.showListView();
    },

    isMapRoute: function(fragment) {
      // This is a little hacky. I attempted to use Backbone.history.handlers,
      // but there is currently no way to map the route, at this point
      // transformed into a regex, back to the route name. This may change
      // in the future.
      return (fragment === '' || (fragment.indexOf('place') === -1 &&
                                  fragment.indexOf('page') === -1 &&
                                  fragment.indexOf('list') === -1));
    },

    getFilteredRoutes: function() {
      return ['filterMap', 'viewPlace', 'showList', 'viewMap'];
    },

    clearLocationTypeFilter: function() {
      this.setLocationTypeFilter('all');
    },

    setLocationTypeFilter: function(locationType) {
      // TODO: This functionality should be moved in to the app-view
      var $filterIndicator = $('#current-filter-type');
      if ($filterIndicator.length === 0) {
        $filterIndicator = $('<div id="current-filter-type"/>')
          .insertAfter($('.menu-item-filter-type > a:first-child'));
      }

      // Get the menu information for the current location type
      var filterMenu, menuItem;
      if (S.Config.pages) {
        filterMenu = _.findWhere(S.Config.pages, {'slug': 'filter-type'});
      }
      if (filterMenu) {
        menuItem = _.findWhere(filterMenu.pages, {'url': '/filter/' + locationType});
      }

      if (locationType !== 'all') {
        this.appView.mapView.filter(locationType);
        if (this.appView.listView) {
          this.appView.listView.filter({'location_type': locationType});
        }

        // Show the menu item title with the coresponding style
        if (menuItem) {
          $filterIndicator
            .removeClass()
            .addClass(locationType)
            .html(menuItem.title);
        }

      } else {
        // If the filter is 'all', we're unsetting the filter.
        this.appView.mapView.clearFilter();
        if (this.appView.listView) {
          this.appView.listView.clearFilters();
        }

        $filterIndicator
          .removeClass()
          .addClass('unfiltered')
          .empty();
      }
    },

    filterMap: function(locationType) {
      this.setLocationTypeFilter(locationType);
      if (locationType === 'all') {
        if (this.appView.listView && this.appView.listView.isVisible()) {
          this.navigate('/list', {trigger: false});
        } else {
          this.navigate('/', {trigger: false});
        }
      }
    }
  });

}(Shareabouts, jQuery, Shareabouts.Util.console));

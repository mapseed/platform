/*globals Backbone jQuery _ */

var PlaceModel = require('./models/place-model.js');
var LandmarkModel = require('./models/landmark-model.js');
var Util = require('./utils.js');
var LandmarkCollection = require('./models/landmark-collection.js');
var PlaceCollection = require('./models/place-collection.js');
var ActionCollection = require('./models/action-collection.js');
var AppView = require('./views/app-view.js');

// Global-namespace Util
Shareabouts.Util = Util;

(function(S, $, console){
  S.App = Backbone.Router.extend({
    routes: {
      '': 'viewMap',
      'filter/:locationtype': 'filterMap',
      'page/:slug': 'viewPage',
      ':dataset/:id': 'viewPlace',
      'new': 'newPlace',
      ':dataset/:id/response/:response_id': 'viewPlace',
      ':dataset/:id/edit': 'editPlace',
      'list': 'showList',
      ':id': 'viewLandmark',
      ':zoom/:lat/:lng': 'viewMap'
    },

    // overwrite route so we can catch route requests that would
    // navigate away from a detail view with unsaved editor changes
    route: function(route, handler, callback) {
      var router = this;
      if (!callback) callback = this[handler];

      var f = function() {
        if (this.appView.activeDetailView &&
          this.appView.activeDetailView.isModified) {
          if (!this.appView.activeDetailView.onCloseWithUnsavedChanges()) {
            return false 
          } else {
            this.appView.activeDetailView = null;
            callback.apply(router, arguments);
          }
        } else {
          this.appView.activeDetailView = null;
          callback.apply(router, arguments);
        }
      };

      return Backbone.Router.prototype.route.call(this, route, handler, f);
    },

    initialize: function(options) {
      var self = this,
          startPageConfig,
          filteredRoutes,
          // store config details for places and landmarks
          configArrays = {};

      // store individual place collections for each place type
      this.places = {};
      // store individual activity collections for each place type
      this.activities = {};
      // store individual landmark collections for each landmark type
      this.landmarks = {};

      PlaceModel.prototype.getLoggingDetails = function() {
        return this.id;
      };
      LandmarkModel.prototype.getLoggingDetails = function() {
        return this.id;
      };

      // Reject a place that does not have a supported location type. This will
      // prevent invalid places from being added or saved to the collection.
      PlaceModel.prototype.validate = function(attrs, options) {
        var locationType = attrs.location_type,
            locationTypes = _.map(S.Config.placeTypes, function(config, key){ return key; });

        if (!_.contains(locationTypes, locationType)) {
          console.warn(locationType + ' is not supported.');
          return locationType + ' is not supported.';
        }
      };

      // Global route changes
      this.bind('route', function(route, router) {
        Util.log('ROUTE', self.getCurrentPath());
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

      // set up landmark configs and instantiate landmark collections
      configArrays.landmarks = options.mapConfig.layers.filter(function(layer) {
        return layer.type && layer.type === 'landmark';
      });
      _.each(configArrays.landmarks, function(config) {
        var url = config.url + "?"
        config.sources.forEach(function (source) {
          url += encodeURIComponent(source) + '&'
        });
        var collection = new LandmarkCollection([], { url: url });
        self.landmarks[config.id] = collection;
      });

      // set up place configs and instantiate place collections
      configArrays.places = options.mapConfig.layers.filter(function(layer) {
        return layer.type && layer.type === 'place';
      });
      _.each(configArrays.places, function(config) {
        var collection = new PlaceCollection([], { url: "/dataset/" + config.id + "/places" });
        self.places[config.id] = collection;
      });
      var collection = new S.LandmarkCollection([], { url: url });
      self.landmarks[config.id] = collection;
    });

    // set up place configs and instantiate place collections
    configArrays.places = options.mapConfig.layers.filter(function(layer) {
      return layer.type && layer.type === 'place';
    });
    _.each(configArrays.places, function(config) {
      var collection = new S.PlaceCollection([], { url: "/dataset/" + config.id + "/places" });
      self.places[config.id] = collection;
    });

    // instantiate action collections for shareabouts places
    _.each(configArrays.places, function(config) {
      var collection = new S.ActionCollection([], { url: "/dataset/" + config.id + "/actions" });
      self.activities[config.id] = collection;
    });

    this.appView = new S.AppView({
      el: 'body',
      activities: this.activities,
      places: this.places,
      landmarks: this.landmarks,
      datasetConfigs: configArrays,
      config: options.config,
      defaultPlaceTypeName: options.defaultPlaceTypeName,
      placeTypes: options.placeTypes,
      cluster: options.cluster,
      surveyConfig: options.surveyConfig,
      supportConfig: options.supportConfig,
      pagesConfig: options.pagesConfig,
      mapConfig: options.mapConfig,
      storyConfig: options.storyConfig,
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

      // instantiate action collections for shareabouts places
      _.each(configArrays.places, function(config) {
        var collection = new ActionCollection([], { url: "/dataset/" + config.id + "/actions" });
        self.activities[config.id] = collection;
      });

      this.appView = new AppView({
        el: 'body',
        activities: this.activities,
        places: this.places,
        landmarks: this.landmarks,
        datasetConfigs: configArrays,
        config: options.config,
        defaultPlaceTypeName: options.defaultPlaceTypeName,
        placeTypes: options.placeTypes,
        cluster: options.cluster,
        surveyConfig: options.surveyConfig,
        supportConfig: options.supportConfig,
        pagesConfig: options.pagesConfig,
        mapConfig: options.mapConfig,
        storyConfig: options.storyConfig,
        placeConfig: options.placeConfig,
        sidebarConfig: options.sidebarConfig,
        activityConfig: options.activityConfig,
        userToken: options.userToken,
        router: this
      });

      if (startPageConfig && startPageConfig.slug) {
        this.navigate('page/' + startPageConfig.slug, {trigger: true});
      }
    }

    this.loading = false;
  },

      // Load the default page when there is no page already in the url
      if (Backbone.history.getFragment() === '') {
        startPageConfig = Util.findPageConfig(options.pagesConfig, {start_page: true});

  viewMap: function(zoom, lat, lng) {
    if (this.appView.mapView.locationTypeFilter) {
      // If there's a filter applied, actually go to that filtered route.
      this.navigate('/filter/' + this.appView.mapView.locationTypeFilter, {trigger: false});
    }

    this.appView.viewMap(zoom, lat, lng);
    this.appView.mapView.clearFilter();
  },

  newPlace: function() {
    this.appView.newPlace();
  },

  viewLandmark: function(id) {
    this.appView.viewLandmark(id, { zoom: this.loading });
  },

  viewPlace: function(datasetSlug, id, responseId) {
    this.appView.viewPlace(datasetSlug, id, responseId, this.loading);
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

}(Shareabouts, jQuery, Util.console));

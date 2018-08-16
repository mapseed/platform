/*globals Backbone jQuery _ */

var PlaceModel = require("./models/place-model.js");
var Util = require("./utils.js");
var PlaceCollection = require("./models/place-collection.js");
var ActionCollection = require("./models/action-collection.js");
var AppView = require("mapseed-app-view");

// Global-namespace Util
Shareabouts.Util = Util;

(function(S, $, console) {
  S.App = Backbone.Router.extend({
    routes: {
      "": "viewMap",
      "page/:slug": "viewPage",
      ":dataset/:id": "viewPlace",
      new: "newPlace",
      ":dataset/:id/response/:response_id": "viewPlace",
      ":id/response/:response_id": "viewLandmark",
      ":dataset/:id/edit": "editPlace",
      list: "showList",
      ":id": "viewLandmark",
      ":zoom/:lat/:lng": "viewMap",
    },

    initialize: function(options) {
      var self = this,
        startPageConfig,
        // store config details for places
        configArrays = {};

      // store individual place collections for each place type
      this.places = {};
      // store individual activity collections for each place type
      this.activities = {};

      PlaceModel.prototype.getLoggingDetails = function() {
        return this.id;
      };

      // Reject a place that does not have a supported place_detail configuration.
      // This will prevent invalid places from being added or saved to the collection.
      PlaceModel.prototype.validate = function(attrs) {
        if (
          !S.Config.place.place_detail.find(
            placeDetail => placeDetail.category === attrs.location_type,
          )
        ) {
          console.warn(attrs.location_type + " is not supported.");
          return attrs.location_type + " is not supported.";
        }
      };

      // Global route changes
      this.bind("route", function(route, router) {
        Util.log("ROUTE", self.getCurrentPath());
      });

      this.loading = true;

      // set up place configs and instantiate place collections
      configArrays.places = options.mapConfig.layers.filter(function(layer) {
        return layer.type && layer.type === "place";
      });
      _.each(configArrays.places, function(config) {
        var collection = new PlaceCollection([], {
          url: config.url + "/places",
        });
        self.places[config.id] = collection;
      });

      // instantiate action collections for shareabouts places
      _.each(configArrays.places, function(config) {
        var collection = new ActionCollection([], {
          url: config.url + "/actions",
        });
        self.activities[config.id] = collection;
      });

      this.appView = new AppView({
        el: "body",
        activities: this.activities,
        places: this.places,
        datasetConfigs: configArrays,
        apiRoot: options.appConfig.api_root,
        config: options.config,
        defaultPlaceTypeName: options.defaultPlaceTypeName,
        placeTypes: options.placeTypes,
        cluster: options.cluster,
        appConfig: options.appConfig,
        surveyConfig: options.surveyConfig,
        supportConfig: options.supportConfig,
        pagesConfig: options.pagesConfig,
        mapConfig: options.mapConfig,
        storyConfig: options.storyConfig,
        placeConfig: options.placeConfig,
        leftSidebarConfig: options.leftSidebarConfig,
        rightSidebarConfig: options.rightSidebarConfig,
        activityConfig: options.activityConfig,
        userToken: options.userToken,
        router: this,
        filters: options.filters,
        languageCode: options.languageCode,
        customHooks: options.customHooks,
        customComponents: options.customComponents,
      });

      // Start tracking the history
      var historyOptions = { pushState: true };
      if (options.defaultPlaceTypeName) {
        historyOptions.root = "/" + options.defaultPlaceTypeName + "/";
      }

      Backbone.history.start(historyOptions);

      // Load the default page when there is no page already in the url
      if (Backbone.history.getFragment() === "") {
        startPageConfig = S.Util.findPageConfig(options.pagesConfig, {
          start_page: true,
        });

        if (
          startPageConfig &&
          startPageConfig.slug &&
          // don't route to the start page on small screens
          $(window).width() > (startPageConfig.show_above_width || 960)
        ) {
          this.navigate("page/" + startPageConfig.slug, { trigger: true });
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
      this.recordGoogleAnalyticsHit("/");
      this.appView.viewMap(zoom, lat, lng);
    },

    newPlace: function() {
      this.recordGoogleAnalyticsHit("/new");
      this.appView.newPlace();
    },

    viewLandmark: function(modelId, responseId) {
      this.recordGoogleAnalyticsHit("/" + modelId);
      this.appView.viewPlaceOrLandmark({
        modelId: modelId,
        responseId: responseId,
        loading: this.loading,
      });
    },

    viewPlace: function(datasetSlug, modelId, responseId) {
      this.recordGoogleAnalyticsHit(`/${datasetSlug}/${modelId}`);
      this.appView.viewPlaceOrLandmark({
        datasetSlug: datasetSlug,
        modelId: modelId,
        responseId: responseId,
        loading: this.loading,
      });
    },

    editPlace: function() {},

    viewPage: function(slug) {
      this.recordGoogleAnalyticsHit("/page/" + slug);
      this.appView.viewPage(slug);
    },

    showList: function() {
      this.recordGoogleAnalyticsHit("/list");
      this.appView.showListView();
    },

    isMapRoute: function(fragment) {
      // This is a little hacky. I attempted to use Backbone.history.handlers,
      // but there is currently no way to map the route, at this point
      // transformed into a regex, back to the route name. This may change
      // in the future.
      return (
        fragment === "" ||
        (fragment.indexOf("place") === -1 &&
          fragment.indexOf("page") === -1 &&
          fragment.indexOf("list") === -1)
      );
    },

    recordGoogleAnalyticsHit(route) {
      if (typeof ga !== "undefined") {
        ga("set", "page", route);
        ga("send", "pageview");
      }
    },
  });
})(Shareabouts, jQuery, Util.console);

/*****************************************************************************

  CSRF Validation
  ---------------
  Django protects against Cross Site Request Forgeries (CSRF) by default. This
  type of attack occurs when a malicious Web site contains a link, a form button
  or some javascript that is intended to perform some action on your Web site,
  using the credentials of a logged-in user who visits the malicious site in their
  browser.

  Since the API proxy view sends requests that write data to the Shareabouts
  service authenticated as the owner of this dataset, we want to protect the API
  view against CSRF. In order to ensure that AJAX POST/PUT/DELETE requests that
  are made via jQuery will not be caught by the CSRF protection, we use the
  following code. For more information, see:
  https://docs.djangoproject.com/en/1.4/ref/contrib/csrf/

  */

jQuery(document).ajaxSend(function(event, xhr, settings) {
  function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      var cookies = document.cookie.split(";");
      for (var i = 0; i < cookies.length; i++) {
        var cookie = jQuery.trim(cookies[i]);
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
  function sameOrigin(url) {
    // url could be relative or scheme relative or absolute
    var host = document.location.host; // host + port
    var protocol = document.location.protocol;
    var sr_origin = "//" + host;
    var origin = protocol + sr_origin;
    // Allow absolute or scheme relative URLs to same origin
    return (
      url == origin ||
      url.slice(0, origin.length + 1) == origin + "/" ||
      (url == sr_origin ||
        url.slice(0, sr_origin.length + 1) == sr_origin + "/") ||
      // or any other URL that isn't scheme relative or absolute i.e relative.
      !/^(\/\/|http:|https:).*/.test(url)
    );
  }
  function safeMethod(method) {
    return /^(GET|HEAD|OPTIONS|TRACE)$/.test(method);
  }

  if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
    xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
  }

  // If this is a DELETE request, explicitly set the data to be sent so that
  // the browser will calculate a value for the Content-Length header.
  if (settings.type === "DELETE") {
    xhr.setRequestHeader("Content-Type", "application/json");
    settings.data = "{}";
  }
});

/*globals Backbone jQuery _ */
import React from "react";
import ReactDOM from "react-dom";
import App from "../components/app";
import { createStore } from "redux";
import reducer from "../state/reducers";

import Util from "./utils.js";
import config from "config";

import { updateCurrentTemplate } from "../state/ducks/ui";

import { recordGoogleAnalyticsHit } from "../utils/analytics";

import mapseedApiClient from "../client/mapseed-api-client";
import { setAppConfig } from "../state/ducks/app-config";
import { loadDatasetsConfig } from "../state/ducks/datasets-config";
import { setMapConfig } from "../state/ducks/map-config";
import { loadPlaceConfig } from "../state/ducks/place-config";
// TODO: configs always in their own ducks?
import { setLeftSidebarConfig } from "../state/ducks/left-sidebar";
import { setRightSidebarConfig } from "../state/ducks/right-sidebar-config";
import { setStoryConfig } from "../state/ducks/story-config";
import { loadFormsConfig } from "../state/ducks/forms-config";
import { setSupportConfig } from "../state/ducks/support-config";
import { setPagesConfig } from "../state/ducks/pages-config";
import { setNavBarConfig } from "../state/ducks/nav-bar-config";
import { loadMapStyle, loadMapViewport } from "../state/ducks/map";
import { loadDashboardConfig } from "../state/ducks/dashboard-config";
import { loadUser } from "../state/ducks/user";
import languageModule from "../language-module";

// Global-namespace Util
Shareabouts.Util = Util;

(function() {
  const Router = Backbone.Router.extend({
    initialize: function(options) {
      //     fetch(`${options.config.app.api_root}utils/session-key?format=json`, {
      //       credentials: "include",
      //     }).then(async session => {
      //       const sessionJson = await session.json();
      //       Shareabouts.Util.cookies.save(
      //         "sa-api-sessionid",
      //         sessionJson.sessionid,
      //       );
      //     });

      // Global route changes
      //this.bind("route", function() {
      //  Util.log("ROUTE", self.getCurrentPath());
      //});

      // Start tracking the history
      var historyOptions = { pushState: true };
      Backbone.history.start(historyOptions);

      this.store = createStore(
        reducer,
        window.__REDUX_DEVTOOLS_EXTENSION__ &&
          window.__REDUX_DEVTOOLS_EXTENSION__(),
      );

      let user;
      mapseedApiClient.user
        .get(options.config.app.api_root)
        .then(authedUser => {
          user = authedUser
            ? {
                token: `user:${authedUser.id}`,
                // avatar_url and `name` are backup values that can get overidden:
                avatar_url: "/static/css/images/user-50.png",
                name: authedUser.username,
                ...authedUser,
                isAuthenticated: true,
              }
            : {
                // anonymous user:
                avatar_url: "/static/css/images/user-50.png",
                token: `session:${Shareabouts.Util.cookies.get(
                  "sa-api-sessionid",
                )}`,
                groups: [],
                isAuthenticated: false,
              };

          this.store.dispatch(loadUser(user));
        });
      // TODO: Consistent "load" terminology
      this.store.dispatch(loadDatasetsConfig(options.config.datasets));
      this.store.dispatch(setMapConfig(options.config.map));
      this.store.dispatch(loadPlaceConfig(options.config.place, user));
      this.store.dispatch(setLeftSidebarConfig(options.config.left_sidebar));
      this.store.dispatch(setRightSidebarConfig(options.config.right_sidebar));
      this.store.dispatch(setStoryConfig(options.config.story));
      this.store.dispatch(setAppConfig(options.config.app));
      this.store.dispatch(loadFormsConfig(options.config.forms));
      this.store.dispatch(setSupportConfig(options.config.support));
      this.store.dispatch(setPagesConfig(options.config.pages));
      this.store.dispatch(setNavBarConfig(options.config.nav_bar));
      this.store.dispatch(
        loadMapStyle(options.config.map, options.config.datasets),
      );
      if (options.config.dashboard) {
        this.store.dispatch(loadDashboardConfig(options.config.dashboard));
      }
      this.store.dispatch(
        loadMapViewport(options.config.map.options.mapViewport),
      );

      languageModule.changeLanguage(options.languageCode);

      ReactDOM.render(
        <App
          store={this.store}
          router={this}
          config={options.config}
          languageCode={options.languageCode}
        />,
        document.getElementById("site-wrap"),
      );

      //      // Load the default page when there is no page already in the url
      //      if (Backbone.history.getFragment() === "") {
      //        const startPageConfig = _.findWhere(options.navBarConfig, {
      //          start_page: true,
      //        });
      //
      //        if (
      //          startPageConfig &&
      //          startPageConfig.url &&
      //          // don't route to the start page on small screens
      //          $(window).width() > (startPageConfig.show_above_width || 960)
      //        ) {
      //          this.navigate(startPageConfig.url, { trigger: true });
      //        }
      //      }

      this.route("", "viewMap");
      this.route("page/:slug", "viewPage");
      this.route("dashboard", "viewDashboard");
      this.route("sha", "viewSha");
      this.route(":dataset/:id", "viewPlace");
      this.route("new", "newPlace");
      this.route(":dataset/:id/response/:response_id", "viewPlace");
      this.route("list", "viewList");
      this.route(":zoom/:lat/:lng", "viewMap");
      this.route(":custom", "viewMap"); // workaround to handle routes like "/es.html" or "/en_US.html"
    },

    getCurrentPath: function() {
      var root = Backbone.history.root,
        fragment = Backbone.history.fragment;
      return root + fragment;
    },

    viewMap: function(zoom, lat, lng) {
      recordGoogleAnalyticsHit("/");
      this.store.dispatch(updateCurrentTemplate("map"));
      //  this.appView.viewMap(parseInt(zoom), parseFloat(lat), parseFloat(lng));
    },

    viewDashboard: function() {
      recordGoogleAnalyticsHit("/dashboard");
      this.appView.viewDashboard();
    },

    newPlace: function() {
      this.appView.newPlace();
    },

    viewPlace: function(placeSlug, placeId, responseId) {
      recordGoogleAnalyticsHit(`/${placeSlug}/${placeId}`);
      this.appView.viewPlace({
        placeSlug: placeSlug,
        placeId: parseInt(placeId),
        responseId: parseInt(responseId),
      });
    },

    viewPage: function(slug) {
      recordGoogleAnalyticsHit("/page/" + slug);
      this.appView.viewPage(slug);
    },

    viewSha: function() {
      recordGoogleAnalyticsHit("/sha");
      this.appView.viewSha();
    },

    viewList: function() {
      recordGoogleAnalyticsHit("/list");
      this.appView.viewList();
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
  });

  new Router({
    config: config,
    languageCode: Shareabouts.languageCode,
  });
})();

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

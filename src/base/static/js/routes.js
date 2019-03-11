import React from "react";
import ReactDOM from "react-dom";
import App from "../components/app";
import { createStore } from "redux";
import reducer from "../state/reducers";

import Util from "./utils.js";
import config from "config";

import {
  updateCurrentTemplate,
  updateUIVisibility,
  updateActivePage,
  updateContentPanelComponent,
  updateAddPlaceButtonVisibility,
} from "../state/ducks/ui";
import { updateMapViewport } from "../state/ducks/map";
import { updateFocusedPlaceId } from "../state/ducks/places";

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
      this.store.dispatch(updateAddPlaceButtonVisibility(true));

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
      this.route(":custom", "viewMap"); // workaround to handle routes like "/es.html" or "/en_US.html"
      this.route(":dataset/:id", "viewPlace");
      this.route(":dataset/:id/response/:response_id", "viewPlace");
      this.route("dashboard", "viewDashboard");
      this.route("sha", "viewSha");
      this.route("new", "newPlace");
      this.route("list", "viewList");
      this.route(":zoom/:lat/:lng", "viewMap");
      this.route("page/:slug", "viewPage");
    },

    getCurrentPath: function() {
      var root = Backbone.history.root,
        fragment = Backbone.history.fragment;
      return root + fragment;
    },

    viewMap: function(zoom, lat, lng) {
      recordGoogleAnalyticsHit("/");
      this.store.dispatch(updateCurrentTemplate("map"));
      this.store.dispatch(updateUIVisibility("contentPanel", false));
      this.store.dispatch(updateUIVisibility("spotlightMask", false));
      this.store.dispatch(updateUIVisibility("mapCenterpoint", false));
      this.store.dispatch(updateActivePage(null));
      this.store.dispatch(updateContentPanelComponent(null));
      this.store.dispatch(updateAddPlaceButtonVisibility(true));
      zoom &&
        lat &&
        lng &&
        this.store.dispatch(
          updateMapViewport({
            zoom: parseFloat(zoom),
            lat: parseFloat(lat),
            lng: parseFloat(lng),
          }),
        );
    },

    viewDashboard: function() {
      recordGoogleAnalyticsHit("/dashboard");
      this.appView.viewDashboard();
    },

    newPlace: function() {
      recordGoogleAnalyticsHit("/new");
      this.store.dispatch(updateContentPanelComponent("InputForm"));
      this.store.dispatch(updateAddPlaceButtonVisibility(false));
      this.store.dispatch(updateUIVisibility("contentPanel", true));
    },

    viewPlace: function(placeSlug, placeId, responseId) {
      recordGoogleAnalyticsHit(`/${placeSlug}/${placeId}`);
      this.store.dispatch(updateFocusedPlaceId(parseInt(placeId)));
      this.store.dispatch(updateUIVisibility("contentPanel", true));
      this.store.dispatch(updateUIVisibility("mapCenterpoint", false));
      this.store.dispatch(updateAddPlaceButtonVisibility(true));
      this.store.dispatch(updateContentPanelComponent("PlaceDetail"));
    },

    viewPage: function(pageSlug) {
      recordGoogleAnalyticsHit(`/page/${pageSlug}`);
      this.store.dispatch(updateCurrentTemplate("map"));
      this.store.dispatch(updateUIVisibility("contentPanel", true));
      this.store.dispatch(updateUIVisibility("spotlightMask", false));
      this.store.dispatch(updateUIVisibility("mapCenterpoint", false));
      this.store.dispatch(updateActivePage(pageSlug));
      this.store.dispatch(updateContentPanelComponent("CustomPage"));
      this.store.dispatch(updateAddPlaceButtonVisibility(true));
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

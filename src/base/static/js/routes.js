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
import {
  updateMapViewport,
  createFeaturesInGeoJSONSource,
} from "../state/ducks/map";
import {
  updateFocusedPlaceId,
  updateScrollToResponseId,
  loadPlaceAndSetIgnoreFlag,
  placeExists,
} from "../state/ducks/places";

import { recordGoogleAnalyticsHit } from "../utils/analytics";

import mapseedApiClient from "../client/mapseed-api-client";
import { setAppConfig } from "../state/ducks/app-config";
import {
  loadDatasetsConfig,
  datasetConfigsSelector,
} from "../state/ducks/datasets-config";
import { loadDatasets } from "../state/ducks/datasets";
import { setMapConfig } from "../state/ducks/map-config";
import { loadPlaceConfig } from "../state/ducks/place-config";
// TODO: configs always in their own duck
import { setLeftSidebarConfig } from "../state/ducks/left-sidebar";
import { setRightSidebarConfig } from "../state/ducks/right-sidebar-config";
import { loadStoryConfig } from "../state/ducks/story-config";
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
    routes: {
      "": "viewMap",
      "page/:slug": "viewPage",
      dashboard: "viewDashboard",
      sha: "viewSha",
      new: "newPlace",
      list: "viewList",
      ":dataset/:id": "viewPlace",
      ":dataset/:id/response/:response_id": "viewPlace",
      ":zoom/:lat/:lng": "viewMap",
      ":custom": "viewMap", // workaround to handle routes like "/es.html" or "/en_US.html"
    },
    initialize: async function(options) {
      // TODO: Move to API client.
      fetch(`${options.config.app.api_root}utils/session-key?format=json`, {
        credentials: "include",
      }).then(async session => {
        const sessionJson = await session.json();
        Shareabouts.Util.cookies.save(
          "sa-api-sessionid",
          sessionJson.sessionid,
        );
      });

      this.store = createStore(
        reducer,
        window.__REDUX_DEVTOOLS_EXTENSION__ &&
          window.__REDUX_DEVTOOLS_EXTENSION__(),
      );

      // Fetch and load user information.
      const authedUser = await mapseedApiClient.user.get(
        options.config.app.api_root,
      );
      const user = authedUser
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

      // Fetch and load datasets.
      const datasetUrls = options.config.datasets.map(config => config.url);
      const datasets = await mapseedApiClient.datasets.get(datasetUrls);
      this.store.dispatch(loadDatasets(datasets));

      // Load all other ducks.
      // TODO: Consistent "load" terminology
      this.store.dispatch(loadDatasetsConfig(options.config.datasets));
      this.store.dispatch(setMapConfig(options.config.map));
      this.store.dispatch(loadPlaceConfig(options.config.place, user));
      this.store.dispatch(setLeftSidebarConfig(options.config.left_sidebar));
      this.store.dispatch(setRightSidebarConfig(options.config.right_sidebar));
      this.store.dispatch(loadStoryConfig(options.config.story));
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
      options.config.right_sidebar.is_visible_default &&
        this.store.dispatch(updateUIVisibility("rightSidebar", true));

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

      // Start tracking routing history.
      Backbone.history.start({ pushState: true });

      // Load the default page when there is no page already in the url
      if (Backbone.history.getFragment() === "") {
        const startPageConfig = options.config.nav_bar.find(
          navItem => navItem.start_page,
        );

        if (
          startPageConfig &&
          startPageConfig.url &&
          // Don't route to the start page on small screens.
          window.innerWidth > 960
        ) {
          this.navigate(startPageConfig.url, { trigger: true });
        }
      }
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
      this.store.dispatch(updateCurrentTemplate("dashboard"));
    },

    newPlace: function() {
      recordGoogleAnalyticsHit("/new");
      this.store.dispatch(updateContentPanelComponent("InputForm"));
      this.store.dispatch(updateAddPlaceButtonVisibility(false));
      this.store.dispatch(updateUIVisibility("contentPanel", true));
    },

    viewPlace: async function(clientSlug, placeId, responseId) {
      if (!placeExists(this.store.getState(), placeId)) {
        const datasetConfig = datasetConfigsSelector(
          this.store.getState(),
        ).find(config => config.clientSlug === clientSlug);

        const response = await mapseedApiClient.place.getPlace({
          datasetUrl: datasetConfig.url,
          clientSlug,
          datasetSlug: datasetConfig.slug,
          placeId: parseInt(placeId),
          placeParams: {
            include_submissions: true,
            include_tags: true,
          },
        });

        if (response) {
          // Add this Place to the places duck and update the map.
          this.store.dispatch(loadPlaceAndSetIgnoreFlag(response));

          const { geometry, ...rest } = response;

          this.store.dispatch(
            createFeaturesInGeoJSONSource(datasetConfig.slug, [
              {
                type: "Feature",
                geometry,
                properties: rest,
              },
            ]),
          );
        } else {
          // The Place doesn't exist, so route back to the map.
          this.navigate("/", { trigger: true });
          return;
        }
      }

      recordGoogleAnalyticsHit(`/${clientSlug}/${placeId}`);
      this.store.dispatch(updateScrollToResponseId(parseInt(responseId)));
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
      this.store.dispatch(updateCurrentTemplate("sha"));
    },

    viewList: function() {
      recordGoogleAnalyticsHit("/list");
      this.store.dispatch(updateCurrentTemplate("list"));
    },
  });

  new Router({
    config: config,
    languageCode: Shareabouts.languageCode,
  });
})();

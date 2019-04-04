import React from "react";
import ReactDOM from "react-dom";
import App from "../components/app";
import { createStore } from "redux";
import reducer from "../state/reducers";

import Util from "./utils.js";
import config from "config";
import mixpanel from "mixpanel-browser";

import {
  updateCurrentTemplate,
  updateUIVisibility,
  updateActivePage,
  updateContentPanelComponent,
  updateEditModeToggled,
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
import {
  hasAnonAbilitiesInAnyDataset,
  datasetSlugsSelector,
} from "../state/ducks/datasets-config";
import { hasGroupAbilitiesInDatasets } from "../state/ducks/user";

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
import { loadCustomComponentsConfig } from "../state/ducks/custom-components-config";
import { loadUser } from "../state/ducks/user";
import languageModule from "../language-module";

// Global-namespace Util
Shareabouts.Util = Util;
mixpanel.init(MIXPANEL_TOKEN);

(function() {
  const Router = Backbone.Router.extend({
    routes: {
      "": "viewMap",
      invite: "addInvite",
      "page/:slug": "viewPage",
      dashboard: "viewDashboard",
      new: "newPlace",
      list: "viewList",
      ":dataset/:id": "viewPlace",
      ":dataset/:id/response/:response_id": "viewPlace",
      ":zoom/:lat/:lng": "viewMap",
      ":custom": "viewMap", // workaround to handle routes like "/es.html" or "/en_US.html"
    },
    initialize: async function(options) {
      // In production, use the asynchronously fetched config file so we can
      // support localized config content. In development, use the imported
      // module so we can support incremental rebuilds.
      if (process.env.NODE_ENV === "production") {
        const configResponse = await fetch(
          `/config-${options.languageCode}.js`,
        );
        this.config = await configResponse.json();
      } else {
        this.config = config;
      }

      // TODO: Move to API client.
      fetch(`${this.config.app.api_root}utils/session-key?format=json`, {
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
        this.config.app.api_root,
      );
      const user = authedUser
        ? {
            token: `user:${authedUser.id}`,
            // avatar_url and `name` are backup values that can get overidden:
            avatar_url: "/static/css/images/user-50.png",
            name: authedUser.username,
            ...authedUser,
            isAuthenticated: true,
            isLoaded: true,
          }
        : {
            // anonymous user:
            avatar_url: "/static/css/images/user-50.png",
            token: `session:${Shareabouts.Util.cookies.get(
              "sa-api-sessionid",
            )}`,
            groups: [],
            isAuthenticated: false,
            isLoaded: true,
          };
      this.store.dispatch(loadUser(user));

      // Fetch and load datasets.
      const datasetUrls = this.config.datasets.map(config => config.url);
      const datasets = await mapseedApiClient.datasets.get(datasetUrls);
      this.store.dispatch(loadDatasets(datasets));

      // Load all other ducks.
      // TODO: Consistent "load" terminology
      this.store.dispatch(loadDatasetsConfig(this.config.datasets));
      this.store.dispatch(setMapConfig(this.config.map));
      this.store.dispatch(loadPlaceConfig(this.config.place, user));
      this.store.dispatch(setLeftSidebarConfig(this.config.left_sidebar));
      this.store.dispatch(setRightSidebarConfig(this.config.right_sidebar));
      this.store.dispatch(loadStoryConfig(this.config.story));
      this.store.dispatch(setAppConfig(this.config.app));
      this.store.dispatch(loadFormsConfig(this.config.forms));
      this.store.dispatch(setSupportConfig(this.config.support));
      this.store.dispatch(setPagesConfig(this.config.pages));
      this.store.dispatch(setNavBarConfig(this.config.nav_bar));
      this.store.dispatch(
        loadCustomComponentsConfig(this.config.custom_components),
      );
      this.store.dispatch(loadMapStyle(this.config.map, this.config.datasets));
      if (this.config.dashboard) {
        this.store.dispatch(loadDashboardConfig(this.config.dashboard));
      }
      this.store.dispatch(loadMapViewport(this.config.map.options.mapViewport));
      this.config.right_sidebar.is_visible_default &&
        this.store.dispatch(updateUIVisibility("rightSidebar", true));

      languageModule.changeLanguage(options.languageCode);

      ReactDOM.render(
        <App
          store={this.store}
          router={this}
          config={this.config}
          languageCode={options.languageCode}
        />,
        document.getElementById("site-wrap"),
      );

      // Start tracking routing history.
      //Backbone.history.start({ pushState: true });

//      // Load the default page when there is no page already in the url
//      if (Backbone.history.getFragment() === "") {
//        const startPageConfig = this.config.nav_bar.find(
//          navItem => navItem.start_page,
//        );
//
//        if (
//          startPageConfig &&
//          startPageConfig.url &&
//          // Don't route to the start page on small screens.
//          window.innerWidth > 960
//        ) {
//          this.navigate(startPageConfig.url, { trigger: true });
//        }
//      }
    },

    viewMap: function(zoom, lat, lng) {
      recordGoogleAnalyticsHit("/");
      this.store.dispatch(updateCurrentTemplate("map"));
      this.store.dispatch(updateUIVisibility("contentPanel", false));
      this.store.dispatch(updateUIVisibility("spotlightMask", false));
      this.store.dispatch(updateUIVisibility("mapCenterpoint", false));
      this.store.dispatch(updateUIVisibility("addPlaceButton", true));
      this.store.dispatch(updateActivePage(null));
      this.store.dispatch(updateContentPanelComponent(null));
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
      if (
        hasAnonAbilitiesInAnyDataset({
          state: this.store.getState(),
          submissionSet: "places",
          abilities: ["create"],
        }) ||
        hasGroupAbilitiesInDatasets({
          state: this.store.getState(),
          submissionSet: "places",
          abilities: ["create"],
          datasetSlugs: datasetSlugsSelector(this.store.getState()),
        })
      ) {
        recordGoogleAnalyticsHit("/new");
        this.store.dispatch(updateContentPanelComponent("InputForm"));
        this.store.dispatch(updateUIVisibility("addPlaceButton", false));
        this.store.dispatch(updateUIVisibility("contentPanel", true));
      } else {
        this.navigate("/", { trigger: true });
      }
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
          includePrivate: hasGroupAbilitiesInDatasets({
            state: this.store.getState(),
            abilities: ["can_access_protected"],
            datasetSlugs: [datasetConfig.slug],
            submissionSet: "places",
          }),
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
      this.store.dispatch(updateEditModeToggled(false));
      this.store.dispatch(updateScrollToResponseId(parseInt(responseId)));
      this.store.dispatch(updateFocusedPlaceId(parseInt(placeId)));
      this.store.dispatch(updateCurrentTemplate("map"));
      this.store.dispatch(updateUIVisibility("contentPanel", true));
      this.store.dispatch(updateUIVisibility("mapCenterpoint", false));
      this.store.dispatch(updateUIVisibility("addPlaceButton", true));
      this.store.dispatch(updateContentPanelComponent("PlaceDetail"));
    },

    addInvite: function() {
      recordGoogleAnalyticsHit("/invite");
      this.store.dispatch(updateCurrentTemplate("map"));
      this.store.dispatch(updateUIVisibility("inviteModal", true));
    },

    viewPage: function(pageSlug) {
      recordGoogleAnalyticsHit(`/page/${pageSlug}`);
      this.store.dispatch(updateCurrentTemplate("map"));
      this.store.dispatch(updateUIVisibility("contentPanel", true));
      this.store.dispatch(updateUIVisibility("spotlightMask", false));
      this.store.dispatch(updateUIVisibility("mapCenterpoint", false));
      this.store.dispatch(updateUIVisibility("addPlaceButton", true));
      this.store.dispatch(updateActivePage(pageSlug));
      this.store.dispatch(updateContentPanelComponent("CustomPage"));
    },

    //viewSha: function() {
    //  recordGoogleAnalyticsHit("/sha");
    //  this.store.dispatch(updateCurrentTemplate("sha"));
    //},

    viewList: function() {
      recordGoogleAnalyticsHit("/list");
      this.store.dispatch(updateCurrentTemplate("list"));
    },
  });

  new Router({
    languageCode: Shareabouts.languageCode,
  });
})();

import React, { Suspense, lazy } from "react";
import emitter from "../../utils/emitter";
import ReactDOM from "react-dom";
import languageModule from "../../language-module";
import browserUpdate from "browser-update";
import WebMercatorViewport from "viewport-mercator-project";
import getExtentFromGeometry from "turf-extent";
import { throttle } from "throttle-debounce";

import { Provider } from "react-redux";
import { createStore } from "redux";
import reducer from "../../state/reducers";
import mapseedApiClient from "../../client/mapseed-api-client";
import ThemeProvider from "../../components/theme-provider";

import { setMapConfig, mapConfigSelector } from "../../state/ducks/map-config";

import {
  loadPlaces,
  placeSelector,
  placesLoadStatusSelector,
  updatePlacesLoadStatus,
} from "../../state/ducks/places";
import { loadPlaceConfig } from "../../state/ducks/place-config";
import {
  setStoryConfig,
  storyConfigSelector,
} from "../../state/ducks/story-config";
import { loadFormsConfig } from "../../state/ducks/forms-config";
import { setPagesConfig, pageSelector } from "../../state/ducks/pages-config";
import {
  isLeftSidebarExpandedSelector,
  setLeftSidebarConfig,
  setLeftSidebarComponent,
  setLeftSidebarExpanded,
} from "../../state/ducks/left-sidebar";
import { setRightSidebarConfig } from "../../state/ducks/right-sidebar-config";
import { setAppConfig } from "../../state/ducks/app-config";
import { loadDashboardConfig } from "../../state/ducks/dashboard-config";
import {
  updateMapViewport,
  loadMapViewport,
  updateFocusedGeoJSONFeatures,
  removeFocusedGeoJSONFeatures,
  updateLayerGroupVisibility,
  loadMapStyle,
  createFeaturesInGeoJSONSource,
  mapViewportSelector,
} from "../../state/ducks/map";
import { setSupportConfig } from "../../state/ducks/support-config";
import { setNavBarConfig } from "../../state/ducks/nav-bar-config";
import {
  setCurrentTemplate,
  setAddPlaceButtonVisibility,
  setMapCenterpointVisibility,
  setGeocodeAddressBarVisibility,
  geocodeAddressBarVisibilitySelector,
  updateEditModeToggled,
  setContentPanel,
  setRightSidebar,
  rightSidebarExpandedSelector,
  contentPanelOpenSelector,
} from "../../state/ducks/ui";
import {
  loadUser,
  userSelector,
  hasGroupAbilitiesInDatasets,
  hasAdminAbilities,
} from "../../state/ducks/user";
import {
  loadDatasetsConfig,
  hasAnonAbilitiesInAnyDataset,
  datasetSlugsSelector,
  datasetConfigsSelector,
} from "../../state/ducks/datasets-config";
import {
  loadDatasets,
  datasetsLoadStatusSelector,
  updateDatasetsLoadStatus,
} from "../../state/ducks/datasets";
import { recordGoogleAnalyticsHit } from "../../utils/analytics";

const Dashboard = lazy(() => import("../../components/templates/dashboard"));

import MainMap from "../../components/templates/main-map";
import InputForm from "../../components/input-form";
import PlaceDetail from "../../components/place-detail";
import FormCategoryMenuWrapper from "../../components/input-form/form-category-menu-wrapper";
import GeocodeAddressBar from "../../components/geocode-address-bar";
import InfoModal from "../../components/organisms/info-modal";
import RightSidebar from "../../components/templates/right-sidebar";
import LeftSidebar from "../../components/organisms/left-sidebar";
import SiteHeader from "../../components/organisms/site-header";
import CustomPage from "../../components/organisms/custom-page";
import AddPlaceButton from "../../components/molecules/add-place-button";
import MapCenterpoint from "../../components/molecules/map-centerpoint";

import constants from "../../constants";
import PlaceList from "../../components/organisms/place-list";

// TODO(luke): move this into index.js (currently routes.js)
const store = createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);

// END REACT PORT SECTION //////////////////////////////////////////////////////

var Util = require("../utils.js");

browserUpdate({
  required: {
    e: -2, // Edge, last 2 versions
    i: 11, // IE >= 11.0
    f: -2, // Firefox, last 2 versions
    s: -2, // Safari, last 2 versions
    c: -2, // Chrome, last 2 versions
  },
});

export default Backbone.View.extend({
  events: {
    "click .close-btn": "onClickClosePanelBtn",
  },
  initialize: async function() {
    // TODO(luke): move this into "componentDidMount" when App becomes a
    // component:

    store.dispatch(loadDatasetsConfig(this.options.datasetsConfig));
    store.dispatch(setMapConfig(this.options.mapConfig));
    store.dispatch(
      loadPlaceConfig(this.options.placeConfig, userSelector(store.getState())),
    );
    store.dispatch(setLeftSidebarConfig(this.options.leftSidebarConfig));
    store.dispatch(setRightSidebarConfig(this.options.rightSidebarConfig));
    store.dispatch(setStoryConfig(this.options.storyConfig));
    store.dispatch(setAppConfig(this.options.appConfig));
    store.dispatch(loadFormsConfig(this.options.formsConfig));
    store.dispatch(setSupportConfig(this.options.supportConfig));
    store.dispatch(setPagesConfig(this.options.pagesConfig));
    store.dispatch(setNavBarConfig(this.options.navBarConfig));
    store.dispatch(
      loadMapStyle(this.options.mapConfig, this.options.datasetsConfig),
    );
    if (this.options.dashboardConfig) {
      store.dispatch(loadDashboardConfig(this.options.dashboardConfig));
    }
    // Set initial map viewport from values supplied in the config.
    store.dispatch(loadMapViewport(this.options.mapConfig.options.mapViewport));

    languageModule.changeLanguage(this.options.languageCode);

    const self = this;

    // this flag is used to distinguish between user-initiated zooms and
    // zooms initiated by a leaflet method
    this.isStoryActive = false;

    $("body").ajaxError(function(evt, request, settings) {
      $("#ajax-error-msg").show();
    });

    $("body").ajaxSuccess(function(evt, request, settings) {
      $("#ajax-error-msg").hide();
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

    ReactDOM.render(
      <Provider store={store}>
        <ThemeProvider>
          <AddPlaceButton
            onClick={() => {
              Util.log("USER", "map", "new-place-btn-click");
              this.options.router.navigate("/new", {
                trigger: true,
              });
            }}
            setMapDimensions={this.setMapDimensions.bind(this)}
          >
            {this.options.placeConfig.add_button_label}
          </AddPlaceButton>
        </ThemeProvider>
      </Provider>,
      document.getElementById("add-place-button"),
    );

    ReactDOM.render(
      <Provider store={store}>
        <ThemeProvider>
          <MapCenterpoint />
        </ThemeProvider>
      </Provider>,
      document.getElementById("map-centerpoint"),
    );

    // Site header
    ReactDOM.render(
      <Provider store={store}>
        <ThemeProvider>
          <SiteHeader
            router={this.options.router}
            languageCode={this.options.languageCode}
            setMapDimensions={this.setMapDimensions.bind(this)}
          />
        </ThemeProvider>
      </Provider>,
      document.getElementById("site-header"),
    );

    // When the user chooses a geocoded address, the address view will fire
    // a geocode event on the namespace. At that point we center the map on
    // the geocoded location.

    // REACT PORT SECTION //////////////////////////////////////////////////////
    emitter.addListener("geocode", locationData => {
      emitter.emit(constants.MAP_TRANSITION_EASE_TO_POINT, {
        coordinates: locationData.latLng,
        // TODO: Make this configurable?
        zoom: 16,
      });
    });
    // END REACT PORT SECTION //////////////////////////////////////////////////

    // REACT PORT SECTION //////////////////////////////////////////////////////
    emitter.addListener("nav-layer-btn:toggle", () => {
      store.dispatch(setLeftSidebarComponent("MapLayerPanel"));
      store.dispatch(
        setLeftSidebarExpanded(
          !isLeftSidebarExpandedSelector(store.getState()),
        ),
      );
    });
    // END REACT PORT SECTION //////////////////////////////////////////////////

    // REACT PORT SECTION //////////////////////////////////////////////////////
    emitter.addListener("info-modal:open", modalContent => {
      ReactDOM.unmountComponentAtNode(
        document.getElementById("info-modal-container"),
      );

      ReactDOM.render(
        <Provider store={store}>
          <ThemeProvider>
            <InfoModal
              parentId="info-modal-container"
              isModalOpen={true}
              {...modalContent}
            />
          </ThemeProvider>
        </Provider>,
        document.getElementById("info-modal-container"),
      );
    });
    // END REACT PORT SECTION //////////////////////////////////////////////////

    if (this.options.mapConfig.geocoding_bar_enabled) {
      store.dispatch(setGeocodeAddressBarVisibility(true));
    }

    // Cache panel elements that we use a lot
    this.$panel = $("#content");
    // HACK! These are (very) temporary layout hacks until we port AppView.
    Util.getPageLayout() === "desktop" && this.$panel.width("40%");
    this.$rightSidebar = $("#right-sidebar-container");
    this.$rightSidebar.width("15%");
    this.$panelContent = $("#content article");
    this.$panelCloseBtn = $(".close-btn");

    // This is the "center" when the popup is open
    this.offsetRatio = { x: 0.2, y: 0.0 };

    // Show tools for adding data
    this.setBodyClass();
  },

  // This function gets called a lot from the MainMap component, so we throttle
  // it here to avoid lagginess.
  setSlippyRoute: throttle(500, function() {
    if (!this.hasBodyClass("content-visible")) {
      const { zoom, latitude, longitude } = mapViewportSelector(
        store.getState(),
      );
      this.options.router.navigate(
        `/${zoom.toFixed(2)}/${latitude.toFixed(5)}/${longitude.toFixed(5)}`,
        {
          trigger: false,
        },
      );
    }
  }),

  fetchAndLoadUser: async function() {
    const authedUser = await mapseedApiClient.user.get(
      this.options.appConfig.api_root,
    );
    const user = authedUser
      ? {
          token: `user:${authedUser.id}`,
          ...authedUser,
          // avatar_url and `name` are backup values that can get overidden:
          avatar_url: authedUser.avatar_url || "/static/css/images/user-50.png",
          name: authedUser.name || authedUser.username,
          isAuthenticated: true,
          isLoaded: true,
        }
      : {
          // anonymous user:
          avatar_url: "/static/css/images/user-50.png",
          token: `session:${Shareabouts.Util.cookies.get("sa-api-sessionid")}`,
          groups: [],
          isAuthenticated: false,
          isLoaded: true,
        };

    store.dispatch(loadUser(user));
  },

  fetchAndLoadDatasets: async function() {
    store.dispatch(updateDatasetsLoadStatus("loading"));

    const datasetUrls = datasetConfigsSelector(store.getState()).map(
      datasetConfig => datasetConfig.url,
    );
    const datasets = await mapseedApiClient.datasets.get(datasetUrls);

    store.dispatch(loadDatasets(datasets));
    store.dispatch(updateDatasetsLoadStatus("loaded"));
  },

  fetchAndLoadPlaces: async function() {
    store.dispatch(updatePlacesLoadStatus("loading"));

    const placeParams = {
      // NOTE: this is to include comments/supports while fetching our place models
      include_submissions: true,
      include_tags: true,
    };

    // Use the page size as dictated by the server by default, unless
    // directed to do otherwise in the configuration.
    if (this.options.appConfig.places_page_size) {
      placeParams.page_size = this.options.appConfig.places_page_size;
    }

    const datasetConfigs = datasetConfigsSelector(store.getState());
    const allPlacePagePromises = [];
    await Promise.all(
      datasetConfigs.map(async config => {
        // Note that the response here is an array of page Promises.
        const response = await mapseedApiClient.place.get({
          url: `${config.url}/places`,
          datasetSlug: config.slug,
          clientSlug: config.clientSlug,
          placeParams: placeParams,
          includePrivate: hasAdminAbilities(store.getState(), config.slug),
        });

        if (response) {
          response.forEach(async placePagePromise => {
            // Load places into the places duck.
            allPlacePagePromises.push(placePagePromise);
            const pageData = await placePagePromise;
            store.dispatch(
              loadPlaces(pageData, storyConfigSelector(store.getState())),
            );

            // Update the map.
            store.dispatch(
              createFeaturesInGeoJSONSource(
                // "sourceId" and a dataset's slug are the same thing.
                config.slug,
                pageData.map(place => {
                  const { geometry, ...rest } = place;

                  return {
                    type: "Feature",
                    geometry,
                    properties: rest,
                  };
                }),
              ),
            );
          });
        } else {
          Util.log("USER", "dataset", "fail-to-fetch-places-from-dataset");
        }
      }),
    );

    await Promise.all(allPlacePagePromises);
    store.dispatch(updatePlacesLoadStatus("loaded"));
  },

  getListRoutes: function() {
    // Return a list of the routes that are allowed to show the list view.
    // Navigating to any other route will automatically hide the list view.
    return ["viewList", "filterMap"];
  },

  isAddingPlace: function(model) {
    return this.$panel.is(":visible") && this.$panel.hasClass("place-form");
  },
  onClickClosePanelBtn: function(evt) {
    evt.preventDefault();

    Util.log("USER", "panel", "close-btn-click");
    // remove map mask if the user closes the side panel
    this.hideSpotlightMask();
    this.options.router.navigate("/", { trigger: true });

    if (this.isStoryActive) {
      this.isStoryActive = false;
    }
  },
  setBodyClass: function(/* newBodyClasses */) {
    var bodyClasses = ["content-visible", "place-form-visible", "page-visible"],
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
  viewMap: async function({ zoom, lat, lng, isInviteModalOpen = false }) {
    if (zoom && lat && lng) {
      store.dispatch(
        updateMapViewport({
          latitude: lat,
          longitude: lng,
          zoom: zoom,
        }),
      );
    }

    this.hidePanel();
    this.renderRightSidebar();
    this.hideNewPin();
    this.setBodyClass();
    this.renderMain({ isInviteModalOpen });
    if (datasetsLoadStatusSelector(store.getState()) === "unloaded") {
      await this.fetchAndLoadDatasets();
    }
    if (!userSelector(store.getState()).token) {
      await this.fetchAndLoadUser();
    }
    if (placesLoadStatusSelector(store.getState()) === "unloaded") {
      await this.fetchAndLoadPlaces();
    }
  },

  renderRightSidebar: function() {
    if ($("body").hasClass("right-sidebar-active")) {
      return;
    }
    if (this.options.rightSidebarConfig.is_enabled) {
      $("body").addClass("right-sidebar-active");
      if (this.options.rightSidebarConfig.is_visible_default) {
        $("body").addClass("right-sidebar-visible");
        store.dispatch(setRightSidebar(true));
        this.setMapDimensions();
      }

      // REACT PORT SECTION ///////////////////////////////////////////////////
      ReactDOM.render(
        <Provider store={store}>
          <ThemeProvider>
            <RightSidebar
              router={this.options.router}
              setMapDimensions={this.setMapDimensions.bind(this)}
            />
          </ThemeProvider>
        </Provider>,
        document.getElementById("right-sidebar-container"),
      );
      // END REACT PORT SECTION ///////////////////////////////////////////////
    }
  },
  newPlace: async function() {
    if (
      hasAnonAbilitiesInAnyDataset({
        state: store.getState(),
        submissionSet: "places",
        abilities: ["create"],
      }) ||
      hasGroupAbilitiesInDatasets({
        state: store.getState(),
        submissionSet: "places",
        abilities: ["create"],
        datasetSlugs: datasetSlugsSelector(store.getState()),
      })
    ) {
      if (datasetsLoadStatusSelector(store.getState()) === "unloaded") {
        await this.fetchAndLoadDatasets();
      }

      store.dispatch(removeFocusedGeoJSONFeatures());
      recordGoogleAnalyticsHit("/new");
      this.renderRightSidebar();
      this.renderMain();
      // REACT PORT SECTION //////////////////////////////////////////////////////
      // NOTE: This wrapper component is temporary, and will be factored out
      // when the AppView is ported.
      ReactDOM.render(
        <Provider store={store}>
          <ThemeProvider>
            <FormCategoryMenuWrapper
              hideSpotlightMask={this.hideSpotlightMask.bind(this)}
              showNewPin={this.showNewPin.bind(this)}
              hideNewPin={this.hideNewPin.bind(this)}
              hidePanel={this.hidePanel.bind(this)}
              router={this.options.router}
              customHooks={this.options.customHooks}
              // '#content article' and 'body' represent the two containers into
              // which panel content is rendered (one at desktop size and one at
              // mobile size).
              // TODO: Improve this when we move overall app layout management to
              // Redux.
              container={document.querySelector(
                Util.getPageLayout() === "desktop"
                  ? "#content article"
                  : "body",
              )}
              render={(state, props, onCategoryChange) => {
                return (
                  <InputForm
                    {...props}
                    selectedCategory={state.selectedCategory}
                    datasetUrl={state.datasetUrl}
                    datasetSlug={state.datasetSlug}
                    isSingleCategory={state.isSingleCategory}
                    onCategoryChange={onCategoryChange}
                  />
                );
              }}
              customComponents={this.options.customComponents}
            />
          </ThemeProvider>
        </Provider>,
        document.querySelector("#content article"),
      );

      this.$panel.removeClass().addClass("place-form");
      this.showPanel();
      this.setBodyClass("content-visible", "place-form-visible");
      store.dispatch(setAddPlaceButtonVisibility(false));
      if (!userSelector(store.getState()).token) {
        await this.fetchAndLoadUser();
      }
      if (placesLoadStatusSelector(store.getState()) === "unloaded") {
        await this.fetchAndLoadPlaces();
      }
      emitter.emit(constants.PLACE_COLLECTION_UNFOCUS_ALL_PLACES_EVENT);
    } else {
      this.options.router.navigate("/", { trigger: true });
    }
    // END REACT PORT SECTION //////////////////////////////////////////////////
  },

  viewPlace: async function(args) {
    this.renderMain();
    this.renderRightSidebar();

    if (datasetsLoadStatusSelector(store.getState()) === "unloaded") {
      await this.fetchAndLoadDatasets();
    }
    if (!userSelector(store.getState()).token) {
      await this.fetchAndLoadUser();
    }
    // TODO: Restore the ability to fetch a single place's data on a direct
    // route to that place and render immediately.
    if (placesLoadStatusSelector(store.getState()) === "unloaded") {
      await this.fetchAndLoadPlaces();
    }

    const place = placeSelector(store.getState(), args.placeId);
    if (!place) {
      this.options.router.navigate("/");
      return;
    }

    this.setBodyClass("content-visible");

    store.dispatch(updateEditModeToggled(false));

    const story = place.story;
    if (story) {
      this.isStoryActive = true;

      // Set layers for this story chapter.
      story.visibleLayerGroupIds.forEach(layerGroupId =>
        store.dispatch(updateLayerGroupVisibility(layerGroupId, true)),
      );
      // Hide all other layers.
      mapConfigSelector(store.getState())
        .layerGroups.filter(
          layerGroup => !story.visibleLayerGroupIds.includes(layerGroup.id),
        )
        .forEach(layerGroup =>
          store.dispatch(updateLayerGroupVisibility(layerGroup.id, false)),
        );

      if (!this.hasBodyClass("right-sidebar-visible")) {
        $("body").addClass("right-sidebar-visible");
      }
    }

    // Set the new map viewport, reconciling with custom story settings if this
    // model is part of a story.
    if (story && story.panTo) {
      const newViewport = {
        latitude: story.panTo[1],
        longitude: story.panTo[0],
        transitionDuration: 3000,
      };
      if (story.zoom) {
        newViewport.zoom = story.zoom;
      }

      store.dispatch(updateMapViewport(newViewport));
    } else if (
      place.geometry.type === "LineString" ||
      place.geometry.type === "Polygon"
    ) {
      const extent = getExtentFromGeometry(place.geometry);
      const newViewport = this.getWebMercatorViewport().fitBounds(
        // WebMercatorViewport wants bounds in [[lng, lat], [lng lat]] form.
        [[extent[0], extent[1]], [extent[2], extent[3]]],
        { padding: 50 },
      );

      store.dispatch(
        updateMapViewport({
          latitude: newViewport.latitude,
          longitude: newViewport.longitude,
          transitionDuration: story ? 3000 : 200,
          zoom: newViewport.zoom,
        }),
      );
    } else if (place.geometry.type === "Point") {
      const newViewport = {
        latitude: place.geometry.coordinates[1],
        longitude: place.geometry.coordinates[0],
        transitionDuration: story ? 3000 : 200,
      };
      if (story && story.zoom) {
        newViewport.zoom = story.zoom;
      }

      store.dispatch(updateMapViewport(newViewport));
    }

    if (!place.story && this.isStoryActive) {
      this.isStoryActive = false;
    }

    // Focus this Place's feature on the map.
    const { geometry, ...rest } = place;
    store.dispatch(
      updateFocusedGeoJSONFeatures([
        {
          type: "Feature",
          geometry: {
            type: geometry.type,
            coordinates: geometry.coordinates,
          },
          properties: rest,
        },
      ]),
    );

    ReactDOM.unmountComponentAtNode(document.querySelector("#content article"));

    ReactDOM.render(
      <Provider store={store}>
        <ThemeProvider>
          <PlaceDetail
            placeId={args.placeId}
            datasetSlug={place._datasetSlug}
            container={document.querySelector("#content article")}
            isGeocodingBarEnabled={this.options.mapConfig.geocoding_bar_enabled}
            scrollToResponseId={args.responseId}
            router={this.options.router}
          />
        </ThemeProvider>
      </Provider>,
      document.querySelector("#content article"),
    );

    $("#main-btns-container").addClass(
      this.options.placeConfig.add_button_location || "pos-top-left",
    );

    this.showPanel();
    this.hideNewPin();
    this.setBodyClass("content-visible");

    if (story && !story.spotlight) {
      this.hideSpotlightMask();
    } else {
      this.showSpotlightMask();
    }
  },

  setMapDimensions: function() {
    // TODO: Remove these layout hacks when we port AppView.
    if (Util.getPageLayout() === "mobile") {
      $("#main").height(
        window.innerHeight -
          ($("#site-header").height() + $("#add-place-button").height()),
      );
    } else {
      $("#main").height(window.innerHeight - $("#site-header").height());
    }

    // To avoid a race condition between CSS resizing elements and the map
    // initiating a viewport change, we manually calculate what the dimensions of
    // the map *should* be given the current state of the UI. The race
    // condition that this code avoids was the cause of the old off-center bug.
    store.dispatch(
      updateMapViewport({
        width:
          Util.getPageLayout() === "desktop"
            ? window.innerWidth -
              (contentPanelOpenSelector(store.getState())
                ? this.$panel.width()
                : 0) -
              (rightSidebarExpandedSelector(store.getState())
                ? this.$rightSidebar.width()
                : 0)
            : window.innerWidth,
        height:
          Util.getPageLayout() === "desktop"
            ? window.innerHeight - $("#site-header").height()
            : window.innerHeight -
              $("#site-header").height() -
              $("#geocode-address-bar").height() -
              (contentPanelOpenSelector(store.getState())
                ? // 0.4 corresponds to 100% - the 60% of the available height
                  // that the map occupies on mobile.
                  (window.innerHeight -
                    $("#geocode-address-bar").height() -
                    $("#site-header").height()) *
                  0.4
                : $("#add-place-button").height()),
      }),
    );
  },

  getWebMercatorViewport: function() {
    const container = document
      .getElementById("map-container")
      .getBoundingClientRect();

    return new WebMercatorViewport({
      width: container.width,
      height: container.height,
    });
  },

  viewSha: function() {
    $("#main").addClass("is-visuallyhidden");
    $("#list-container").addClass("is-visuallyhidden");
    $("#dashboard-container").addClass("is-visuallyhidden");
    $("#sha-container").removeClass("is-visuallyhidden");
    ReactDOM.render(
      <div>{GIT_SHA}</div>,
      document.getElementById("sha-container"),
    );
  },

  viewPage: async function(slug) {
    const page = pageSelector({
      state: store.getState(),
      slug: slug,
      lang: this.options.languageCode,
    });

    if (page) {
      store.dispatch(removeFocusedGeoJSONFeatures());
      ReactDOM.render(
        <CustomPage pageContent={page.content} />,
        document.querySelector("#content article"),
      );

      this.$panel.removeClass().addClass("page page-" + slug);
      this.hideNewPin();
      this.setBodyClass("content-visible");
      this.renderRightSidebar();
      this.renderMain();
      $("#main-btns-container").addClass(
        this.options.placeConfig.add_button_location || "pos-top-left",
      );
      this.hideSpotlightMask();

      this.showPanel();
      if (datasetsLoadStatusSelector(store.getState()) === "unloaded") {
        await this.fetchAndLoadDatasets();
      }
      if (!userSelector(store.getState()).token) {
        await this.fetchAndLoadUser();
      }
      if (placesLoadStatusSelector(store.getState()) === "unloaded") {
        await this.fetchAndLoadPlaces();
      }
    } else {
      this.options.router.navigate("/", { trigger: true });
    }
  },
  showNewPin: function() {
    store.dispatch(setMapCenterpointVisibility(true));
    this.showSpotlightMask();
  },
  hideNewPin: function() {
    store.dispatch(setMapCenterpointVisibility(false));
  },
  showPanel: function() {
    this.$panel.show();
    this.$panel.css("display", "block");
    Util.log("APP", "panel-state", "open");
    store.dispatch(setContentPanel(true));
    this.setMapDimensions();
  },
  hidePanel: function() {
    // REACT PORT SECTION //////////////////////////////////////////////////////
    ReactDOM.unmountComponentAtNode(document.querySelector("#content article"));
    // END REACT PORT SECTION //////////////////////////////////////////////////

    this.$panel.hide();
    this.setBodyClass();

    $("#main-btns-container").addClass(
      this.options.placeConfig.add_button_location || "pos-top-left",
    );

    Util.log("APP", "panel-state", "closed");
    this.hideSpotlightMask();
    store.dispatch(setContentPanel(false));
    this.setMapDimensions();
    store.dispatch(removeFocusedGeoJSONFeatures());
  },
  showSpotlightMask: function() {
    $("#spotlight-mask").show();
  },
  hideSpotlightMask: function() {
    $("#spotlight-mask").hide();
  },
  renderMain: function({ isInviteModalOpen = false }) {
    $("#main").removeClass("is-visuallyhidden");
    $("#list-container").addClass("is-visuallyhidden");
    $("#dashboard-container").addClass("is-visuallyhidden");
    $("#sha-container").addClass("is-visuallyhidden");

    // remove "list page" content:
    ReactDOM.unmountComponentAtNode(document.getElementById("list-container"));
    ReactDOM.unmountComponentAtNode(
      document.getElementById("dashboard-container"),
    );
    ReactDOM.unmountComponentAtNode(document.getElementById("sha-container"));

    // render "main page" content:
    if (geocodeAddressBarVisibilitySelector(store.getState())) {
      $("#geocode-address-bar").removeClass("is-visuallyhidden");
      ReactDOM.render(
        <Provider store={store}>
          <ThemeProvider>
            <GeocodeAddressBar mapConfig={this.options.mapConfig} />
          </ThemeProvider>
        </Provider>,
        document.getElementById("geocode-address-bar"),
      );
    }

    if (this.options.leftSidebarConfig.is_enabled) {
      ReactDOM.render(
        <Provider store={store}>
          <LeftSidebar />
        </Provider>,
        document.getElementById("left-sidebar-container"),
      );
    }

    ReactDOM.render(
      <Provider store={store}>
        <ThemeProvider>
          <MainMap
            container={document.getElementById("map-container")}
            router={this.options.router}
            setSlippyRoute={this.setSlippyRoute.bind(this)}
            isInviteModalOpen={isInviteModalOpen}
          />
        </ThemeProvider>
      </Provider>,
      document.getElementById("map-component"),
    );

    store.dispatch(setAddPlaceButtonVisibility(true));
    store.dispatch(setCurrentTemplate("map"));
    this.setMapDimensions();
  },
  viewList: async function() {
    this.renderRightSidebar();
    if (datasetsLoadStatusSelector(store.getState()) === "unloaded") {
      await this.fetchAndLoadDatasets();
    }
    if (!userSelector(store.getState()).token) {
      await this.fetchAndLoadUser();
    }
    if (placesLoadStatusSelector(store.getState()) === "unloaded") {
      await this.fetchAndLoadPlaces();
    }

    this.renderList();
  },
  renderList: function() {
    // Remove "main page" content:
    $("#geocode-address-bar").addClass("is-visuallyhidden");
    const geocodeAddressBar = document.getElementById("geocode-address-bar");
    if (geocodeAddressBar) {
      ReactDOM.unmountComponentAtNode(geocodeAddressBar);
    }
    ReactDOM.unmountComponentAtNode(document.getElementById("map-component"));

    const contentNode = document.querySelector(
      Util.getPageLayout() === "desktop" ? "#content article" : "body",
    );
    ReactDOM.unmountComponentAtNode(contentNode);

    // Render "list page" content:
    $("#list-container").removeClass("is-visuallyhidden");
    this.hidePanel();
    ReactDOM.render(
      <Provider store={store}>
        <ThemeProvider>
          <PlaceList router={this.options.router} />
        </ThemeProvider>
      </Provider>,
      document.getElementById("list-container"),
    );

    store.dispatch(setCurrentTemplate("list"));
  },
  viewDashboard: async function() {
    $("#geocode-address-bar").addClass("is-visuallyhidden");
    const geocodeAddressBar = document.getElementById("geocode-address-bar");
    if (geocodeAddressBar) {
      ReactDOM.unmountComponentAtNode(geocodeAddressBar);
    }
    ReactDOM.unmountComponentAtNode(document.getElementById("map-component"));

    $("#dashboard-container").removeClass("is-visuallyhidden");
    if (datasetsLoadStatusSelector(store.getState()) === "unloaded") {
      this.fetchAndLoadDatasets();
    }
    if (!userSelector(store.getState()).token) {
      await this.fetchAndLoadUser();
    }
    if (placesLoadStatusSelector(store.getState()) === "unloaded") {
      this.fetchAndLoadPlaces();
    }

    // If module fails to load (eg: due to network error), use error boundaries to
    // show a helpful message
    // https://reactjs.org/docs/code-splitting.html#error-boundaries
    ReactDOM.render(
      <Suspense fallback={<div>Loading...</div>}>
        <Provider store={store}>
          <ThemeProvider>
            <Dashboard
              router={this.options.router}
              datasetDownloadConfig={this.options.appConfig.dataset_download}
              apiRoot={this.options.appConfig.api_root}
            />
          </ThemeProvider>
        </Provider>
      </Suspense>,
      document.getElementById("dashboard-container"),
    );
    store.dispatch(setCurrentTemplate("dashboard"));
  },
});

export { store };

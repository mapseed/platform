import React from "react";
import emitter from "../../utils/emitter";
import ReactDOM from "react-dom";
import languageModule from "../../language-module";
import browserUpdate from "browser-update";

import { Provider } from "react-redux";
import { createStore } from "redux";
import reducer from "../../state/reducers";
import mapseedApiClient from "../../client/mapseed-api-client";
import { ThemeProvider } from "emotion-theming";
import theme from "../../../../theme";

// Most of react-virtualized's styles are functional (eg position, size).
// Functional styles are applied directly to DOM elements.
// The Table component ships with a few presentational styles as well.
// They are optional, but if you want them you will need to also import the CSS file.
// This only needs to be done once; probably during your application's bootstrapping process.
import "react-virtualized/styles.css";

import { setMapConfig, mapLayersSelector } from "../../state/ducks/map-config";
import { placesSelector, loadPlaces } from "../../state/ducks/places";
import { setPlaceConfig } from "../../state/ducks/place-config";
import { setStoryConfig } from "../../state/ducks/story-config";
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
import {
  setMapSizeValidity,
  mapLayerStatusesSelector,
  mapPositionSelector,
  mapBasemapSelector,
  setMapPosition,
  initLayers,
  showLayers,
  hideLayers,
  setBasemap,
  setLayerError,
  setLayerLoading,
  setMapDragging,
  setLayerUnloaded,
} from "../../state/ducks/map";
import { setSupportConfig } from "../../state/ducks/support-config";
import { setNavBarConfig } from "../../state/ducks/nav-bar-config";
import {
  setCurrentTemplate,
  setAddPlaceButtonVisibility,
  setMapCenterpointVisibility,
  setGeocodeAddressBarVisibility,
  geocodeAddressBarVisibilitySelector,
} from "../../state/ducks/ui.js";

import MainMap from "../../components/organisms/main-map";
import InputForm from "../../components/input-form";
import VVInputForm from "../../components/vv-input-form";
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
  initialize: function() {
    // TODO(luke): move this into "componentDidMount" when App becomes a
    // component:
    store.dispatch(setMapConfig(this.options.mapConfig));
    store.dispatch(setPlaceConfig(this.options.placeConfig));
    store.dispatch(setLeftSidebarConfig(this.options.leftSidebarConfig));
    store.dispatch(setRightSidebarConfig(this.options.rightSidebarConfig));
    store.dispatch(setStoryConfig(this.options.storyConfig));
    store.dispatch(setAppConfig(this.options.appConfig));
    store.dispatch(loadFormsConfig(this.options.formsConfig));
    store.dispatch(setSupportConfig(this.options.supportConfig));
    store.dispatch(setPagesConfig(this.options.pagesConfig));
    store.dispatch(setNavBarConfig(this.options.navBarConfig));
    store.dispatch(initLayers(this.options.mapConfig.layers));
    store.dispatch(
      setBasemap(
        this.options.mapConfig.layers.find(
          layer => layer.is_basemap && layer.is_visible_default,
        ).id,
      ),
    );
    store.dispatch(
      setMapPosition({
        center: this.options.mapConfig.options.map.center,
        zoom: this.options.mapConfig.options.map.zoom,
      }),
    );

    const storeState = store.getState();
    this.flavorTheme = storeState.appConfig.theme;
    this.adjustedTheme = this.flavorTheme
      ? // ? ancestorTheme => ({ ...ancestorTheme, ...this.flavorTheme,  })
        ancestorTheme => ({
          ...ancestorTheme,
          ...this.flavorTheme,
          brand: { ...ancestorTheme.brand, ...this.flavorTheme.brand },
          bg: {
            ...ancestorTheme.bg,
            ...this.flavorTheme.bg,
          },
          text: { ...ancestorTheme.text, ...this.flavorTheme.text },
        })
      : {};

    languageModule.changeLanguage(this.options.languageCode);

    const self = this;
    // Bootstrapped data from the page
    this.activities = this.options.activities;
    this.places = this.options.places;

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

    if (this.options.placeConfig.adding_supported) {
      store.dispatch(setAddPlaceButtonVisibility(true));
      ReactDOM.render(
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <ThemeProvider theme={this.adjustedTheme}>
              <AddPlaceButton
                onClick={() => {
                  Util.log("USER", "map", "new-place-btn-click");
                  this.options.router.navigate("/new", {
                    trigger: true,
                  });
                }}
              >
                {this.options.placeConfig.add_button_label}
              </AddPlaceButton>
            </ThemeProvider>
          </ThemeProvider>
        </Provider>,
        document.getElementById("add-place-button"),
      );
    }

    ReactDOM.render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ThemeProvider theme={this.adjustedTheme}>
            <MapCenterpoint />
          </ThemeProvider>
        </ThemeProvider>
      </Provider>,
      document.getElementById("map-centerpoint"),
    );

    // Site header
    ReactDOM.render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ThemeProvider theme={this.adjustedTheme}>
            <SiteHeader
              router={this.options.router}
              currentUser={Shareabouts.bootstrapped.currentUser}
              languageCode={this.options.languageCode}
            />
          </ThemeProvider>
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
          <ThemeProvider theme={theme}>
            <ThemeProvider theme={this.adjustedTheme}>
              <InfoModal
                parentId="info-modal-container"
                isModalOpen={true}
                {...modalContent}
              />
            </ThemeProvider>
          </ThemeProvider>
        </Provider>,
        document.getElementById("info-modal-container"),
      );
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
        // no-op
      } else if (self.geocodeAddressView) {
        self.geocodeAddressView.setAddress("");
      }
    });

    if (this.options.mapConfig.geocoding_bar_enabled) {
      store.dispatch(setGeocodeAddressBarVisibility(true));
    }

    // Cache panel elements that we use a lot
    this.$panel = $("#content");
    this.$panelContent = $("#content article");
    this.$panelCloseBtn = $(".close-btn");

    // This is the "center" when the popup is open
    this.offsetRatio = { x: 0.2, y: 0.0 };

    // Show tools for adding data
    this.setBodyClass();
  },

  fetchAndLoadPlaces: async function() {
    const placeParams = {
      // NOTE: this is to include comments/supports while fetching our place models
      include_submissions: true,
    };

    // Use the page size as dictated by the server by default, unless
    // directed to do otherwise in the configuration.
    if (this.options.appConfig.places_page_size) {
      placeParams.page_size = this.options.appConfig.places_page_size;
    }

    // Load places from the API
    const placeCollectionsPromise = mapseedApiClient.place.get({
      placeParams,
      placeCollections: this.places,
      layers: mapLayersSelector(store.getState()),
      setLayerError: layerId => store.dispatch(setLayerError(layerId)),
    });

    const fetchedCollections = await placeCollectionsPromise;
    const allPlaces = fetchedCollections.reduce((places, collection) => {
      return [...collection.models.map(model => model.toJSON()), ...places];
    }, []);
    store.dispatch(loadPlaces(allPlaces));

    // Update the load statuses of our layers that are being fetched:
    const layers = mapLayerStatusesSelector(store.getState());
    Object.values(layers).forEach(layerStatus => {
      if (layerStatus.loadStatus === "fetching") {
        if (layerStatus.isVisible) {
          // mark the layer to be loaded onto the map
          store.dispatch(setLayerLoading(layerStatus.id));
        } else {
          // the layer is now 'fetched', but don't load it into the map.
          store.dispatch(setLayerUnloaded(layerStatus.id));
        }
      }
    });
  },

  getListRoutes: function() {
    // Return a list of the routes that are allowed to show the list view.
    // Navigating to any other route will automatically hide the list view.
    return ["viewList", "filterMap"];
  },

  isAddingPlace: function(model) {
    return this.$panel.is(":visible") && this.$panel.hasClass("place-form");
  },
  onMapZoomEnd: function(isUserZoom = true) {
    if (this.hasBodyClass("content-visible") === true && isUserZoom) {
      this.hideSpotlightMask();
    }
  },
  onMapMoveStart: function(evt) {
    store.dispatch(setMapDragging(true));
  },
  onMapMoveEnd: function(isUserMove = true) {
    store.dispatch(setMapDragging(false));
    if (this.hasBodyClass("content-visible") === false && isUserMove) {
      const { zoom, center } = mapPositionSelector(store.getState());
      this.setLocationRoute(zoom, center.lat, center.lng);
    }
  },
  onMapDragEnd: function(evt) {
    if (this.hasBodyClass("content-visible") === true) {
      this.hideSpotlightMask();
    }
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

    emitter.emit(constants.PLACE_COLLECTION_UNFOCUS_ALL_PLACES_EVENT);
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
  setLocationRoute: function(zoom, lat, lng) {
    this.options.router.navigate(
      "/" +
        parseFloat(zoom).toFixed(2) +
        "/" +
        parseFloat(lat).toFixed(5) +
        "/" +
        parseFloat(lng).toFixed(5),
    );
  },

  viewMap: async function(zoom, lat, lng) {
    let mapPosition;

    if (zoom && lat && lng) {
      mapPosition = {
        coordinates: {
          lat: lat,
          lng: lng,
        },
        zoom: zoom,
      };
    }

    this.hidePanel();
    this.renderRightSidebar();
    this.hideNewPin();
    this.destroyNewModels();
    this.setBodyClass();
    this.renderMain(mapPosition);
    if (!placesSelector(store.getState())) {
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
      }

      // REACT PORT SECTION ///////////////////////////////////////////////////
      ReactDOM.render(
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <ThemeProvider theme={this.adjustedTheme}>
              <RightSidebar
                legacyPlaces={this.places}
                router={this.options.router}
              />
            </ThemeProvider>
          </ThemeProvider>
        </Provider>,
        document.getElementById("right-sidebar-container"),
      );
      // END REACT PORT SECTION ///////////////////////////////////////////////
    }
  },
  newPlace: async function() {
    this.renderRightSidebar();
    this.renderMain();
    // REACT PORT SECTION //////////////////////////////////////////////////////
    // NOTE: This wrapper component is temporary, and will be factored out
    // when the AppView is ported.
    ReactDOM.render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ThemeProvider theme={this.adjustedTheme}>
            <FormCategoryMenuWrapper
              hideSpotlightMask={this.hideSpotlightMask.bind(this)}
              showNewPin={this.showNewPin.bind(this)}
              hideNewPin={this.hideNewPin.bind(this)}
              hidePanel={this.hidePanel.bind(this)}
              places={this.places}
              router={this.options.router}
              customHooks={this.options.customHooks}
              // '#content article' and 'body' represent the two containers into
              // which panel content is rendered (one at desktop size and one at
              // mobile size).
              // TODO: Improve this when we move overall app layout management to
              // Redux.
              container={document.querySelector(
                Util.getPageLayout() === '"desktop"' ||
                Util.getPageLayout() === "desktop"
                  ? "#content article"
                  : "body",
              )}
              render={(state, props, onCategoryChange) => {
                if (
                  props.customComponents &&
                  props.customComponents.InputForm === "VVInputForm"
                ) {
                  return (
                    <VVInputForm
                      {...props}
                      selectedCategory={state.selectedCategory}
                      isSingleCategory={state.isSingleCategory}
                      onCategoryChange={onCategoryChange}
                    />
                  );
                } else {
                  return (
                    <InputForm
                      {...props}
                      selectedCategory={state.selectedCategory}
                      isSingleCategory={state.isSingleCategory}
                      onCategoryChange={onCategoryChange}
                    />
                  );
                }
              }}
              customComponents={this.options.customComponents}
            />
          </ThemeProvider>
        </ThemeProvider>
      </Provider>,
      document.querySelector("#content article"),
    );

    this.$panel.removeClass().addClass("place-form");
    this.$panel.show();
    this.setBodyClass("content-visible", "place-form-visible");
    store.dispatch(setMapSizeValidity(false));
    store.dispatch(setAddPlaceButtonVisibility(false));
    if (!placesSelector(store.getState())) {
      await this.fetchAndLoadPlaces();
    }
    emitter.emit(constants.PLACE_COLLECTION_UNFOCUS_ALL_PLACES_EVENT);
    // END REACT PORT SECTION //////////////////////////////////////////////////
  },

  viewPlace: async function(args) {
    this.renderMain();
    this.renderRightSidebar();
    if (!placesSelector(store.getState())) {
      await this.fetchAndLoadPlaces();
    }
    const datasetId = this.options.mapConfig.layers.find(
      layer => layer.slug === args.datasetSlug,
    ).id;
    const model = this.places[datasetId].get(args.modelId);
    if (!model) {
      this.options.router.navigate("/");
      return;
    }

    // REACT PORT SECTION //////////////////////////////////////////////////
    ReactDOM.unmountComponentAtNode(document.querySelector("#content article"));

    ReactDOM.render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ThemeProvider theme={this.adjustedTheme}>
            <PlaceDetail
              collectionId={datasetId}
              container={document.querySelector("#content article")}
              currentUser={Shareabouts.bootstrapped.currentUser}
              isGeocodingBarEnabled={
                this.options.mapConfig.geocoding_bar_enabled
              }
              model={model}
              places={this.places}
              scrollToResponseId={args.responseId}
              router={this.options.router}
              userToken={this.options.userToken}
            />
          </ThemeProvider>
        </ThemeProvider>
      </Provider>,
      document.querySelector("#content article"),
    );

    this.$panel.show();
    this.setBodyClass("content-visible");

    $("#main-btns-container").addClass(
      this.options.placeConfig.add_button_location || "pos-top-left",
    );
    // END REACT PORT SECTION //////////////////////////////////////////////

    this.hideNewPin();
    this.destroyNewModels();
    this.setBodyClass("content-visible");
    this.showSpotlightMask();

    const geometry = model.get("geometry");

    if (model.get("story")) {
      this.isStoryActive = true;
      const storyChapterVisibleLayers = model.get("story").visibleLayers;
      const storyChapterBasemap = model.get("story").basemap;

      mapBasemapSelector(store.getState()) !== storyChapterBasemap &&
        store.dispatch(setBasemap(storyChapterBasemap));
      store.dispatch(showLayers(storyChapterVisibleLayers));
      // Hide all other layers.
      store.dispatch(
        hideLayers(
          mapLayersSelector(store.getState())
            .filter(layer => !layer.is_basemap)
            .filter(layer => !storyChapterVisibleLayers.includes(layer.id))
            .map(layer => layer.id),
        ),
      );

      if (!model.get("story").spotlight) {
        this.hideSpotlightMask();
      }

      if (!this.hasBodyClass("right-sidebar-visible")) {
        $("body").addClass("right-sidebar-visible");
      }
    }

    // Fire an event to set map position, reconciling with custom story
    // settings if this model is part of a story.
    const story = model.get("story") || {};

    if (story.panTo) {
      // If a story chapter declares a custom centerpoint, regardless of the
      // geometry type, assume that we want to fly to a point.
      emitter.emit(constants.MAP_TRANSITION_FLY_TO_POINT, {
        coordinates:
          story.panTo || mapPositionSelector(store.getState()).center,
        zoom: story.zoom || mapPositionSelector(store.getState()).zoom,
      });
    } else if (geometry.type === "LineString") {
      emitter.emit(constants.MAP_TRANSITION_FIT_LINESTRING_COORDS, {
        coordinates: story.panTo ? [story.panTo] : geometry.coordinates,
      });
    } else if (geometry.type === "Polygon") {
      emitter.emit(constants.MAP_TRANSITION_FIT_POLYGON_COORDS, {
        coordinates: story.panTo ? [[story.panTo]] : geometry.coordinates,
      });
    } else if (geometry.type === "Point") {
      emitter.emit(constants.MAP_TRANSITION_FLY_TO_POINT, {
        coordinates: geometry.coordinates,
        zoom: story.zoom || mapPositionSelector(store.getState()).zoom,
      });
    }

    emitter.emit(constants.PLACE_COLLECTION_FOCUS_PLACE_EVENT, {
      datasetId: datasetId,
      modelId: model.get("id"),
    });

    if (!model.get("story") && this.isStoryActive) {
      this.isStoryActive = false;
    }

    store.dispatch(setMapSizeValidity(false));
  },

  viewPage: async function(slug) {
    const page = pageSelector({
      state: store.getState(),
      slug: slug,
      lang: this.options.languageCode,
    });

    if (page) {
      ReactDOM.render(
        <CustomPage pageContent={page.content} />,
        document.querySelector("#content article"),
      );

      this.$panel.removeClass().addClass("page page-" + slug);
      this.$panel.show();
      this.hideNewPin();
      this.destroyNewModels();
      $(Shareabouts).trigger("panelshow", [
        this.options.router,
        Backbone.history.getFragment(),
      ]);
      Util.log("APP", "panel-state", "open");
      this.setBodyClass("content-visible");
      store.dispatch(setMapSizeValidity(false));
      this.renderRightSidebar();
      this.renderMain();
      $("#main-btns-container").addClass(
        this.options.placeConfig.add_button_location || "pos-top-left",
      );
      if (!placesSelector(store.getState())) {
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
  hidePanel: function() {
    // REACT PORT SECTION //////////////////////////////////////////////////////
    ReactDOM.unmountComponentAtNode(document.querySelector("#content article"));
    // END REACT PORT SECTION //////////////////////////////////////////////////

    this.$panel.hide();
    this.setBodyClass();
    store.dispatch(setMapSizeValidity(false));

    $("#main-btns-container").addClass(
      this.options.placeConfig.add_button_location || "pos-top-left",
    );

    Util.log("APP", "panel-state", "closed");
    this.hideSpotlightMask();
  },
  showSpotlightMask: function() {
    $("#spotlight-mask").show();
  },
  hideSpotlightMask: function() {
    $("#spotlight-mask").hide();
  },
  renderMain: function(mapPosition) {
    $("#main").removeClass("is-visuallyhidden");
    $("#list-container").addClass("is-visuallyhidden");

    // remove "list page" content:
    $("#list-container").addClass("is-visuallyhidden");
    ReactDOM.unmountComponentAtNode(document.getElementById("list-container"));

    // render "main page" content:
    if (geocodeAddressBarVisibilitySelector(store.getState())) {
      $("#geocode-address-bar").removeClass("is-visuallyhidden");
      ReactDOM.render(
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <ThemeProvider theme={this.adjustedTheme}>
              <GeocodeAddressBar mapConfig={this.options.mapConfig} />
            </ThemeProvider>
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
        <ThemeProvider theme={theme}>
          <ThemeProvider theme={this.adjustedTheme}>
            <MainMap
              addPlaceButtonLabel={this.options.placeConfig.add_button_label}
              container="map"
              places={this.places}
              router={this.options.router}
              onZoomend={this.onMapZoomEnd.bind(this)}
              onMovestart={this.onMapMoveStart.bind(this)}
              onMoveend={this.onMapMoveEnd.bind(this)}
              onDragend={this.onMapDragEnd.bind(this)}
              store={store}
            />
          </ThemeProvider>
        </ThemeProvider>
      </Provider>,
      document.getElementById("map-component"),
    );

    store.dispatch(setCurrentTemplate("map"));

    if (mapPosition) {
      emitter.emit(constants.MAP_TRANSITION_EASE_TO_POINT, {
        coordinates: mapPosition.coordinates,
        zoom: mapPosition.zoom,
      });
    }

    if (this.options.placeConfig.adding_supported) {
      store.dispatch(setAddPlaceButtonVisibility(true));
    }
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
  viewList: async function() {
    emitter.emit(constants.PLACE_COLLECTION_UNFOCUS_ALL_PLACES_EVENT);
    this.renderRightSidebar();
    if (!placesSelector(store.getState())) {
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
      Util.getPageLayout() === '"desktop"' || Util.getPageLayout() === "desktop"
        ? "#content article"
        : "body",
    );
    ReactDOM.unmountComponentAtNode(contentNode);

    // Render "list page" content:
    $("#list-container").removeClass("is-visuallyhidden");
    this.hidePanel();
    ReactDOM.render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ThemeProvider theme={this.adjustedTheme}>
            <PlaceList router={this.options.router} />
          </ThemeProvider>
        </ThemeProvider>
      </Provider>,
      document.getElementById("list-container"),
    );

    store.dispatch(setCurrentTemplate("list"));
  },
});

export { store };

import React from "react";
// REACT PORT SECTION //////////////////////////////////////////////////////////
import ReactDOM from "react-dom";
import emitter from "../../utils/emitter";
import languageModule from "../../language-module";
import browserUpdate from "browser-update";

import { Provider } from "react-redux";
import { createStore } from "redux";
import reducer from "../../state/reducers";
import mapseedApiClient from "../../client/mapseed-api-client";
import { ThemeProvider } from "emotion-theming";
import theme from "../../../../theme";

import { setMapConfig } from "../../state/ducks/map-config";
import { setPlaces } from "../../state/ducks/places";
import { setPlaceConfig } from "../../state/ducks/place-config";
import { setStoryConfig } from "../../state/ducks/story-config";
import { setSurveyConfig } from "../../state/ducks/survey-config";
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
  mapPositionSelector,
  mapBasemapSelector,
  setBasemap,
  setLayerStatus,
  mapLayerStatusesSelector,
} from "../../state/ducks/map";
import { setSupportConfig } from "../../state/ducks/support-config";

import MainMap from "../../components/organisms/main-map";
import InputForm from "../../components/input-form";
import VVInputForm from "../../components/vv-input-form";
import PlaceDetail from "../../components/place-detail";
import FormCategoryMenuWrapper from "../../components/input-form/form-category-menu-wrapper";
import GeocodeAddressBar from "../../components/geocode-address-bar";
import InfoModal from "../../components/organisms/info-modal";
import RightSidebar from "../../components/templates/right-sidebar";
import LeftSidebar from "../../components/organisms/left-sidebar";
import UserMenu from "../../components/molecules/user-menu";

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

// Views
var PagesNavView = require("mapseed-pages-nav-view");
var PlaceCounterView = require("mapseed-place-counter-view");

export default Backbone.View.extend({
  events: {
    "click #add-place": "onClickAddPlaceBtn",
    "click .close-btn": "onClickClosePanelBtn",
    "click .list-toggle-btn": "toggleListView",
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
    store.dispatch(setSurveyConfig(this.options.surveyConfig));
    store.dispatch(setSupportConfig(this.options.supportConfig));

    this.storeState = store.getState();
    this.flavorTheme = this.storeState.appConfig.theme;
    this.adjustedTheme = this.flavorTheme
      ? ancestorTheme => ({ ...ancestorTheme, ...this.flavorTheme })
      : {};

    languageModule.changeLanguage(this.options.languageCode);

    var self = this,
      // Only include submissions if the list view is enabled (anything but false)
      includeSubmissions = this.options.appConfig.list_enabled !== false,
      placeParams = {
        // NOTE: this is to simply support the list view. It won't
        // scale well, so let's think about a better solution.
        include_submissions: includeSubmissions,
      };

    // Use the page size as dictated by the server by default, unless
    // directed to do otherwise in the configuration.
    if (this.options.appConfig.places_page_size) {
      placeParams.page_size = this.options.appConfig.places_page_size;
    }

    // Track whether the list view is open:
    this.isListOpen = false;

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

    // On any route (/place or /page), hide the list view
    // and render the contents of the main page:
    this.options.router.bind(
      "route",
      function(route) {
        if (!_.contains(this.getListRoutes(), route)) {
          this.renderMain();
        }
      },
      this,
    );

    // Only append the tools to add places (if supported)
    $("#map-container").append(Handlebars.templates["centerpoint"]());
    // NOTE: append add place/story buttons after the #map-container
    // div (rather than inside of it) in order to support bottom-clinging buttons
    $("#map-container").after(
      Handlebars.templates["add-places"](this.options.placeConfig),
    );

    this.pagesNavView = new PagesNavView({
      el: "#pages-nav-container",
      pagesConfig: this.options.pagesConfig,
      placeConfig: this.options.placeConfig,
      router: this.options.router,
    }).render();

    ReactDOM.render(
      <ThemeProvider theme={theme}>
        <ThemeProvider theme={this.adjustedTheme}>
          <UserMenu
            router={this.options.router}
            apiRoot={this.storeState.appConfig.api_root}
            currentUser={Shareabouts.bootstrapped.currentUser}
            datasetDownloadConfig={this.storeState.appConfig.dataset_download}
          />
        </ThemeProvider>
      </ThemeProvider>,
      document.getElementById("auth-nav-container"),
    );

    // Init the place-counter
    this.placeCounterView = new PlaceCounterView({
      el: "#place-counter",
      router: this.options.router,
      mapConfig: this.options.mapConfig,
      places: this.places,
    }).render();

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
        self.conditionallyReverseGeocode();
      } else if (self.geocodeAddressView) {
        self.geocodeAddressView.setAddress("");
      }
    });

    // Cache panel elements that we use a lot
    this.$panel = $("#content");
    this.$panelContent = $("#content article");
    this.$panelCloseBtn = $(".close-btn");
    this.$centerpoint = $("#centerpoint");
    this.$addButton = $("#add-place-btn-container");

    // This is the "center" when the popup is open
    this.offsetRatio = { x: 0.2, y: 0.0 };

    // Show tools for adding data
    this.setBodyClass();
    this.showCenterPoint();

    // Load places from the API
    // TODO(luke): move this into componentDidMount when App is ported
    // to a component:
    const placeCollectionsPromise = mapseedApiClient.place.get({
      placeParams,
      placeCollections: self.places,
      mapConfig: self.options.mapConfig,
      setLayerStatus: (layerId, layerStatus) =>
        store.dispatch(setLayerStatus(layerId, layerStatus)),
    });

    // Load activities from the API
    _.each(this.activities, function(collection, key) {
      collection.fetch({
        reset: true,
        attribute: "target",
        attributesToAdd: {
          datasetId: _.find(self.options.mapConfig.layers, function(layer) {
            return layer.id == key;
          }).id,
          datasetSlug: _.find(self.options.mapConfig.layers, function(layer) {
            return layer.id == key;
          }).slug,
        },
      });
    });

    // TODO(luke): When AppView is ported to a react component, await
    // the place collections to load in the App component:
    placeCollectionsPromise.then(fetchedCollections => {
      const allPlaces = fetchedCollections.reduce((places, collection) => {
        return [...collection.models.map(model => model.toJSON()), ...places];
      }, []);
      store.dispatch(setPlaces(allPlaces));
    });
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
                placeCollectionsPromise={placeCollectionsPromise}
                places={this.places}
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
    this.$centerpoint.addClass("dragging");
  },
  onMapMoveEnd: function(isUserMove = true) {
    this.$centerpoint.removeClass("dragging");

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
  onClickAddPlaceBtn: function(evt) {
    evt.preventDefault();
    Util.log("USER", "map", "new-place-btn-click");
    this.options.router.navigate("/new", { trigger: true });
  },
  onClickClosePanelBtn: function(evt) {
    evt.preventDefault();

    Util.log("USER", "panel", "close-btn-click");
    // remove map mask if the user closes the side panel
    this.hideSpotlightMask();
    this.options.router.navigate("/", { trigger: true });

    if (this.isStoryActive) {
      this.isStoryActive = false;
      this.restoreDefaultLayerVisibility();
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
  conditionallyReverseGeocode: function() {
    if (this.options.mapConfig.geocoding_enabled) {
    }
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

  viewMap: function(zoom, lat, lng) {
    if (zoom && lat && lng) {
      emitter.emit(constants.MAP_TRANSITION_EASE_TO_POINT, {
        coordinates: {
          lat: lat,
          lng: lng,
        },
        zoom: zoom,
      });
    }

    this.hidePanel();
    this.hideNewPin();
    this.destroyNewModels();
    this.setBodyClass();
    this.renderMain();
  },
  newPlace: function() {
    // REACT PORT SECTION //////////////////////////////////////////////////////
    // NOTE: This wrapper component is temporary, and will be factored out
    // when the AppView is ported.
    ReactDOM.render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ThemeProvider theme={this.adjustedTheme}>
            <FormCategoryMenuWrapper
              hideSpotlightMask={this.hideSpotlightMask.bind(this)}
              hideCenterPoint={this.hideCenterPoint.bind(this)}
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
    emitter.emit(constants.PLACE_COLLECTION_UNFOCUS_ALL_PLACES_EVENT);
    // END REACT PORT SECTION //////////////////////////////////////////////////
  },

  setStoryLayerVisibility: model => {
    const storyBasemapId = model.get("story").basemap;
    const storyVisibleLayerIds = model.get("story").visibleLayers;
    const visibleBasemapId = mapBasemapSelector(store.getState());

    if (storyBasemapId && storyBasemapId !== visibleBasemapId) {
      visibleBasemapId &&
        store.dispatch(
          setBasemap(storyBasemapId, {
            id: storyBasemapId,
            status: "loading",
            isVisible: true,
            isBasemap: true,
          }),
        );
    }
    if (storyVisibleLayerIds) {
      // Switch story layers on.
      storyVisibleLayerIds.forEach(layerId => {
        store.dispatch(
          setLayerStatus(layerId, {
            status: "loading",
            isVisible: true,
          }),
        );
      });

      // Switch all other visible layers off.
      Object.entries(mapLayerStatusesSelector(store.getState()))
        .filter(([layerId, layerStatus]) => !layerStatus.isBasemap)
        .forEach(([layerId, layerStatus]) => {
          if (
            layerStatus.isVisible &&
            !storyVisibleLayerIds.includes(layerId)
          ) {
            store.dispatch(
              setLayerStatus(layerId, {
                isVisible: false,
              }),
            );
          }
        });
    }
  },

  restoreDefaultLayerVisibility: function() {
    // TODO
  },

  viewPlace: function(args) {
    var self = this;

    Util.getPlaceFromCollections(
      {
        places: this.places,
      },
      args,
      this.options.mapConfig,
      {
        onFound: _.bind(onFound, this),
        onNotFound: _.bind(onNotFound, this),
      },
    );

    this.renderMain();
    function onFound(model, type, collectionId) {
      // REACT PORT SECTION //////////////////////////////////////////////////
      ReactDOM.unmountComponentAtNode(
        document.querySelector("#content article"),
      );

      ReactDOM.render(
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <ThemeProvider theme={this.adjustedTheme}>
              <PlaceDetail
                collectionId={collectionId}
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

      self.hideNewPin();
      self.destroyNewModels();
      self.hideCenterPoint();
      self.setBodyClass("content-visible");
      self.showSpotlightMask();

      const geometry = model.get("geometry");

      if (model.get("story")) {
        self.isStoryActive = true;
        self.setStoryLayerVisibility(model);
        if (!model.get("story").spotlight) {
          self.hideSpotlightMask();
        }

        if (!self.hasBodyClass("right-sidebar-visible")) {
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
        collectionId: collectionId,
        modelId: model.get("id"),
      });

      if (!model.get("story") && self.isStoryActive) {
        self.isStoryActive = false;
        self.restoreDefaultLayerVisibility();
      }

      store.dispatch(setMapSizeValidity(false));
    }

    function onNotFound() {
      self.options.router.navigate("/");
      return;
    }
  },

  viewPage: function(slug) {
    var pageConfig = Util.findPageConfig(this.options.pagesConfig, {
        slug: slug,
      }),
      pageTemplateName = pageConfig.name || pageConfig.slug,
      pageHtml = Handlebars.templates[pageTemplateName]({
        config: this.options.config,
      });

    this.$panel.removeClass().addClass("page page-" + slug);
    this.showPanel(pageHtml);
    this.hideNewPin();
    this.destroyNewModels();
    this.hideCenterPoint();
    this.setBodyClass("content-visible");
    store.dispatch(setMapSizeValidity(false));
    this.renderMain();
  },

  showPanel: function(markup, preventScrollToTop) {
    // REACT PORT SECTION //////////////////////////////////////////////////////
    ReactDOM.unmountComponentAtNode(document.querySelector("#content article"));
    // END REACT PORT SECTION //////////////////////////////////////////////////

    this.$panelContent.html(markup);
    this.$panel.show();

    this.setBodyClass("content-visible");

    $(Shareabouts).trigger("panelshow", [
      this.options.router,
      Backbone.history.getFragment(),
    ]);

    $("#main-btns-container").addClass(
      this.options.placeConfig.add_button_location || "pos-top-left",
    );

    Util.log("APP", "panel-state", "open");

    store.dispatch(setMapSizeValidity(false));
  },
  showNewPin: function() {
    this.$centerpoint.show().addClass("newpin");

    this.showSpotlightMask();
  },
  showAddButton: function() {
    this.$addButton.show();
  },
  hideAddButton: function() {
    this.$addButton.hide();
  },
  showCenterPoint: function() {
    this.$centerpoint.show().removeClass("newpin");
  },
  hideCenterPoint: function() {
    this.$centerpoint.hide();
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
  hideNewPin: function() {
    this.showCenterPoint();
  },
  showSpotlightMask: function() {
    $("#spotlight-mask").show();
  },
  hideSpotlightMask: function() {
    $("#spotlight-mask").hide();
  },
  renderMain: function() {
    this.isListOpen = false;
    // Update the "toggle list" button:
    $(".show-the-list").removeClass("is-visuallyhidden");
    $(".show-the-map").addClass("is-visuallyhidden");

    // remove "list page" content:
    $("#list-container").addClass("is-visuallyhidden");
    ReactDOM.unmountComponentAtNode(document.getElementById("list-container"));

    // render "main page" content:
    if (this.options.mapConfig.geocoding_bar_enabled) {
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
        <MainMap
          container="map"
          places={this.places}
          router={this.options.router}
          onZoomend={this.onMapZoomEnd.bind(this)}
          onMovestart={this.onMapMoveStart.bind(this)}
          onMoveend={this.onMapMoveEnd.bind(this)}
          onDragend={this.onMapDragEnd.bind(this)}
          store={store}
        />
      </Provider>,
      document.getElementById("map-component"),
    );
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
  viewList: function() {
    this.isListOpen = true;
    emitter.emit(constants.PLACE_COLLECTION_UNFOCUS_ALL_PLACES_EVENT);
    this.renderList();
  },
  renderList: function() {
    // Update the list toggle button:
    $(".show-the-map").removeClass("is-visuallyhidden");
    $(".show-the-list").addClass("is-visuallyhidden");

    // Remove "main page" content:
    $("#geocode-address-bar").addClass("is-visuallyhidden");
    ReactDOM.unmountComponentAtNode(
      document.getElementById("geocode-address-bar"),
    );
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
            <PlaceList
              router={this.options.router}
              placeCollections={this.places}
            />
          </ThemeProvider>
        </ThemeProvider>
      </Provider>,
      document.getElementById("list-container"),
    );
  },
  toggleListView: function() {
    if (this.isListOpen) {
      this.options.router.navigate("/", { trigger: true });
    } else {
      this.options.router.navigate("list", { trigger: true });
    }
  },
});

export { store };

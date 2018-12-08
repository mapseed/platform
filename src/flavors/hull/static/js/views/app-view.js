import React from "react";
import ReactDOM from "react-dom";
import emitter from "../../../../../base/static/utils/emitter";
import InputExplorer from "../../../../../base/static/components/input-explorer";
import GeocodeAddressBar from "../../../../../base/static/components/geocode-address-bar";
import InfoModal from "../../../../../base/static/components/organisms/info-modal";
import languageModule from "../../../../../base/static/language-module";

import { Provider } from "react-redux";
import { createStore } from "redux";
import reducer from "../../../../../base/static/state/reducers";
import mapseedApiClient from "../../../../../base/static/client/mapseed-api-client";
import { ThemeProvider } from "emotion-theming";
import theme from "../../../../../theme";

import { setMapConfig } from "../../../../../base/static/state/ducks/map-config";
import { setPlaceConfig } from "../../../../../base/static/state/ducks/place-config";
import { setStoryConfig } from "../../../../../base/static/state/ducks/story-config";
import { setLeftSidebarConfig } from "../../../../../base/static/state/ducks/left-sidebar";
import { setRightSidebarConfig } from "../../../../../base/static/state/ducks/right-sidebar-config";
import { setAppConfig } from "../../../../../base/static/state/ducks/app-config";
import { loadFormsConfig } from "../../../../../base/static/state/ducks/forms-config";
import { setSupportConfig } from "../../../../../state/ducks/support-config";

import MainMap from "../../../../../base/static/components/organisms/main-map";
import RightSidebar from "../../../../../base/static/components/templates/right-sidebar";
import LeftSidebar from "../../../../../base/static/components/organisms/left-sidebar";
import UserMenu from "../../../../../base/static/components/molecules/user-menu";

import AppView, {
  store,
} from "../../../../../base/static/js/views/app-view.js";
const PlaceCounterView = require("../../../../../base/static/js/views/place-counter-view");
const PagesNavView = require("../../../../../base/static/js/views/pages-nav-view");
const ActivityView = require("../../../../../base/static/js/views/activity-view");

// BEGIN FLAVOR-SPECIFIC CODE
//const PlaceListView = require('../../../../../base/static/js/views/place-list-view');
// END FLAVOR-SPECIFIC CODE

module.exports = AppView.extend({
  events: {
    "click #add-place": "onClickAddPlaceBtn",
    "click .close-btn": "onClickClosePanelBtn",
    "click .list-toggle-btn": "toggleListView",
    // BEGIN FLAVOR-SPECIFIC CODE
    "click .show-layer-panel": "showLayerPanel",
    // END FLAVOR-SPECIFIC CODE
    // BEGIN FLAVOR-SPECIFIC CODE
    "click .show-legend-panel": "showLegendPanel",
    // END FLAVOR-SPECIFIC CODE
  },
  initialize: function() {
    // store promises returned from collection fetches
    Shareabouts.deferredCollections = [];
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

    const storeState = store.getState();
    const flavorTheme = storeState.appConfig.theme;
    const adjustedTheme = flavorTheme
      ? ancestorTheme => ({ ...ancestorTheme, ...flavorTheme })
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

    // Bootstrapped data from the page
    this.places = this.options.places;

    // this flag is used to distinguish between user-initiated zooms and
    // zooms initiated by a leaflet method
    this.isProgrammaticZoom = false;
    this.isStoryActive = false;

    $("body").ajaxError(function(evt, request, settings) {
      $("#ajax-error-msg").show();
    });

    $("body").ajaxSuccess(function(evt, request, settings) {
      $("#ajax-error-msg").hide();
    });

    $(document).on("click", ".activity-item a", function(evt) {
      window.app.clearLocationTypeFilter();
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
    this.options.router.bind(
      "route",
      function(route) {
        if (
          !_.contains(this.getListRoutes(), route) &&
          // BEGIN FLAVOR-SPECIFIC CODE
          $("#list-container").is(":visible")
          // END FLAVOR-SPECIFIC CODE
        ) {
          this.hideListView();
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
        <ThemeProvider theme={adjustedTheme}>
          <UserMenu
            router={this.options.router}
            apiRoot={storeState.appConfig.api_root}
            currentUser={Shareabouts.bootstrapped.currentUser}
            datasetDownloadConfig={storeState.appConfig.dataset_download}
          />
        </ThemeProvider>
      </ThemeProvider>,
      document.getElementById("auth-nav-container"),
    );

    // REACT PORT SECTION /////////////////////////////////////////////////////
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
    // END REACT PORT SECTION /////////////////////////////////////////////////

    // Activity is enabled by default (undefined) or by enabling it
    // explicitly. Set it to a falsey value to disable activity.
    if (
      _.isUndefined(this.options.activityConfig.enabled) ||
      this.options.activityConfig.enabled
    ) {
      // Init the view for displaying user activity
      this.activityView = new ActivityView({
        el: "ul.recent-points",
        places: this.places,
        placeConfig: this.options.placeConfig,
        router: this.options.router,
        placeTypes: this.options.placeTypes,
        formsConfig: this.options.formsConfig,
        supportConfig: this.options.supportConfig,
        mapConfig: this.options.mapConfig,
        // How often to check for new content
        interval: this.options.activityConfig.interval || 30000,
      });
    }

    // REACT PORT SECTION /////////////////////////////////////////////////////
    if (this.options.mapConfig.geocoding_bar_enabled) {
      ReactDOM.render(
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <ThemeProvider theme={adjustedTheme}>
              <GeocodeAddressBar mapConfig={this.options.mapConfig} />
            </ThemeProvider>
          </ThemeProvider>
        </Provider>,
        document.getElementById("geocode-address-bar"),
      );
    }
    // END REACT PORT SECTION /////////////////////////////////////////////////

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
      this.mapView.zoomInOn(locationData.latLng);
    });
    // END REACT PORT SECTION //////////////////////////////////////////////////

    // REACT PORT SECTION //////////////////////////////////////////////////////
    emitter.addListener("nav-layer-btn:toggle", () => {
      store.dispatch(
        setLeftSidebar(!leftSidebarExpandedSelector(store.getState())),
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
            <ThemeProvider theme={adjustedTheme}>
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

    // BEGIN FLAVOR-SPECIFIC CODE
    // List view is enabled by default (undefined) or by enabling it
    // explicitly. Set it to a falsey value to disable activity.
    // if (
    //   _.isUndefined(this.options.appConfig.list_enabled) ||
    //   this.options.appConfig.list_enabled
    // ) {
    //   this.listView = new PlaceListView({
    //     el: "#list-container",
    //     placeCollections: self.places,
    //     placeConfig: this.options.placeConfig,
    //   }).render();
    // }
    // END FLAVOR-SPECIFIC CODE

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
    });

    if (this.options.rightSidebarConfig.show) {
      $("body").addClass("right-sidebar-active");
      if (this.options.rightSidebarConfig.visibleDefault) {
        $("body").addClass("right-sidebar-visible");
      }

      // REACT PORT SECTION ///////////////////////////////////////////////////
      ReactDOM.render(
        <Provider store={store}>
          <RightSidebar
            placeCollectionsPromise={placeCollectionsPromise}
            places={this.places}
            router={this.options.router}
          />
        </Provider>,
        document.getElementById("right-sidebar-container"),
      );
      // END REACT PORT SECTION ///////////////////////////////////////////////
    }

    // REACT PORT SECTION /////////////////////////////////////////////////////
    if (this.options.leftSidebarConfig.is_enabled) {
      ReactDOM.render(
        <Provider store={store}>
          <LeftSidebar />
        </Provider>,
        document.getElementById("left-sidebar-container"),
      );
    }
    // END REACT PORT SECTION /////////////////////////////////////////////////
  },

  onMapDragEnd: function(evt) {
    if (this.hasBodyClass("content-visible") === true) {
      this.hideSpotlightMask();
      // BEGIN FLAVOR-SPECIFIC CODE
      //this.setPlaceFormViewLatLng(this.mapView.map.getCenter());
      // END FLAVOR-SPECIFIC CODE
    }
  },

  // BEGIN FLAVOR-SPECIFIC CODE
  showListView: function() {
    $(".show-the-list").addClass("is-visuallyhidden");
    $(".show-the-map").removeClass("is-visuallyhidden");
    $("#list-container").addClass("is-exposed");
    const storeState = store.getState();
    const flavorTheme = storeState.appConfig.theme;
    const adjustedTheme = flavorTheme
      ? ancestorTheme => ({ ...ancestorTheme, ...flavorTheme })
      : {};

    // NOTE: we hard-code the hull-input collection here
    ReactDOM.render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ThemeProvider theme={adjustedTheme}>
            <InputExplorer
              appConfig={this.options.appConfig}
              placeConfig={this.options.placeConfig.place_detail}
              communityInput={this.places["hull-input"]}
            />
          </ThemeProvider>
        </ThemeProvider>
      </Provider>,
      document.querySelector("#list-container"),
    );
  },
  // END FLAVOR-SPECIFIC CODE

  // BEGIN FLAVOR-SPECIFIC CODE
  showSidebarPanel: function() {
    $("#sidebar-container").removeClass("sidebar-container--hidden");
    $("#sidebar-container").addClass("sidebar-container--visible");
    if ($("#main-btns-container").hasClass("pos-top-left")) {
      $("#main-btns-container").toggleClass("main-btns-container--offset-left");
    }
  },

  showLayerPanel: function() {
    this.sidebarView.render("layers");
    this.showSidebarPanel();
  },

  showLegendPanel: function() {
    this.sidebarView.render("legend");
    this.showSidebarPanel();
  },

  hideListView: function() {
    $("#list-container").removeClass("is-exposed");
    $(".show-the-list").removeClass("is-visuallyhidden");
    $(".show-the-map").addClass("is-visuallyhidden");
  },

  toggleListView: function() {
    if ($("#list-container").is(":visible")) {
      this.options.router.navigate("/", { trigger: true });
    } else {
      this.options.router.navigate("list", { trigger: true });
    }
    this.mapView.clearFilter();
  },
  // END FLAVOR-SPECIFIC CODE
});

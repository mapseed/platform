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
// TODO(luke): This should be the only instance of our config singleton.
// Eventually, it will be removed once we start fetching the config
// from the api:
import config from "config";
import { setConfig } from "../../../../../base/static/state/ducks/config";
import UserMenu from "../../../../../base/static/components/molecules/user-menu";

const AppView = require("../../../../../base/static/js/views/app-view.js");
const PlaceCounterView = require("../../../../../base/static/js/views/place-counter-view");
const PagesNavView = require("../../../../../base/static/js/views/pages-nav-view");
const MapView = require("../../../../../base/static/js/views/map-view");
const SidebarView = require("../../../../../flavors/augusta/static/js/views/sidebar-view");
const ActivityView = require("../../../../../base/static/js/views/activity-view");
// BEGIN FLAVOR-SPECIFIC CODE
//const PlaceListView = require('../../../../../base/static/js/views/place-list-view');
// END FLAVOR-SPECIFIC CODE

// TODO(luke): move this into index.js (currently routes.js)
const store = createStore(reducer);

module.exports = AppView.extend({
  events: {
    "click #add-place": "onClickAddPlaceBtn",
    "click .close-btn": "onClickClosePanelBtn",
    "click .story-sidebar__collapse-btn": "onToggleSidebarVisibility",
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
    store.dispatch(setConfig(config));
    const storeState = store.getState();
    const flavorTheme = storeState.config.app.theme;
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
    this.activities = this.options.activities;
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

    if (this.options.activityConfig.show_in_right_panel === true) {
      $("body").addClass("right-sidebar-visible");
      $("#right-sidebar-container").html(
        "<ul class='recent-points unstyled-list'></ul>",
      );
    }

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
            apiRoot={storeState.config.app.api_root}
            currentUser={Shareabouts.bootstrapped.currentUser}
            datasetDownloadConfig={storeState.config.app.dataset_download}
          />
        </ThemeProvider>
      </ThemeProvider>,
      document.getElementById("auth-nav-container"),
    );

    this.basemapConfigs = _.find(this.options.sidebarConfig.panels, function(
      panel,
    ) {
      return "basemaps" in panel;
    }).basemaps;
    // Init the map view to display the places
    this.mapView = new MapView({
      el: "#map",
      mapConfig: this.options.mapConfig,
      sidebarConfig: this.options.sidebarConfig,
      basemapConfigs: this.basemapConfigs,
      legend_enabled: !!this.options.sidebarConfig.legend_enabled,
      places: this.places,
      router: this.options.router,
      placeTypes: this.options.placeTypes,
      cluster: this.options.cluster,
      placeDetailViews: this.placeDetailViews,
      placeConfig: this.options.placeConfig,
    });

    $("#sidebar-container").addClass("sidebar-container--hidden");
    if (self.options.sidebarConfig.enabled) {
      this.sidebarView = new SidebarView({
        el: "#sidebar-container",
        mapView: this.mapView,
        sidebarConfig: this.options.sidebarConfig,
        placeConfig: this.options.placeConfig,
      });

      // TODO: add another view inside the SidebarView for handling the legend

      // BEGIN FLAVOR-SPECIFIC CODE
      this.$(".leaflet-top.leaflet-right").append(
        '<div class="leaflet-control leaflet-bar">' +
          '<a href="#" class="show-layer-panel"></a>' +
          "</div>",
      );
      // END FLAVOR-SPECIFIC CODE

      // BEGIN FLAVOR-SPECIFIC CODE
      this.$(".leaflet-top.leaflet-right").append(
        '<div class="leaflet-control leaflet-bar">' +
          '<a href="#" class="show-legend-panel"></a>' +
          "</div>",
      );
      // END FLAVOR-SPECIFIC CODE
    }

    // Activity is enabled by default (undefined) or by enabling it
    // explicitly. Set it to a falsey value to disable activity.
    if (
      _.isUndefined(this.options.activityConfig.enabled) ||
      this.options.activityConfig.enabled
    ) {
      // Init the view for displaying user activity
      this.activityView = new ActivityView({
        el: "ul.recent-points",
        activities: this.activities,
        places: this.places,
        placeConfig: this.options.placeConfig,
        router: this.options.router,
        placeTypes: this.options.placeTypes,
        surveyConfig: this.options.surveyConfig,
        supportConfig: this.options.supportConfig,
        placeConfig: this.options.placeConfig,
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

    // Bind to map move events so we can style our center points
    // with utmost awesomeness.
    this.mapView.map.on("zoomend", this.onMapZoomEnd, this);
    this.mapView.map.on("movestart", this.onMapMoveStart, this);
    this.mapView.map.on("moveend", this.onMapMoveEnd, this);
    // For knowing if the user has moved the map after opening the form.
    this.mapView.map.on("dragend", this.onMapDragEnd, this);

    // If report stories are enabled, build the data structure
    // we need to enable story navigation
    _.each(this.options.storyConfig, function(story) {
      var storyStructure = {},
        totalStoryElements = story.order.length;
      _.each(story.order, function(config, i) {
        storyStructure[config.url] = {
          zoom: config.zoom || story.default_zoom,
          hasCustomZoom: config.zoom ? true : false,
          panTo: config.panTo || null,
          visibleLayers: config.visible_layers || story.default_visible_layers,
          previous:
            story.order[(i - 1 + totalStoryElements) % totalStoryElements].url,
          next: story.order[(i + 1) % totalStoryElements].url,
          basemap: config.basemap || story.default_basemap,
          spotlight: config.spotlight === false ? false : true,
          sidebarIconUrl: config.sidebar_icon_url,
        };
      });
      story.order = storyStructure;
    });

    // This is the "center" when the popup is open
    this.offsetRatio = { x: 0.2, y: 0.0 };

    // Show tools for adding data
    this.setBodyClass();
    this.showCenterPoint();

    // TODO(luke): move this into componentDidMount when App is ported
    // to a component:
    mapseedApiClient.place.get({
      placeParams,
      placeCollections: self.places,
      mapView: self.mapView,
      mapConfig: self.options.mapConfig,
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

    if (this.options.rightSidebarConfig.show) {
      $("body").addClass("right-sidebar-active");
      if (this.options.rightSidebarConfig.visibleDefault) {
        $("body").addClass("right-sidebar-visible");
      }

      new RightSidebarView({
        el: "#right-sidebar-container",
        router: this.options.router,
        rightSidebarConfig: this.options.rightSidebarConfig,
        placeConfig: this.options.placeConfig,
        layers: this.options.mapConfig.layers,
        storyConfig: this.options.storyConfig,
        activityConfig: this.options.activityConfig,
        activityView: this.activityView,
        appView: this,
        layerViews: this.mapView.layerViews,
      }).render();
    }
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
    const flavorTheme = storeState.config.app.theme;
    const adjustedTheme = flavorTheme
      ? ancestorTheme => ({ ...ancestorTheme, ...flavorTheme })
      : {};

    // NOTE: we hard-code the augusta-input collection here
    ReactDOM.render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ThemeProvider theme={adjustedTheme}>
            <InputExplorer
              appConfig={this.options.appConfig}
              placeConfig={this.options.placeConfig.place_detail}
              communityInput={this.places["augusta-input"]}
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

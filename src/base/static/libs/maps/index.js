import MapboxGLProvider from "./mapboxgl-provider";
// Import other providers here as they become available

import emitter from "../../utils/emitter";
import { createGeoJSONFromCollection } from "../../utils/collection-utils";

import constants from "../../constants";

const Util = require("../../js/utils.js");

class MainMap {
  constructor({ container, places, router, mapConfig }) {
    this._mapConfig = mapConfig;
    this._router = router;
    this._layers = mapConfig.layers;
    this._places = places;

    let MapProvider;
    switch (this._mapConfig.provider) {
      // Add other provider types here as they become available
      case "mapboxgl":
        MapProvider = MapboxGLProvider;
        break;
      default:
        MapProvider = MapboxGLProvider;
        break;
    }

    const logUserPan = () => {
      Util.log(
        "USER",
        "map",
        "drag",
        this._map.getBBoxString(),
        this._map.getZoom(),
      );
    };

    this._map = MapProvider(container, this._mapConfig.options);

    this._layers.forEach(config => {
      config.loaded = false;
    });

    if (this._mapConfig.geolocation_enabled) {
      this.initGeolocation();
    }

    this._map.on("dragend", logUserPan);
    this._map.on("zoomend", evt => {
      Util.log("APP", "zoom", this._map.getZoom());
      $(Shareabouts).trigger("zoomend", [evt]);
    });

    this._map.on("moveend", evt => {
      Util.log("APP", "center-lat", this._map.getCenter().lat);
      Util.log("APP", "center-lng", this._map.getCenter().lng);

      $(Shareabouts).trigger("mapmoveend", [evt]);
    });

    this._map.on("dragend", evt => {
      $(Shareabouts).trigger("mapdragend", [evt]);
    });

    emitter.addListener("place-collection:loaded", collectionId => {
      this.addPlaceCollectionLayer(collectionId);
    });

    emitter.addListener("place-collection:add-place", collectionId => {
      this.updatePlaceCollectionLayer(collectionId);
    });

    emitter.addListener(
      "place-collection:focus-place",
      ({ collectionId, modelId }) => {
        this.updatePlaceCollectionLayer(collectionId, modelId);
      },
    );

    emitter.addListener("place-collection:unfocus-all-places", () => {
      Object.keys(this._places).forEach(collectionId => {
        this.updatePlaceCollectionLayer(collectionId);
      });
    });

    // Bind visiblity event for custom layers
    $(Shareabouts).on("visibility", async (evt, id, visible, isBasemap) => {
      let layer = this._layers[id];
      const layerConfig = this._layers.find(config => config.id === id);

      if (layerConfig && !layerConfig.loaded && layerConfig.type && visible) {
        this.createLayerFromConfig(layerConfig);
        layerConfig.loaded = true;
      }

      if (isBasemap) {
        this.checkLayerZoom(layerConfig.maxZoom);
        this._map.setMaxZoom(
          layerConfig.maxZoom
            ? layerConfig.maxZoom
            : this._mapConfig.options.maxZoom,
        );

        // TODO
        //_.each(this.options.basemapConfigs, function(basemap) {
        //  if (basemap.id === id) {
        //    self.map.addLayer(layer);
        //    layer.bringToBack();
        //  } else if (self.layers[basemap.id]) {
        //    self.map.removeLayer(self.layers[basemap.id]);
        //  }
        //});
      } else if (layer) {
        //self.setLayerVisibility(layer, visible);
      } else {
        // Handles cases when we fire events for layers that are not yet
        // loaded (ie cartodb layers, which are loaded asynchronously)
        // We are setting the asynch layer layerConfig's default visibility here to
        // ensure they are added to the map when they are eventually loaded:
        layerConfig.asyncLayerVisibleDefault = visible;
      }
    });

    // TEMPORARY: Manually trigger the visibility of layers for testing
    this._map.on("load", () => {
      $(Shareabouts).trigger("visibility", [this._layers[0].id, true, true]);
      $(Shareabouts).trigger("visibility", [this._layers[3].id, true, true]);
    });
  }

  get map() {
    return this._map;
  }

  clearFilter() {
    // TODO
  }

  checkLayerZoom(maxZoom) {
    if (maxZoom && this._map.getZoom() > maxZoom) {
      this._map.setZoom(parseInt(maxZoom, 10));
    }
  }

  // Adds or removes the layer  on Master Layer based on visibility
  setLayerVisibility(layer, visible) {
    // TODO: layer id
    if (visible && !this._map.hasLayer(layer._leaflet_id)) {
      this._map.addLayer(layer);
    }
    if (!visible && this._map.hasLayer(layer)) {
      this._map.removeLayer(layer);
    }
  }

  reverseGeocodeMapCenter() {
    const center = this._map.getCenter();
    Util.MapQuest.reverseGeocode(center, {
      success: data => {
        const locationsData = data.results[0].locations;
        // Util.console.log('Reverse geocoded center: ', data);
        $(Shareabouts).trigger("reversegeocode", [locationsData[0]]);
      },
    });
  }

  initGeolocation() {
    const onLocationError = evt => {
      let message;
      switch (evt.code) {
        // Unknown
        case 0:
          message =
            "An unknown error occured while locating your position. Please try again.";
          break;
        // Permission Denied
        case 1:
          message =
            "Geolocation is disabled for this page. Please adjust your browser settings.";
          break;
        // Position Unavailable
        case 2:
          message = "Your location could not be determined. Please try again.";
          break;
        // Timeout
        case 3:
          message =
            "It took too long to determine your location. Please try again.";
          break;
      }
      alert(message);
    };
    const onLocationFound = evt => {
      let msg;
      if (
        !this._map.options.maxBounds ||
        this._map.options.maxBounds.contains(evt.latlng)
      ) {
        this._map.fitBounds(evt.bounds);
      } else {
        msg =
          "It looks like you're not in a place where we're collecting " +
          "data. I'm going to leave the map where it is, okay?";
        alert(msg);
      }
    };

    // Bind event handling
    this._map.on("locationerror", onLocationError);
    this._map.on("locationfound", onLocationFound);

    // Go to the current location if specified
    if (this._mapConfig.geolocation_onload) {
      this.geolocate();
    }
  }

  onClickGeolocate(evt) {
    evt.preventDefault();
    Util.log(
      "USER",
      "map",
      "geolocate",
      this._map.getBBoxString(),
      this._map.getZoom(),
    );
    this.geolocate();
  }

  geolocate() {
    // TODO
    this._map.locate();
  }

  updatePlaceCollectionLayer(collectionId, modelId) {
    this._map
      .getSource(collectionId)
      .setData(
        createGeoJSONFromCollection(this._places[collectionId], modelId),
      );
  }

  addPlaceCollectionLayer(collectionId) {
    this._map.createGeoJSONLayer({
      id: collectionId,
      rules: this._layers.find(layer => layer.id === collectionId).rules,
      source: createGeoJSONFromCollection(this._places[collectionId]),
    });

    // Bind map interaction events for Mapseed place layers.
    this._map.bindPlaceLayerEvent("click", collectionId, clickedOnLayer => {
      if (clickedOnLayer.properties[constants.CUSTOM_URL_PROPERTY_NAME]) {
        this._router.navigate(
          `/${clickedOnLayer.properties[constants.CUSTOM_URL_PROPERTY_NAME]}`,
          {
            trigger: true,
          },
        );
      } else {
        this._router.navigate(
          `/${
            clickedOnLayer.properties[constants.DATASET_SLUG_PROPERTY_NAME]
          }/${clickedOnLayer.properties.id}`,
          { trigger: true },
        );
      }
    });
    this._map.bindPlaceLayerEvent("mouseenter", collectionId, () => {
      this._map.setCursor("pointer");
    });
    this._map.bindPlaceLayerEvent("mouseleave", collectionId, () => {
      this._map.setCursor("");
    });
  }

  // TODO: update this when we port central-puget-sound flavor to support Mapbox GL
  filter(locationTypeModel, mapWasUnfiltered, mapWillBeUnfiltered) {
    const locationType = locationTypeModel.get("locationType");
    const isActive = locationTypeModel.get("active");

    if (mapWasUnfiltered || mapWillBeUnfiltered) {
      for (let collectionId in this._places) {
        this._places[collectionId]
          .filter(model => {
            return model.get("location_type") !== locationType;
          })
          .forEach(model => {
            if (mapWasUnfiltered) {
              this.layerViews[collectionId][model.cid].filter();
            } else if (mapWillBeUnfiltered) {
              this.layerViews[collectionId][model.cid].unfilter();
            }
          });
      }
    } else {
      for (let collectionId in this._places) {
        this._places[collectionId]
          .where({ location_type: locationType })
          .forEach(model => {
            isActive
              ? this.layerViews[collectionId][model.cid].unfilter()
              : this.layerViews[collectionId][model.cid].filter();
          });
      }
    }
  }

  // TODO: Layer loading and error events.
  createLayerFromConfig(layerConfig) {
    if (layerConfig.type === "mapbox-style") {
      this._map.addMapboxStyle(layerConfig.url);
    } else if (layerConfig.type === "raster-tile") {
      this._map.createRasterTileLayer(layerConfig);
    } else if (layerConfig.type === "wms") {
      this._map.createWMSLayer(layerConfig);
    } else if (layerConfig.type === "wmts") {
      this._map.createWMTSLayer(layerConfig);
    } else if (layerConfig.type === "vector-tile") {
      this._map.createVectorTileLayer(layerConfig);
    } else if (layerConfig.type === "json") {
      this._map.createGeoJSONLayer(layerConfig);
    }
  }
}

export default MainMap;

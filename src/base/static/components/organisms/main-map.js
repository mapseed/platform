import { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import MapboxGLProvider from "../../libs/maps/mapboxgl-provider";
// Import other providers here as they become available

import emitter from "../../utils/emitter";
import { createGeoJSONFromCollection } from "../../utils/collection-utils";

import { mapConfigSelector } from "../../state/ducks/map-config";
import { mapLayersBasemapSelector } from "../../state/ducks/map-layers";

import constants from "../../constants";

const Util = require("../../js/utils.js");

class MainMap extends Component {
  constructor(props) {
    super(props);
    this._router = props.router;
    this._places = props.places;
    this._layers = props.mapConfig.layers;

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

    this._map = MapProvider(props.container, props.mapConfig.options);

    if (this._mapConfig.geolocation_enabled) {
      this.initGeolocation();
    }

    this._map.on("dragend", evt => {
      Util.log(
        "USER",
        "map",
        "drag",
        this._map.getBBoxString(),
        this._map.getZoom(),
      );
      props.onDragend();

      $(Shareabouts).trigger("mapdragend", [evt]);
    });
    this._map.on("zoomend", evt => {
      Util.log("APP", "zoom", this._map.getZoom());
      props.onZoomend();

      $(Shareabouts).trigger("zoomend", [evt]);
    });
    this._map.on("movestart", props.onMovestart);
    this._map.on("moveend", evt => {
      Util.log("APP", "center-lat", this._map.getCenter().lat);
      Util.log("APP", "center-lng", this._map.getCenter().lng);
      props.onMoveend();

      $(Shareabouts).trigger("mapmoveend", [evt]);
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

    //store.subscribe(async () => {
    //  const basemapState = mapLayersBasemapSelector(store.getState());

    //  console.log("basemapState", basemapState);
    //  const layerToAdd = this._layers.find(
    //    layer => layer.id === basemapState.visibleBasemapId,
    //  );
    //  const layerToRemove = this._layers.find(
    //    layer => layer.id === basemapState.priorVisibleBasemapId,
    //  );
    //  this._map.addLayer(layerToAdd);
    //  this._map.removeLayer(layerToRemove);
    //});
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("componentDidUpdate", prevProps, prevState);
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
    // Note that the object passed here to createGeoJSONLayer is a first-class
    // Layer object.
    const placeLayer = this._layers.find(layer => layer.id === collectionId);
    placeLayer.source = createGeoJSONFromCollection(this._places[collectionId]);
    this._map.createGeoJSONLayer(placeLayer);

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
}

MainMap.propTypes = {
  onZoomend: PropTypes.func.isRequired,
  onMovestart: PropTypes.func.isRequired,
  onMoveend: PropTypes.func.isRequired,
  onDragend: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  mapConfig: mapConfigSelector(state),
  basemap: mapLayersBasemapSelector(state),
});

export default connect(mapStateToProps)(MainMap);

import { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import MapboxGLProvider from "../../libs/maps/mapboxgl-provider";
// Import other providers here as they become available

import emitter from "../../utils/emitter";
import { createGeoJSONFromCollection } from "../../utils/collection-utils";

import { mapConfigSelector } from "../../state/ducks/map-config";
import {
  mapBasemapSelector,
  mapLayersStatusSelector,
  mapSizeValiditySelector,
  setMapSizeValidity,
  setMapPosition,
  setLayerStatus,
  setBasemap,
} from "../../state/ducks/map";
import { setLeftSidebar } from "../../state/ducks/ui";

import constants from "../../constants";

import "./main-map.scss";

const Util = require("../../js/utils.js");

class MainMap extends Component {
  constructor(props) {
    super(props);
    this._router = props.router;
    this._places = props.places;
    this._layers = props.mapConfig.layers;

    let MapProvider;
    switch (props.mapConfig.provider) {
      // Add other provider types here as they become available
      case "mapboxgl":
        MapProvider = MapboxGLProvider;
        break;
      default:
        MapProvider = MapboxGLProvider;
        break;
    }

    // https://www.mapbox.com/mapbox-gl-js/api#icontrol
    class LayerPanelControl {
      constructor(setLeftSidebar) {
        this._setLeftSidebar = setLeftSidebar;
      }

      onAdd() {
        this._container = document.createElement("div");
        this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
        this._button = this._container.appendChild(
          document.createElement("button"),
        );
        this._button.className = "mapboxgl-ctrl-icon mapseed__layer-panel-ctrl";
        this._button.setAttribute("type", "button");
        this._button.setAttribute("aria-label", "Open Layer Panel");
        this._button.addEventListener("click", () => {
          this._setLeftSidebar(true);
        });

        return this._container;
      }

      onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      }
    }

    this._map = MapProvider(
      props.container,
      props.mapConfig.options,
      props.store,
    );
    this._map.addControl(
      new LayerPanelControl(this.props.setLeftSidebar),
      "top-left",
    );

    if (props.mapConfig.geolocation_enabled) {
      // TODO
    }

    // Set default layer visibility.
    this._map.on("load", () => {
      this._layers.filter(layer => layer.visible_default).forEach(layer => {
        layer.isBasemap && props.setBasemap(layer.id);
        props.setLayerStatus(layer.id, {
          status: "loading",
          isVisible: true,
          isBasemap: layer.isBasemap,
        });
      });
    });
  }

  componentDidUpdate(prevProps) {
    if (!this.props.isMapSizeValid) {
      this._map.invalidateSize();
      this.props.setMapSizeValidity(true);
    }

    for (let layerId in this.props.layersStatus) {
      if (
        this.props.layersStatus[layerId].isVisible &&
        (!prevProps.layersStatus[layerId] ||
          !prevProps.layersStatus[layerId].isVisible)
      ) {
        // A layer has been switched on.
        this.addLayer(
          this._layers.find(layer => layer.id === layerId),
          this.props.layersStatus[layerId].isBasemap,
        );
      } else if (
        !this.props.layersStatus[layerId].isVisible &&
        prevProps.layersStatus[layerId] &&
        prevProps.layersStatus[layerId].isVisible
      ) {
        // A layer has been switched off.
        this._map.removeLayer(this._layers.find(layer => layer.id === layerId));
      }
    }
  }

  componentDidMount() {
    this._map.on("data", data => {
      // TODO: Move to Map provider
      if (
        data.dataType === "source" &&
        data.isSourceLoaded &&
        data.sourceId !== "composite"
      ) {
        this.props.setLayerStatus(data.sourceId, {
          status: "loaded",
          isVisible: true,
        });
      }
    });
    this._map.on("error", data => {
      // TODO: Move to Map provider
      if (data.sourceId) {
        this.props.setLayerStatus(data.sourceId, {
          status: "error",
          isVisible: true,
        });
      }
    });

    this._map.on("dragend", () => {
      Util.log(
        "USER",
        "map",
        "drag",
        this._map.getBBoxString(),
        this._map.getZoom(),
      );
      this.props.onDragend();
    });
    this._map.on("zoomend", () => {
      Util.log("APP", "zoom", this._map.getZoom());
      this.props.onZoomend();
    });
    this._map.on("movestart", this.props.onMovestart);
    this._map.on("moveend", () => {
      Util.log("APP", "center-lat", this._map.getCenter().lat);
      Util.log("APP", "center-lng", this._map.getCenter().lng);
      this.props.setMapPosition({
        center: this._map.getCenter(),
        zoom: this._map.getZoom(),
      });
      this.props.onMoveend();
    });

    emitter.addListener("place-collection:loaded", collectionId => {
      if (
        this.props.layersStatus[collectionId] &&
        this.props.layersStatus[collectionId].isVisible
      ) {
        this.addPlaceCollectionLayer(collectionId);
      }
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

    emitter.addListener(
      constants.MAP_TRANSITION_FIT_LINESTRING_COORDS,
      ({ coordinates }) => {
        this._map.fitLineStringCoords(coordinates, { padding: 30 });
      },
    );
    emitter.addListener(
      constants.MAP_TRANSITION_FIT_POLYGON_COORDS,
      ({ coordinates }) => {
        this._map.fitPolygonCoords(coordinates, { padding: 30 });
      },
    );
    emitter.addListener(
      constants.MAP_TRANSITION_EASE_TO_POINT,
      ({ coordinates, zoom }) => {
        this._map.easeTo({
          center: coordinates,
          zoom: zoom,
        });
      },
    );
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

  async addLayer(layer, isBasemap = false) {
    if (layer.type === "place") {
      layer.source = createGeoJSONFromCollection(this._places[layer.id]);
      this._map.addLayer(layer);

      // Bind map interaction events for this place layers.
      this._map.bindPlaceLayerEvent("click", layer.id, clickedOnLayer => {
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
      this._map.bindPlaceLayerEvent("mouseenter", layer.id, () => {
        this._map.setCursor("pointer");
      });
      this._map.bindPlaceLayerEvent("mouseleave", layer.id, () => {
        this._map.setCursor("");
      });
    } else {
      this._map.addLayer(layer, isBasemap);
    }
  }

  render() {
    return null;
  }
}

MainMap.propTypes = {
  container: PropTypes.string.isRequired,
  isMapSizeValid: PropTypes.bool.isRequired,
  layersStatus: PropTypes.objectOf(
    PropTypes.shape({
      isVisible: PropTypes.bool,
      isBasemap: PropTypes.bool,
      status: PropTypes.string,
    }),
  ).isRequired,
  mapConfig: PropTypes.shape({
    geolocation_enabled: PropTypes.bool.isRequired,
    layers: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        url: PropTypes.string,
        source: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        slug: PropTypes.string,
        rules: PropTypes.arrayOf(
          PropTypes.shape({
            filter: PropTypes.array,
            "symbol-layout": PropTypes.object,
            "symbol-paint": PropTypes.object,
            "line-layout": PropTypes.object,
            "line-paint": PropTypes.object,
            "fill-layout": PropTypes.object,
            "fill-paint": PropTypes.object,
          }),
        ),
      }),
    ),
    options: PropTypes.shape({
      map: PropTypes.shape({
        center: PropTypes.shape({
          lat: PropTypes.number.isRequired,
          lng: PropTypes.number.isRequired,
        }).isRequired,
        zoom: PropTypes.number.isRequired,
        minZoom: PropTypes.number.isRequired,
        maxZoom: PropTypes.number.isRequired,
      }),
    }),
    provider: PropTypes.string,
  }),
  onZoomend: PropTypes.func.isRequired,
  onMovestart: PropTypes.func.isRequired,
  onMoveend: PropTypes.func.isRequired,
  onDragend: PropTypes.func.isRequired,
  places: PropTypes.object.isRequired,
  provider: PropTypes.string,
  router: PropTypes.instanceOf(Backbone.Router).isRequired,
  setBasemap: PropTypes.func.isRequired,
  setLayerStatus: PropTypes.func.isRequired,
  setLeftSidebar: PropTypes.func.isRequired,
  setMapPosition: PropTypes.func.isRequired,
  setMapSizeValidity: PropTypes.func.isRequired,
  store: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  mapConfig: mapConfigSelector(state),
  visibleBasemapId: mapBasemapSelector(state),
  layersStatus: mapLayersStatusSelector(state),
  isMapSizeValid: mapSizeValiditySelector(state),
});

const mapDispatchToProps = dispatch => ({
  setMapPosition: mapPosition => dispatch(setMapPosition(mapPosition)),
  setMapSizeValidity: isMapSizeValid =>
    dispatch(setMapSizeValidity(isMapSizeValid)),
  setLeftSidebar: isExpanded => dispatch(setLeftSidebar(isExpanded)),
  setLayerStatus: (layerId, layerStatus) =>
    dispatch(setLayerStatus(layerId, layerStatus)),
  setBasemap: layerId => dispatch(setBasemap(layerId)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MainMap);

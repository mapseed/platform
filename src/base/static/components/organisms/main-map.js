import { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import MapboxGLProvider from "../../libs/maps/mapboxgl-provider";
// Import other providers here as they become available

import emitter from "../../utils/emitter";
import { createGeoJSONFromCollection } from "../../utils/collection-utils";

import {
  mapConfigSelector,
  mapLayersSelector,
} from "../../state/ducks/map-config";
import {
  mapBasemapSelector,
  mapLayerStatusesSelector,
  mapSizeValiditySelector,
  setMapSizeValidity,
  setMapPosition,
  setLayerStatus,
  setBasemap,
  mapboxStyleIdSelector,
} from "../../state/ducks/map";
import { setLeftSidebar } from "../../state/ducks/ui";

import constants from "../../constants";

import "./main-map.scss";

const Util = require("../../js/utils.js");

class MainMap extends Component {
  constructor(props) {
    super(props);
    this.loaded = false;

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
      }
    }

    // Set default layer visibility for non-place layers.
    this.props.layers
      .filter(layer => layer.is_visible_default && layer.type !== "place")
      .forEach(layer => {
        if (layer.is_basemap) {
          props.setBasemap(layer.id, {
            id: layer.id,
            status: "loading",
            isVisible: true,
            isBasemap: true,
            type: layer.type,
          });
        } else {
          props.setLayerStatus(layer.id, {
            id: layer.id,
            status: "loading",
            isVisible: true,
            isBasemap: false,
            type: layer.type,
          });
        }
      });

    // Instantiate the map.
    this._map = MapProvider(props.container, props.mapConfig.options);
    this._map.addControl(
      new LayerPanelControl(this.props.setLeftSidebar),
      "top-left",
    );

    this._map.on({
      event: "load",
      callback: () => {
        this.loaded = true;
        for (let layerId in this.props.layerStatuses) {
          if (this.props.layerStatuses[layerId].isVisible) {
            this.addLayer(
              this.props.layers.find(layer => layer.id === layerId),
              this.props.layerStatuses[layerId].isBasemap,
            );
          }
        }
      },
    });

    if (props.mapConfig.geolocation_enabled) {
      // TODO
    }
  }

  componentDidMount() {
    // Handlers for layer loading events.
    this._map.on({
      event: "layer:loaded",
      callback: sourceId => {
        if (sourceId === "composite") {
          // Mapbox styles produce sources with the id "composite". When we have such
          // a source, we assume we want the status of the currently visible layer
          // with type mapbox-style.
          sourceId = this.props.mapboxStyleId;
        }
        this.props.setLayerStatus(sourceId, {
          status: "loaded",
        });
      },
      layersStatus: this.props.layerStatuses,
    });
    this._map.on({
      event: "layer:error",
      callback: sourceId => {
        if (sourceId === "composite") {
          sourceId = this.props.mapboxStyleId;
        }
        this.props.setLayerStatus(sourceId, {
          status: "error",
        });
      },
    });

    // Handlers for map interaction events.
    this._map.on({
      event: "dragend",
      callback: () => {
        Util.log(
          "USER",
          "map",
          "drag",
          this._map.getBBoxString(),
          this._map.getZoom(),
        );
        this.props.onDragend();
      },
    });
    this._map.on({
      event: "zoomend",
      callback: () => {
        Util.log("APP", "zoom", this._map.getZoom());
        this.props.onZoomend();
      },
    });
    this._map.on({ event: "movestart", callback: this.props.onMovestart });
    this._map.on({
      event: "moveend",
      callback: () => {
        Util.log("APP", "center-lat", this._map.getCenter().lat);
        Util.log("APP", "center-lng", this._map.getCenter().lng);
        this.props.setMapPosition({
          center: this._map.getCenter(),
          zoom: this._map.getZoom(),
        });
        this.props.onMoveend();
      },
    });

    // Handlers for Mapseed place collections.
    emitter.addListener("place-collection:loaded", layerId => {
      this.props.setLayerStatus(layerId, {
        status: "loaded",
        type: "place",
        isBasemap: false,
        isVisible: !!this.props.layers.find(layer => layer.id === layerId)
          .is_visible_default,
      });
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
      Object.keys(this.props.places).forEach(collectionId => {
        this.props.layerStatuses[collectionId].isVisible &&
          this.updatePlaceCollectionLayer(collectionId);
      });
    });

    // Handlers for story-driven map transitions.
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

  componentDidUpdate(prevProps) {
    // Don't attempt any interaction with the map until it is fully loaded.
    if (!this.loaded) return;

    if (!this.props.isMapSizeValid) {
      this._map.invalidateSize();
      this.props.setMapSizeValidity(true);
    }

    for (let layerId in this.props.layerStatuses) {
      if (
        this.props.layerStatuses[layerId].isVisible &&
        (!prevProps.layerStatuses[layerId] ||
          !prevProps.layerStatuses[layerId].isVisible)
      ) {
        // A layer has been switched on.
        this.addLayer(
          this.props.layers.find(layer => layer.id === layerId),
          this.props.layerStatuses[layerId].isBasemap,
        );
      } else if (
        !this.props.layerStatuses[layerId].isVisible &&
        prevProps.layerStatuses[layerId] &&
        prevProps.layerStatuses[layerId].isVisible
      ) {
        // A layer has been switched off.
        this._map.removeLayer(
          this.props.layers.find(layer => layer.id === layerId),
        );
      }
    }
  }

  get map() {
    return this._map;
  }

  clearFilter() {
    // TODO
  }

  reverseGeocodeMapCenter() {
    // TODO
  }

  initGeolocation() {
    // TODO
  }

  onClickGeolocate(evt) {
    // TODO
  }

  geolocate() {
    // TODO
  }

  filter(locationTypeModel, mapWasUnfiltered, mapWillBeUnfiltered) {
    // TODO: update this when we port central-puget-sound flavor to support Mapbox GL
  }

  updatePlaceCollectionLayer(collectionId, modelId) {
    this._map.updateLayerData(
      collectionId,
      createGeoJSONFromCollection(this.props.places[collectionId], modelId),
    );
  }

  async addLayer(layer, isBasemap = false) {
    if (layer.type === "place") {
      layer.source = createGeoJSONFromCollection(this.props.places[layer.id]);
      this._map.addLayer({
        layer: layer,
        isBasemap: isBasemap,
        layerStatuses: this.props.layerStatuses,
        mapConfig: this.props.mapConfig,
      });

      // Bind map interaction events for this place layers.
      this._map.bindPlaceLayerEvent("click", layer.id, clickedOnLayer => {
        if (clickedOnLayer.properties[constants.CUSTOM_URL_PROPERTY_NAME]) {
          this.props.router.navigate(
            `/${clickedOnLayer.properties[constants.CUSTOM_URL_PROPERTY_NAME]}`,
            {
              trigger: true,
            },
          );
        } else {
          this.props.router.navigate(
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
      this._map.addLayer({
        layer: layer,
        isBasemap: isBasemap,
        layerStatuses: this.props.layerStatuses,
        mapConfig: this.props.mapConfig,
      });
    }
  }

  render() {
    return null;
  }
}

MainMap.propTypes = {
  container: PropTypes.string.isRequired,
  isMapSizeValid: PropTypes.bool.isRequired,
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
  layerStatuses: PropTypes.objectOf(
    PropTypes.shape({
      isVisible: PropTypes.bool,
      isBasemap: PropTypes.bool,
      status: PropTypes.string,
    }),
  ).isRequired,
  mapboxStyleId: PropTypes.string,
  mapConfig: PropTypes.shape({
    geolocation_enabled: PropTypes.bool.isRequired,
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
  layers: mapLayersSelector(state),
  visibleBasemapId: mapBasemapSelector(state),
  layerStatuses: mapLayerStatusesSelector(state),
  isMapSizeValid: mapSizeValiditySelector(state),
  mapboxStyleId: mapboxStyleIdSelector(state),
});

const mapDispatchToProps = dispatch => ({
  setMapPosition: mapPosition => dispatch(setMapPosition(mapPosition)),
  setMapSizeValidity: isMapSizeValid =>
    dispatch(setMapSizeValidity(isMapSizeValid)),
  setLeftSidebar: isExpanded => dispatch(setLeftSidebar(isExpanded)),
  setLayerStatus: (layerId, layerStatus) =>
    dispatch(setLayerStatus(layerId, layerStatus)),
  setBasemap: (layerId, layerStatus) =>
    dispatch(setBasemap(layerId, layerStatus)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MainMap);

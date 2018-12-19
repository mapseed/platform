import { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import MapboxGLProvider from "../../libs/maps/mapboxgl-provider";
// Import other providers here as they become available

import emitter from "../../utils/emitter";
import { createGeoJSONFromPlaces } from "../../utils/place-utils";
import {
  mapConfigSelector,
  mapLayersSelector,
} from "../../state/ducks/map-config";
import {
  filteredPlacesSelector,
  placesSelector,
  placesPropType,
} from "../../state/ducks/places";
import { filtersSelector, filtersPropType } from "../../state/ducks/filters";
import {
  mapBasemapSelector,
  mapLayerStatusesSelector,
  mapFeatureFiltersSelector,
  mapSizeValiditySelector,
  updateMapDragged,
  setMapSizeValidity,
  setMapPosition,
  setLayerLoaded,
  setLayerLoading,
  setLayerError,
  mapboxStyleIdSelector,
  mapUpdatingFilterGroupIdSelector,
  mapUpdatingFilterTargetLayerSelector,
} from "../../state/ducks/map";
import {
  leftSidebarConfigSelector,
  setLeftSidebarExpanded,
  setLeftSidebarComponent,
} from "../../state/ducks/left-sidebar.js";
import {
  activeDrawGeometryIdSelector,
  activeMarkerSelector,
  geometryStyleSelector,
  setActiveDrawGeometryId,
  geometryStyleProps,
} from "../../state/ducks/map-drawing-toolbar";

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

    // Instantiate the map.
    this._map = MapProvider(props.container, props.mapConfig.options);

    if (props.mapConfig.geolocation_enabled) {
      this._map.addGeolocationControl("top-left");
    }

    this._map.addCustomControls({
      panels: props.leftSidebarConfig.panels,
      position: "top-left",
      setLeftSidebarExpanded: props.setLeftSidebarExpanded,
      setLeftSidebarComponent: props.setLeftSidebarComponent,
    });
    this.listeners = [];
  }

  componentDidMount() {
    // Handlers for layer loading events.
    this._map.on({
      event: "load",
      callback: () => {
        this.loaded = true;
        for (let layerId in this.props.layerStatuses) {
          const layerStatus = this.props.layerStatuses[layerId];
          if (
            layerStatus.isVisible &&
            ["loaded", "loading"].includes(layerStatus.loadStatus)
          ) {
            this.addLayer(
              this.props.layers.find(layer => layer.id === layerId),
              this.props.layerStatuses[layerId].isBasemap,
            );
          }
        }
      },
    });

    this._map.on({
      event: "layer:loaded",
      callback: sourceId => {
        if (sourceId === "composite") {
          // Mapbox styles produce sources with the id "composite". When we have such
          // a source, we assume we want the status of the currently visible layer
          // with type mapbox-style.
          sourceId = this.props.mapboxStyleId;
        }
        this.props.setLayerLoaded(sourceId);
      },
    });
    this._map.on({
      event: "layer:error",
      callback: sourceId => {
        if (sourceId === "composite") {
          sourceId = this.props.mapboxStyleId;
        }
        this.props.setLayerError(sourceId);
      },
    });

    // Handlers for map drawing events; not relevant if drawing is disabled
    // for a given flavor.
    if (this.props.mapConfig.options.drawing_enabled !== false) {
      this.props.router.on(
        "route",
        () => {
          this._map.drawDeleteGeometry();
        },
        this,
      );

      this.listeners.push(
        emitter.addListener(constants.DRAW_INIT_GEOMETRY_EVENT, geometry => {
          this.props.setActiveDrawGeometryId(
            this._map.drawAddGeometry(geometry)[0],
          );
        }),
      );
      this.listeners.push(
        emitter.addListener(constants.DRAW_START_POLYGON_EVENT, () => {
          this._map.drawStartPolygon();
        }),
      );
      this.listeners.push(
        emitter.addListener(constants.DRAW_START_POLYLINE_EVENT, () => {
          this._map.drawStartPolyline();
        }),
      );
      this.listeners.push(
        emitter.addListener(constants.DRAW_START_MARKER_EVENT, () => {
          this._map.drawStartMarker();
        }),
      );
      this.listeners.push(
        emitter.addListener(constants.DRAW_DELETE_GEOMETRY_EVENT, () => {
          this._map.drawDeleteGeometry();
          this.props.setActiveDrawGeometryId(null);
          emitter.emit(constants.DRAW_UPDATE_GEOMETRY_EVENT, null);
        }),
      );

      this._map.on({
        event: "draw.create",
        callback: evt => {
          this.props.setActiveDrawGeometryId(evt.features[0].id);
          if (evt.features[0].geometry.type === "Point") {
            this._map.drawSetFeatureProperty(
              this.props.activeDrawGeometryId,
              constants.MARKER_ICON_PROPERTY_NAME,
              this.props.activeMarker,
            );
          }
          emitter.emit(
            constants.DRAW_UPDATE_GEOMETRY_EVENT,
            evt.features[0].geometry,
          );
        },
      });
      this._map.on({
        event: "draw.update",
        callback: evt => {
          emitter.emit(
            constants.DRAW_UPDATE_GEOMETRY_EVENT,
            evt.features[0].geometry,
          );
        },
      });
    }

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
        this.props.updateMapDragged(true);
        this.props.onDragend();
      },
    });
    this._map.on({
      event: "zoomend",
      callback: evt => {
        // NOTE: We use the presence of the originalEvent property as a proxy
        // for whether the zoom event originated from a user action or from a
        // programmatic action (such as a call to map.flyTo()).
        // See: https://www.mapbox.com/mapbox-gl-js/api/#mapmouseevent#originalevent
        const isUserZoom = evt.originalEvent !== undefined;
        Util.log("APP", "zoom", this._map.getZoom());
        this.props.onZoomend(isUserZoom);
      },
    });
    this._map.on({ event: "movestart", callback: this.props.onMovestart });
    this._map.on({
      event: "moveend",
      callback: evt => {
        Util.log("APP", "center-lat", this._map.getCenter().lat);
        Util.log("APP", "center-lng", this._map.getCenter().lng);
        this.props.setMapPosition({
          center: this._map.getCenter(),
          zoom: this._map.getZoom(),
        });
        const isUserMove = evt.originalEvent !== undefined;
        this.props.onMoveend(isUserMove);
      },
    });

    // Handlers for Mapseed place collections.
    this.listeners.push(
      emitter.addListener(
        constants.PLACE_COLLECTION_ADD_PLACE_EVENT,
        datasetId => {
          this._map.updateLayerData(
            datasetId,
            createGeoJSONFromPlaces(
              this.props.places.filter(place => place.datasetId === datasetId),
            ),
          );
        },
      ),
    );
    this.listeners.push(
      emitter.addListener(
        constants.PLACE_COLLECTION_REMOVE_PLACE_EVENT,
        datasetId => {
          this._map.updateLayerData(
            datasetId,
            createGeoJSONFromPlaces(
              this.props.places.filter(place => place.datasetId === datasetId),
            ),
          );
          this._map.unfocusAllPlaceLayerFeatures();
        },
      ),
    );
    this.listeners.push(
      emitter.addListener(
        constants.PLACE_COLLECTION_FOCUS_PLACE_EVENT,
        ({ datasetId, modelId }) => {
          // To focus a feature in a layer, we first remove it from the origin layer
          // above, then add it to a separate focused layer. That way we can control
          // the focused layer independently of the source layer and ensure focused
          // features always render above all other features.
          // TODO: Support multiple focused features simultaneously.
          const focusedFeatures = createGeoJSONFromPlaces(
            this.props.places.filter(place => place.id === modelId),
          );

          this._map.focusPlaceLayerFeatures(datasetId, focusedFeatures);
        },
      ),
    );
    this.listeners.push(
      emitter.addListener(
        constants.PLACE_COLLECTION_HIDE_PLACE_EVENT,
        ({ datasetId, modelId }) => {
          this._map.updateLayerData(
            datasetId,
            createGeoJSONFromPlaces(
              this.props.places.filter(place => place.id !== modelId),
            ),
          );
        },
      ),
    );
    this.listeners.push(
      emitter.addListener(
        constants.PLACE_COLLECTION_UNFOCUS_ALL_PLACES_EVENT,
        () => {
          Object.values(this.props.layerStatuses)
            .filter(
              status =>
                status.type === "place" &&
                status.isVisible &&
                status.loadStatus === "loaded",
            )
            .forEach(status => {
              const datasetId = status.id;
              this._map.updateLayerData(
                datasetId,
                createGeoJSONFromPlaces(
                  this.props.places.filter(
                    place => place.datasetId === datasetId,
                  ),
                ),
              );
            });
          this._map.unfocusAllPlaceLayerFeatures();
        },
      ),
    );

    // Handlers for story-driven map transitions.
    this.listeners.push(
      emitter.addListener(
        constants.MAP_TRANSITION_FIT_LINESTRING_COORDS,
        ({ coordinates }) => {
          this._map.fitLineStringCoords(coordinates, { padding: 30 });
        },
      ),
    );
    this.listeners.push(
      emitter.addListener(
        constants.MAP_TRANSITION_FIT_POLYGON_COORDS,
        ({ coordinates }) => {
          this._map.fitPolygonCoords(coordinates, { padding: 30 });
        },
      ),
    );
    this.listeners.push(
      emitter.addListener(
        constants.MAP_TRANSITION_EASE_TO_POINT,
        ({ coordinates, zoom }) => {
          this._map.easeTo({
            center: coordinates,
            zoom: zoom,
          });
        },
      ),
    );
    this.listeners.push(
      emitter.addListener(
        constants.MAP_TRANSITION_FLY_TO_POINT,
        ({ coordinates, zoom }) => {
          this._map.flyTo({
            center: coordinates,
            zoom: zoom,
          });
        },
      ),
    );

    // Geolocation trigger handler.
    this.listeners.push(
      emitter.addListener(constants.TRIGGER_GEOLOCATE_EVENT, () => {
        this._map.triggerGeolocateControl();
      }),
    );
  }

  componentWillUnmount() {
    // remove all listeners added in our componentWillMount:
    this.listeners.forEach(l => l.remove());

    // this removes all listeners from this._map:
    this._map.remove();

    // Handler for clearing in-progress drawing geometry.
    this.props.router.off("route", null, this);
  }

  componentDidUpdate(prevProps) {
    if (!this.props.isMapSizeValid) {
      this._map.invalidateSize();
      this.props.setMapSizeValidity(true);
    }

    // Don't attempt any further interaction with the map until it is fully
    // loaded.
    if (!this.loaded) return;

    if (this.props.activeDrawGeometryId) {
      // Update styling for in-progress geometry being drawn with the
      // MapDrawingToolbar.
      if (this.props.activeMarker !== prevProps.activeMarker) {
        this._map.drawSetFeatureProperty(
          this.props.activeDrawGeometryId,
          constants.MARKER_ICON_PROPERTY_NAME,
          this.props.activeMarker,
        );
      }
      Object.entries(this.props.geometryStyle).forEach(
        ([styleProperty, value]) => {
          if (value !== prevProps.geometryStyle[styleProperty]) {
            this._map.drawSetFeatureProperty(
              this.props.activeDrawGeometryId,
              styleProperty,
              value,
            );
          }
        },
      );
    }

    if (this.props.featureFilters !== prevProps.featureFilters) {
      // Filter(s) have been activated or deactivated.
      this._map.setFeatureFilters({
        featureFilters: this.props.featureFilters,
        groupId: this.props.updatingFilterGroupId,
        targetLayer: this.props.updatingFilterTargetLayer,
      });
    }

    // Check if a layer's visibibility or load status has changed:
    for (let layerId in this.props.layerStatuses) {
      const layerStatus = this.props.layerStatuses[layerId];
      const prevLayerStatus = prevProps.layerStatuses[layerId];
      if (layerStatus.isVisible !== prevLayerStatus.isVisible) {
        if (layerStatus.isVisible) {
          // A layer has been switched on.
          this.addLayer(
            this.props.layers.find(layer => layer.id === layerId),
            layerStatus.isBasemap,
          );
        } else {
          // A layer has been switched off.
          this._map.removeLayer(
            this.props.layers.find(layer => layer.id === layerId),
          );
        }
      }

      if (
        layerStatus.loadStatus === "loading" &&
        prevLayerStatus.loadStatus === "fetching"
      ) {
        // A layer's data has been fetched, so now we add it to the map:
        this.addLayer(
          this.props.layers.find(layer => layer.id === layerId),
          layerStatus.isBasemap,
        );
      }
    }

    // Update place datasets when filters have been updated:
    if (prevProps.filters.length !== this.props.filters.length) {
      const datasetIds = this.props.layers
        .filter(layerConfig => layerConfig.type === "place")
        .map(layerConfig => layerConfig.id);
      datasetIds.forEach(datasetId => {
        const layerConfig = this.props.layers.find(
          layer => layer.id === datasetId,
        );
        this._map.updateLayerData(
          layerConfig.id,
          createGeoJSONFromPlaces(
            this.props.places.filter(
              place => place.datasetId === layerConfig.id,
            ),
          ),
        );
      });
    }
  }

  get map() {
    return this._map;
  }

  async addLayer(layer, isBasemap = false) {
    if (layer.type === "place") {
      layer.source = createGeoJSONFromPlaces(
        this.props.places.filter(place => place.datasetId === layer.id),
      );

      this._map.addLayer({
        layer: layer,
        isBasemap: isBasemap,
        layerStatuses: this.props.layerStatuses,
        mapConfig: this.props.mapConfig,
      });

      // Bind map interaction events for this place layer.
      this._map.bindPlaceLayerEvents(["click"], layer.id, clickedOnLayer => {
        this.props.router.navigate(
          `/${
            clickedOnLayer.properties[constants.DATASET_SLUG_PROPERTY_NAME]
          }/${clickedOnLayer.properties.id}`,
          { trigger: true },
        );
      });
      this._map.bindPlaceLayerEvents(["mouseenter"], layer.id, () => {
        this._map.setCursor("pointer");
      });
      this._map.bindPlaceLayerEvents(["mouseleave"], layer.id, () => {
        this._map.setCursor("");
      });
    } else {
      this.props.setLayerLoading(layer.id);
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
  activeDrawGeometryId: PropTypes.string,
  activeMarker: PropTypes.string,
  container: PropTypes.string.isRequired,
  geometryStyle: geometryStyleProps,
  featureFilters: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      groupId: PropTypes.string.isRequired,
      targetLayer: PropTypes.string.isRequired,
      attribute: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }),
  ),
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
      loadStatus: PropTypes.string,
      type: PropTypes.string,
    }),
  ).isRequired,
  leftSidebarConfig: PropTypes.shape({
    is_enabled: PropTypes.bool,
    is_visible_default: PropTypes.bool,
    panels: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        title: PropTypes.string,
        groupings: PropTypes.array.isRequired,
      }),
    ),
  }).isRequired,
  mapboxStyleId: PropTypes.string,
  mapConfig: PropTypes.shape({
    geolocation_enabled: PropTypes.bool.isRequired,
    options: PropTypes.shape({
      drawing_enabled: PropTypes.bool,
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
  places: placesPropType,
  provider: PropTypes.string,
  router: PropTypes.instanceOf(Backbone.Router).isRequired,
  setActiveDrawGeometryId: PropTypes.func.isRequired,
  updateMapDragged: PropTypes.func.isRequired,
  setLayerLoaded: PropTypes.func.isRequired,
  setLayerLoading: PropTypes.func.isRequired,
  setLayerError: PropTypes.func.isRequired,
  setLeftSidebarComponent: PropTypes.func.isRequired,
  setLeftSidebarExpanded: PropTypes.func.isRequired,
  setMapPosition: PropTypes.func.isRequired,
  setMapSizeValidity: PropTypes.func.isRequired,
  store: PropTypes.object.isRequired,
  updatingFilterGroupId: PropTypes.string,
  updatingFilterTargetLayer: PropTypes.string,
  filters: filtersPropType.isRequired,
};

const mapStateToProps = state => ({
  activeDrawGeometryId: activeDrawGeometryIdSelector(state),
  activeMarker: activeMarkerSelector(state),
  leftSidebarConfig: leftSidebarConfigSelector(state),
  mapConfig: mapConfigSelector(state),
  geometryStyle: geometryStyleSelector(state),
  layers: mapLayersSelector(state),
  visibleBasemapId: mapBasemapSelector(state),
  layerStatuses: mapLayerStatusesSelector(state),
  featureFilters: mapFeatureFiltersSelector(state),
  isMapSizeValid: mapSizeValiditySelector(state),
  mapboxStyleId: mapboxStyleIdSelector(state),
  updatingFilterGroupId: mapUpdatingFilterGroupIdSelector(state),
  updatingFilterTargetLayer: mapUpdatingFilterTargetLayerSelector(state),
  places: filteredPlacesSelector(state),
  filters: filtersSelector(state),
});

const mapDispatchToProps = dispatch => ({
  updateMapDragged: isMapDragged => dispatch(updateMapDragged(isMapDragged)),
  setMapPosition: mapPosition => dispatch(setMapPosition(mapPosition)),
  setMapSizeValidity: isMapSizeValid =>
    dispatch(setMapSizeValidity(isMapSizeValid)),
  setLeftSidebarComponent: componentName =>
    dispatch(setLeftSidebarComponent(componentName)),
  setLeftSidebarExpanded: isExpanded =>
    dispatch(setLeftSidebarExpanded(isExpanded)),
  setLayerLoaded: layerId => dispatch(setLayerLoaded(layerId)),
  setLayerLoading: layerId => dispatch(setLayerLoading(layerId)),
  setLayerError: layerId => dispatch(setLayerError(layerId)),
  setActiveDrawGeometryId: activeDrawGeometryId =>
    dispatch(setActiveDrawGeometryId(activeDrawGeometryId)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MainMap);

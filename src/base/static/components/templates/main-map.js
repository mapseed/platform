import React, { Component, createRef, Fragment } from "react";
import PropTypes from "prop-types";
import MapGL, { NavigationControl } from "react-map-gl";
import { connect } from "react-redux";
import styled from "react-emotion";
import { Global } from "@emotion/core";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

import {
  drawModeActiveSelector,
  interactiveLayerIdsSelector,
  mapDraggingSelector,
  mapStyleSelector,
  mapViewportSelector,
  mapViewportPropType,
  mapStylePropType,
  updateMapViewport,
  updateSourceLoadStatus,
  sourcesMetadataSelector,
  updateMapDragged,
  updateMapDragging,
  updateGeoJSONFeatures,
  sourcesMetadataPropType,
  updateSources,
  updateLayers,
} from "../../state/ducks/map";
import {
  mapConfigSelector,
  mapConfigPropType,
} from "../../state/ducks/map-config";
import {
  activeDrawingToolSelector,
  activeMarkerSelector,
  setActiveDrawGeometryId,
  activeDrawGeometryIdSelector,
  geometryStyleSelector,
  geometryStyleProps,
} from "../../state/ducks/map-drawing-toolbar";
import {
  leftSidebarConfigSelector,
  setLeftSidebarExpanded,
  setLeftSidebarComponent,
} from "../../state/ducks/left-sidebar";
import {
  activePlaceIdSelector,
  filteredPlacesSelector,
  placePropType,
  placeSelector,
} from "../../state/ducks/places";
import { filtersSelector } from "../../state/ducks/filters";
import { createGeoJSONFromPlaces } from "../../utils/place-utils";

import emitter from "../../utils/emitter";

import drawingLayers from "../../state/misc/drawing-layers";

const MapControlsContainer = styled("div")({
  position: "absolute",
  top: "8px",
  left: "8px",
});

// react-map-gl does not export mapboxgl's built-in geolocate control, so we
// need to build our own here.
class GeolocateControl extends Component {
  onClickGeolocateControl = () => {
    // https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
    navigator.geolocation.getCurrentPosition(position => {
      this.props.updateMapViewport({
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
      });
    });

    // TODO: Geolocate error handling.
    // TODO: Set zoom on geolocate? Add pulsating marker?
  };

  render() {
    // If geolocation is not supported, do not render the geolocate control.
    // This mirrors the default mapboxgl behavior.
    return "geolocation" in navigator ? (
      <div
        className="mapboxgl-ctrl mapboxgl-ctrl-group"
        style={{ marginTop: "8px" }}
      >
        <button
          className="mapboxgl-ctrl-icon mapboxgl-ctrl-geolocate"
          type="button"
          title="Geolocate"
          onClick={this.onClickGeolocateControl}
        />
      </div>
    ) : null;
  }
}

GeolocateControl.propTypes = {
  updateMapViewport: PropTypes.func.isRequired,
};

class CustomControl extends Component {
  onClickControl = () => {
    this.props.setLeftSidebarComponent(this.props.component);
    this.props.setLeftSidebarExpanded(true);
  };

  render() {
    return (
      <div
        className="mapboxgl-ctrl mapboxgl-ctrl-group"
        style={{ marginTop: "8px" }}
      >
        <button
          className={`mapboxgl-ctrl-icon ${this.props.icon}`}
          type="button"
          title="Custom control"
          onClick={this.onClickControl}
        />
      </div>
    );
  }
}

CustomControl.propTypes = {
  component: PropTypes.string.isRequired,
  setLeftSidebarExpanded: PropTypes.func.isRequired,
  setLeftSidebarComponent: PropTypes.func.isRequired,
  icon: PropTypes.string.isRequired,
};

CustomControl.defaultProps = {
  icon: "fa-info",
};

class MainMap extends Component {
  state = {
    isMapLoaded: false,
  };

  mapRef = createRef();
  queriedFeatures = [];
  isMapTransitioning = false;

  onWindowResize = () => {
    const container = this.props.container.getBoundingClientRect();
    this.props.updateMapViewport({
      height: container.height,
      width: container.width,
    });
  };

  componentDidMount() {
    const container = this.props.container.getBoundingClientRect();
    this.props.updateMapViewport({
      height: container.height,
      width: container.width,
    });

    window.addEventListener("resize", this.onWindowResize);

    // MapboxGL fires many redundant events, so we only update load or error
    // status state if a new type of event is fired. It's necessary to attach
    // these events to a ref of the map because react-map-gl does not expose
    // the event binding API itself.
    this.map = this.mapRef.current.getMap();
    this.map.on("error", evt => {
      if (
        evt.sourceId &&
        this.props.sourcesMetadata[evt.sourceId].loadStatus !== "error"
      ) {
        this.props.updateSourceLoadStatus(evt.sourceId, "error");
      }
    });

    this.map.on("sourcedata", evt => {
      if (evt.sourceId.startsWith("mapbox-gl-draw")) {
        return;
      }

      const loadStatus = this.map.isSourceLoaded(evt.sourceId)
        ? "loaded"
        : "loading";

      if (this.props.sourcesMetadata[evt.sourceId].loadStatus !== loadStatus) {
        this.props.updateSourceLoadStatus(evt.sourceId, loadStatus);
      }
    });

    if (!this.props.mapConfig.options.disableDrawing) {
      this.draw = new MapboxDraw({
        displayControlsDefault: false,
        userProperties: true,
        styles: drawingLayers,
      });

      this.map.addControl(this.draw);

      // We monkey-patch the native Mapbox methods below to prevent the draw
      // plugin from manipulating map state directly. Where needed, we reroute
      // data to our Redux store. Note that "setSourceData" is a custom method
      // that only exists on our fork of mapbox-gl-draw.
      // TODO: See PR where this change was made on the fork...
      this.map.addSource = (newSourceId, newSource) => {
        this.props.updateSources(newSourceId, newSource);
      };
      this.map.addLayer = newLayer => {
        this.props.updateLayers(newLayer);
      };
      this.map.removeLayer = () => {
        // no-op
      };
      this.map.removeSource = () => {
        // no-op
      };
      this.map.getSource = () => {
        return true;
      };
      this.map.setSourceData = (sourceId, newFeatures) => {
        this.props.updateGeoJSONFeatures({
          sourceId,
          newFeatures,
          mode: "replace",
        });
      };

      this.map.on("draw.update", evt => {
        emitter.emit("draw:update-geometry", evt.features[0].geometry);
      });

      this.map.on("draw.create", evt => {
        this.props.setActiveDrawGeometryId(evt.features[0].id);
        emitter.emit("draw:update-geometry", evt.features[0].geometry);
        if (evt.features[0].geometry.type === "Point") {
          this.draw.get(evt.features[0].id) &&
            this.draw.setFeatureProperty(
              evt.features[0].id,
              "marker-symbol",
              this.props.activeMarker,
            );
          this.draw.set(this.draw.getAll());
        }
      });

      // TODO: unbind this when leaving draw mode
      this.map.on("dragend", () => {
        const { lng, lat } = this.map.getCenter();
        this.props.updateMapViewport({
          latitude: lat,
          longitude: lng,
        });
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onWindowResize);
  }

  removeDrawGeometry() {
    // Remove any drawn geometry.
    this.props.setActiveDrawGeometryId(null);
    ["mapbox-gl-draw-cold", "mapbox-gl-draw-hot"].forEach(sourceId =>
      this.props.updateGeoJSONFeatures({
        sourceId,
        newFeatures: [],
        mode: "replace",
      }),
    );
    this.draw.deleteAll();
  }

  updateDrawGeometryStyle(activeDrawGeometryId) {
    Object.entries(this.props.geometryStyle).forEach(
      ([styleProperty, value]) => {
        this.draw.setFeatureProperty(
          activeDrawGeometryId,
          styleProperty,
          value,
        );
      },
    );
    this.draw.set(this.draw.getAll());
  }

  componentDidUpdate(prevProps) {
    if (this.props.isDrawModeActive !== prevProps.isDrawModeActive) {
      // Drawing mode has been entered or left.
      !this.props.isDrawModeActive && this.removeDrawGeometry();
    }

    if (this.props.placeFilters.length !== prevProps.placeFilters.length) {
      // Filters have been applied or unapplied.

      // "sourceId" and "datasetSlug" are the same for Place sources. We assume
      // that all filters will be filtering the same source, so it's safe to
      // pull the datasetSlug/sourceId from the first filter in the filters
      // array.
      const sourceId = this.props.placeFilters.length
        ? this.props.placeFilters[0].datasetSlug
        : prevProps.placeFilters[0].datasetSlug;
      this.props.updateGeoJSONFeatures({
        sourceId,
        newFeatures: createGeoJSONFromPlaces(this.props.filteredPlaces)
          .features,
        mode: "replace",
      });
    }

    if (
      this.props.mapViewport.latitude !== prevProps.mapViewport.latitude ||
      this.props.mapViewport.longitude !== prevProps.mapViewport.longitude ||
      this.props.mapViewport.zoom !== prevProps.mapViewport.zoom
    ) {
      this.props.setSlippyRoute();
    }

    if (!this.props.mapConfig.options.disableDrawing) {
      if (this.props.activeDrawingTool !== prevProps.activeDrawingTool) {
        // A new drawing tool has been selected.
        switch (this.props.activeDrawingTool) {
          case "create-polygon":
            this.draw.changeMode(this.draw.modes.DRAW_POLYGON);
            break;
          case "create-polyline":
            this.draw.changeMode(this.draw.modes.DRAW_LINE_STRING);
            break;
          case "create-marker":
            this.draw.changeMode(this.draw.modes.DRAW_POINT);
            break;
          default:
            this.removeDrawGeometry();
            break;
        }
      }

      if (!prevProps.activePlaceId && this.props.activePlaceId) {
        // The user has entered Edit mode with pre-existing drawn geometry.
        const activeDrawGeometryId = this.draw.add(
          this.props.placeSelector(this.props.activePlaceId).geometry,
        )[0];
        this.props.setActiveDrawGeometryId(activeDrawGeometryId);
        this.draw.changeMode(this.draw.modes.SIMPLE_SELECT);
        this.updateDrawGeometryStyle(activeDrawGeometryId);
      }

      if (
        this.props.activeMarker !== prevProps.activeMarker &&
        this.draw.get(this.props.activeDrawGeometryId)
      ) {
        this.draw.setFeatureProperty(
          this.props.activeDrawGeometryId,
          "marker-symbol",
          this.props.activeMarker,
        );
        this.draw.set(this.draw.getAll());
      }

      if (
        this.props.geometryStyle !== prevProps.geometryStyle &&
        this.props.activeDrawGeometryId &&
        this.props.activeDrawingTool &&
        this.props.isDrawModeActive
      ) {
        this.updateDrawGeometryStyle(this.props.activeDrawGeometryId);
      }

      if (prevProps.activeDrawGeometryId && !this.props.activeDrawGeometryId) {
        this.draw.deleteAll();
      }
    }
  }

  beginFeatureQuery = evt => {
    // Relying on react-map-gl's built-in onClick handler produces a noticeable
    // lag when clicking around Places on the map. It's not clear why, but we
    // get better performance by querying rendered features as soon as the
    // onMouseDown or onTouchStart events fire, and using the onMouseUp and
    // onTouchEnd handler to test if the most recent queried feature is one we
    // shoud route to (i.e. is a Place).
    //
    // Note that if no features are found in the query, an empty array is
    // returned.
    this.queriedFeatures = this.map.queryRenderedFeatures(evt.point);
  };

  endFeatureQuery = () => {
    if (
      !this.props.isMapDragging &&
      this.queriedFeatures.length &&
      this.queriedFeatures[0].properties &&
      this.queriedFeatures[0].properties._clientSlug
    ) {
      // If the topmost clicked-on feature has a _clientSlug property, there's
      // a good bet we've clicked on a Place. Assume we have and route to the
      // Place's detail view.
      this.props.router.navigate(
        `/${this.queriedFeatures[0].properties._clientSlug}/${
          this.queriedFeatures[0].properties.id
        }`,
        { trigger: true },
      );
    }
  };

  onInteractionStateChange = evt => {
    if (evt.isDragging && !this.props.isMapDragging) {
      this.props.updateMapDragging(true);
    } else if (!evt.isDragging && this.props.isMapDragging) {
      this.props.updateMapDragging(false);
      this.props.updateMapDragged(true);
    }
  };

  onMapLoad = () => {
    this.setState({
      isMapLoaded: true,
    });
  };

  render() {
    return (
      <Fragment>
        <Global
          styles={{
            ".overlays": {
              pointerEvents: this.props.isDrawModeActive ? "none" : "initial",
            },
          }}
        />
        <MapGL
          ref={this.mapRef}
          width={this.props.mapViewport.width}
          height={this.props.mapViewport.height}
          latitude={this.props.mapViewport.latitude}
          longitude={this.props.mapViewport.longitude}
          pitch={this.props.mapViewport.pitch}
          bearing={this.props.mapViewport.bearing}
          zoom={this.props.mapViewport.zoom}
          dragPan={!this.props.isDrawModeActive}
          doubleClickZoom={!this.props.isDrawModeActive}
          dragRotate={!this.props.isDrawModeActive}
          transitionDuration={this.props.mapViewport.transitionDuration}
          transitionInterpolator={this.props.mapViewport.transitionInterpolator}
          transitionEasing={this.props.mapViewport.transitionEasing}
          mapboxApiAccessToken={MAP_PROVIDER_TOKEN}
          minZoom={this.props.mapViewport.minZoom}
          maxZoom={this.props.mapViewport.maxZoom}
          onMouseUp={this.endFeatureQuery}
          onMouseDown={this.beginFeatureQuery}
          onTouchEnd={this.onMouseUp}
          onTouchStart={this.onMouseDown}
          onViewportChange={viewport => {
            // NOTE: react-map-gl seems to cache the width and height of the map
            // container at the beginning of a transition. If the viewport change
            // that initiated the transition also changed the width and/or height
            // (for example when a Place is clicked and the map resizes to make
            // way for the content panel), then react-map-gl will immediately
            // undo the width and height change. The result of this is yet
            // another version of the off-center bug.
            //
            // So, we strip out the height and width from any viewport changes
            // originating from react-map-gl. There should never be a situation
            // where react-map-gl needs to set the width or height of the map
            // container.
            const { width, height, ...rest } = viewport;
            this.props.updateMapViewport(
              rest,
              this.isMapTransitioning
                ? false
                : this.props.mapConfig.options.scrollZoomAroundCenter,
            );
          }}
          onTransitionStart={() => (this.isMapTransitioning = true)}
          onTransitionEnd={() => (this.isMapTransitioning = false)}
          interactiveLayerIds={this.props.interactiveLayerIds}
          mapStyle={this.props.mapStyle}
          onInteractionStateChange={this.onInteractionStateChange}
          onLoad={this.onMapLoad}
        >
          {this.state.isMapLoaded && (
            <MapControlsContainer>
              <NavigationControl
                onViewportChange={viewport =>
                  this.props.updateMapViewport(viewport)
                }
              />
              <GeolocateControl
                updateMapViewport={this.props.updateMapViewport}
              />
              {this.props.leftSidebarConfig.panels.map(panel => (
                <CustomControl
                  key={panel.id}
                  icon={panel.icon}
                  component={panel.component}
                  setLeftSidebarExpanded={this.props.setLeftSidebarExpanded}
                  setLeftSidebarComponent={this.props.setLeftSidebarComponent}
                />
              ))}
            </MapControlsContainer>
          )}
        </MapGL>
      </Fragment>
    );
  }
}

MainMap.propTypes = {
  activeDrawGeometryId: PropTypes.string,
  activeDrawingTool: PropTypes.string,
  activeMarker: PropTypes.string,
  activePlaceId: PropTypes.number,
  container: PropTypes.instanceOf(Element).isRequired,
  filteredPlaces: PropTypes.arrayOf(placePropType).isRequired,
  geometryStyle: geometryStyleProps,
  interactiveLayerIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  isDrawModeActive: PropTypes.bool.isRequired,
  isMapDragging: PropTypes.bool.isRequired,
  leftSidebarConfig: PropTypes.shape({
    is_enabled: PropTypes.bool,
    is_visible_default: PropTypes.bool,
    panels: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        title: PropTypes.string,
      }),
    ),
  }).isRequired,
  mapConfig: mapConfigPropType.isRequired,
  mapStyle: mapStylePropType.isRequired,
  mapViewport: mapViewportPropType.isRequired,
  placeFilters: PropTypes.array.isRequired,
  placeSelector: PropTypes.func.isRequired,
  router: PropTypes.instanceOf(Backbone.Router),
  setActiveDrawGeometryId: PropTypes.func.isRequired,
  setLeftSidebarExpanded: PropTypes.func.isRequired,
  setLeftSidebarComponent: PropTypes.func.isRequired,
  setSlippyRoute: PropTypes.func.isRequired,
  sourcesMetadata: sourcesMetadataPropType.isRequired,
  updateMapDragged: PropTypes.func.isRequired,
  updateMapDragging: PropTypes.func.isRequired,
  updateGeoJSONFeatures: PropTypes.func.isRequired,
  updateLayers: PropTypes.func.isRequired,
  updateMapViewport: PropTypes.func.isRequired,
  updateSources: PropTypes.func.isRequired,
  updateSourceLoadStatus: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  activeDrawGeometryId: activeDrawGeometryIdSelector(state),
  activeDrawingTool: activeDrawingToolSelector(state),
  activeMarker: activeMarkerSelector(state),
  activePlaceId: activePlaceIdSelector(state),
  filteredPlaces: filteredPlacesSelector(state),
  geometryStyle: geometryStyleSelector(state),
  isDrawModeActive: drawModeActiveSelector(state),
  isMapDragging: mapDraggingSelector(state),
  leftSidebarConfig: leftSidebarConfigSelector(state),
  interactiveLayerIds: interactiveLayerIdsSelector(state),
  mapConfig: mapConfigSelector(state),
  mapViewport: mapViewportSelector(state),
  mapStyle: mapStyleSelector(state),
  placeFilters: filtersSelector(state),
  placeSelector: placeId => placeSelector(state, placeId),
  sourcesMetadata: sourcesMetadataSelector(state),
});

const mapDispatchToProps = dispatch => ({
  setActiveDrawGeometryId: id => dispatch(setActiveDrawGeometryId(id)),
  setLeftSidebarExpanded: isExpanded =>
    dispatch(setLeftSidebarExpanded(isExpanded)),
  setLeftSidebarComponent: component =>
    dispatch(setLeftSidebarComponent(component)),
  updateMapDragged: isDragged => dispatch(updateMapDragged(isDragged)),
  updateMapDragging: isDragging => dispatch(updateMapDragging(isDragging)),
  updateGeoJSONFeatures: ({ sourceId, newFeatures, mode }) =>
    dispatch(updateGeoJSONFeatures({ sourceId, newFeatures, mode })),
  updateMapViewport: viewport => dispatch(updateMapViewport(viewport)),
  updateSourceLoadStatus: (sourceId, loadStatus) =>
    dispatch(updateSourceLoadStatus(sourceId, loadStatus)),
  updateSources: (newSourceId, newSource) =>
    dispatch(updateSources(newSourceId, newSource)),
  updateLayers: newLayer => dispatch(updateLayers(newLayer)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MainMap);

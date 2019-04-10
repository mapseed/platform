import React, { Component, createRef } from "react";
import { findDOMNode } from "react-dom";
import PropTypes from "prop-types";
import MapGL, { NavigationControl } from "react-map-gl";
import { connect } from "react-redux";
import styled from "@emotion/styled";
import InviteModal from "../organisms/invite-modal";
import { Global } from "@emotion/core";
import MapboxDraw from "mapseed-mapbox-gl-draw/dist/mapbox-gl-draw";
import "mapseed-mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { throttle } from "throttle-debounce";
import { withRouter } from "react-router";

import {
  drawModeActiveSelector,
  interactiveLayerIdsSelector,
  mapDraggingOrZoomingSelector,
  mapStyleSelector,
  mapViewportSelector,
  mapViewportPropType,
  mapStylePropType,
  updateMapViewport,
  updateSourceLoadStatus,
  sourcesMetadataSelector,
  updateMapDraggedOrZoomed,
  updateMapDraggingOrZooming,
  updateFeaturesInGeoJSONSource,
  sourcesMetadataPropType,
  updateSources,
  updateLayers,
} from "../../state/ducks/map";
import { datasetsSelector, datasetsPropType } from "../../state/ducks/datasets";
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
  activeEditPlaceIdSelector,
  filteredPlacesSelector,
  placePropType,
  placeSelector,
} from "../../state/ducks/places";
import { filtersSelector } from "../../state/ducks/filters";
import { uiVisibilitySelector } from "../../state/ducks/ui";
import { createGeoJSONFromPlaces } from "../../utils/place-utils";
import { updateUIVisibility } from "../../state/ducks/ui";

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

  componentDidMount() {
    window.addEventListener("resize", this.resizeMap);

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
      // See: https://github.com/mapseed/mapbox-gl-draw/pull/1
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
        this.props.updateFeaturesInGeoJSONSource(sourceId, newFeatures);
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
    }

    // Ensure that any filters set on another template (like the list) are
    // applied when returning to the map template.
    this.applyFeatureFilters();

    requestAnimationFrame(() => {
      this.resizeMap();
    });
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeMap);
    this.map.off("error");
    this.map.off("sourcedata");
    this.map.off("draw.update");
    this.map.off("draw.create");
  }

  // This function gets called a lot, so we throttle it.
  setSlippyRoute = throttle(500, () => {
    if (this.props.isContentPanelVisible) {
      // Don't set the slippy route when we're at a url like /new or /page/xyz.
      return;
    }

    const { zoom, latitude, longitude } = this.props.mapViewport;
    // Use the browser's history API here so we don't trigger a route change
    // event in react router (to avoid repeated analytics tracking of slippy
    // routes).
    window.history.pushState(
      "",
      "",
      `/${zoom.toFixed(2)}/${latitude.toFixed(5)}/${longitude.toFixed(5)}`,
    );
  });

  resizeMap = () => {
    const containerDims = findDOMNode(
      this.props.mapContainerRef.current,
    ).getBoundingClientRect();

    this.props.updateMapViewport({
      height: containerDims.height,
      width: containerDims.width,
    });
  };

  applyFeatureFilters() {
    this.props.datasets.map(dataset => dataset.slug).forEach(sourceId => {
      this.props.updateFeaturesInGeoJSONSource(
        sourceId,
        createGeoJSONFromPlaces(
          this.props.filteredPlaces.filter(
            place => place._datasetSlug === sourceId,
          ),
        ).features,
      );
    });
  }

  removeDrawGeometry() {
    // Remove any drawn geometry.
    this.props.setActiveDrawGeometryId(null);
    ["mapbox-gl-draw-cold", "mapbox-gl-draw-hot"].forEach(sourceId =>
      this.props.updateFeaturesInGeoJSONSource(sourceId, []),
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
    // NOTE: These checks are not comparing numerical dimensions; rather they
    // are comparing CSS width and height declarations in string form.
    if (
      this.props.mapContainerHeightDeclaration !==
        prevProps.mapContainerHeightDeclaration ||
      this.props.mapContainerWidthDeclaration !==
        prevProps.mapContainerWidthDeclaration
    ) {
      this.resizeMap();
    }

    if (this.props.isDrawModeActive && !prevProps.isDrawModeActive) {
      // Drawing mode has been entered.
      this.map.on("dragend", () => {
        const { lng, lat } = this.map.getCenter();
        this.props.updateMapViewport({
          latitude: lat,
          longitude: lng,
        });
      });
    } else if (!this.props.isDrawModeActive && prevProps.isDrawModeActive) {
      // Drawing mode has been left.
      this.map.off("dragend");
      this.removeDrawGeometry();
    }

    if (this.props.placeFilters.length !== prevProps.placeFilters.length) {
      // Filters have been added or removed.
      this.applyFeatureFilters();
    }

    if (
      this.props.mapViewport.latitude !== prevProps.mapViewport.latitude ||
      this.props.mapViewport.longitude !== prevProps.mapViewport.longitude ||
      this.props.mapViewport.zoom !== prevProps.mapViewport.zoom
    ) {
      this.setSlippyRoute();
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

      if (!prevProps.activeEditPlaceId && this.props.activeEditPlaceId) {
        // The user has entered Edit mode with pre-existing drawn geometry.
        const activeDrawGeometryId = this.draw.add(
          this.props.placeSelector(this.props.activeEditPlaceId).geometry,
        )[0];
        this.props.setActiveDrawGeometryId(activeDrawGeometryId);
        this.draw.changeMode(this.draw.modes.SIMPLE_SELECT);
        this.updateDrawGeometryStyle(activeDrawGeometryId);
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
        emitter.emit("draw:update-geometry", null);
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
      !this.props.isMapDraggingOrZooming &&
      this.queriedFeatures.length &&
      this.queriedFeatures[0].properties &&
      this.queriedFeatures[0].properties._clientSlug
    ) {
      // If the topmost clicked-on feature has a _clientSlug property, there's
      // a good bet we've clicked on a Place. Assume we have and route to the
      // Place's detail view.
      this.props.history.push(
        `/${this.queriedFeatures[0].properties._clientSlug}/${
          this.queriedFeatures[0].properties.id
        }`,
      );
    }
  };

  onInteractionStateChange = evt => {
    if (
      (evt.isDragging || evt.isZooming) &&
      !this.props.isMapDraggingOrZooming
    ) {
      this.props.updateMapDraggingOrZooming(true);
    } else if (
      !evt.isDragging &&
      !evt.isZooming &&
      this.props.isMapDraggingOrZooming
    ) {
      this.props.updateMapDraggingOrZooming(false);
      this.props.updateMapDraggedOrZoomed(true);
      this.props.updateSpotlightMaskVisibility(false);
    }
  };

  onMapLoad = () => {
    this.setState({
      isMapLoaded: true,
    });
  };

  render() {
    return (
      <>
        <InviteModal isOpen={this.props.isInviteModalOpen} />
        <Global
          styles={{
            ".overlays": {
              pointerEvents: this.props.isDrawModeActive ? "none" : "initial",
            },
          }}
        />
        <MapGL
          attributionControl={false}
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
          onTouchEnd={this.endFeatureQuery}
          onTouchStart={this.beginFeatureQuery}
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
      </>
    );
  }
}

MainMap.propTypes = {
  activeDrawGeometryId: PropTypes.string,
  activeDrawingTool: PropTypes.string,
  activeMarker: PropTypes.string,
  activeEditPlaceId: PropTypes.number,
  filteredPlaces: PropTypes.arrayOf(placePropType).isRequired,
  geometryStyle: geometryStyleProps,
  history: PropTypes.object.isRequired,
  interactiveLayerIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  isContentPanelVisible: PropTypes.bool.isRequired,
  isDrawModeActive: PropTypes.bool.isRequired,
  isMapDraggingOrZooming: PropTypes.bool.isRequired,
  isRightSidebarVisible: PropTypes.bool.isRequired,
  isInviteModalOpen: PropTypes.bool.isRequired,
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
  mapContainerWidthDeclaration: PropTypes.string.isRequired,
  mapContainerHeightDeclaration: PropTypes.string.isRequired,
  mapContainerRef: PropTypes.object.isRequired,
  mapStyle: mapStylePropType.isRequired,
  mapViewport: mapViewportPropType.isRequired,
  placeFilters: PropTypes.array.isRequired,
  placeSelector: PropTypes.func.isRequired,
  setActiveDrawGeometryId: PropTypes.func.isRequired,
  setLeftSidebarExpanded: PropTypes.func.isRequired,
  setLeftSidebarComponent: PropTypes.func.isRequired,
  sourcesMetadata: sourcesMetadataPropType.isRequired,
  updateMapDraggedOrZoomed: PropTypes.func.isRequired,
  updateMapDraggingOrZooming: PropTypes.func.isRequired,
  updateFeaturesInGeoJSONSource: PropTypes.func.isRequired,
  updateLayers: PropTypes.func.isRequired,
  updateMapViewport: PropTypes.func.isRequired,
  updateSources: PropTypes.func.isRequired,
  updateSourceLoadStatus: PropTypes.func.isRequired,
  updateSpotlightMaskVisibility: PropTypes.func.isRequired,
  datasets: datasetsPropType,
};

const mapStateToProps = state => ({
  activeDrawGeometryId: activeDrawGeometryIdSelector(state),
  activeDrawingTool: activeDrawingToolSelector(state),
  activeMarker: activeMarkerSelector(state),
  activeEditPlaceId: activeEditPlaceIdSelector(state),
  filteredPlaces: filteredPlacesSelector(state),
  geometryStyle: geometryStyleSelector(state),
  isContentPanelVisible: uiVisibilitySelector("contentPanel", state),
  isDrawModeActive: drawModeActiveSelector(state),
  isInviteModalOpen: uiVisibilitySelector("inviteModal", state),
  isMapDraggingOrZooming: mapDraggingOrZoomingSelector(state),
  isRightSidebarVisible: uiVisibilitySelector("rightSidebar", state),
  leftSidebarConfig: leftSidebarConfigSelector(state),
  interactiveLayerIds: interactiveLayerIdsSelector(state),
  mapConfig: mapConfigSelector(state),
  mapViewport: mapViewportSelector(state),
  mapStyle: mapStyleSelector(state),
  placeFilters: filtersSelector(state),
  placeSelector: placeId => placeSelector(state, placeId),
  sourcesMetadata: sourcesMetadataSelector(state),
  datasets: datasetsSelector(state),
});

const mapDispatchToProps = dispatch => ({
  setActiveDrawGeometryId: id => dispatch(setActiveDrawGeometryId(id)),
  setLeftSidebarExpanded: isExpanded =>
    dispatch(setLeftSidebarExpanded(isExpanded)),
  setLeftSidebarComponent: component =>
    dispatch(setLeftSidebarComponent(component)),
  updateMapDraggedOrZoomed: isDraggedOrZoomed =>
    dispatch(updateMapDraggedOrZoomed(isDraggedOrZoomed)),
  updateMapDraggingOrZooming: isDraggingOrZooming =>
    dispatch(updateMapDraggingOrZooming(isDraggingOrZooming)),
  updateFeaturesInGeoJSONSource: (sourceId, newFeatures) =>
    dispatch(updateFeaturesInGeoJSONSource(sourceId, newFeatures)),
  updateMapViewport: viewport => dispatch(updateMapViewport(viewport)),
  updateSourceLoadStatus: (sourceId, loadStatus) =>
    dispatch(updateSourceLoadStatus(sourceId, loadStatus)),
  updateSources: (newSourceId, newSource) =>
    dispatch(updateSources(newSourceId, newSource)),
  updateLayers: newLayer => dispatch(updateLayers(newLayer)),
  updateSpotlightMaskVisibility: isVisible =>
    dispatch(updateUIVisibility("spotlightMask", isVisible)),
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(MainMap),
);

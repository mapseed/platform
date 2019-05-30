import React, { Component, createRef } from "react";
import { findDOMNode } from "react-dom";
import PropTypes from "prop-types";
import MapGL, { NavigationControl, Popup } from "react-map-gl";
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
  mapViewportPropType,
  mapStylePropType,
  sourcesMetadataSelector,
  updateFeaturesInGeoJSONSource,
  sourcesMetadataPropType,
  updateSources,
  updateLayers,
  updateMapContainerDimensions,
  mapContainerDimensionsSeletor,
  filterableLayerGroupsMetadataSelector,
  filterableLayerGroupMetadataPropType,
  mapLayerPopupSelector,
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
  isDrawingPluginInitializedSelector,
  updateDrawingPluginInitialized,
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
import MapCenterpoint from "../molecules/map-centerpoint";
import MapFilterSliderContainer from "../organisms/map-filter-slider-container";

import emitter from "../../utils/emitter";
import { Mixpanel } from "../../utils/mixpanel";

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
    isMapDraggingOrZooming: false,
    popupContent: null,
    popupLatitide: null,
    popupLongitude: null,
  };

  queriedFeatures = [];
  mouseX = 0;
  mouseY = 0;
  isMapTransitioning = false;
  mapRef = createRef();

  componentDidMount() {
    this.map = this.mapRef.current.getMap();

    window.addEventListener("resize", this.resizeMap);

    // MapboxGL fires many redundant events, so we only update load or error
    // status state if a new type of event is fired. It's necessary to attach
    // these events to a ref of the map because react-map-gl does not expose
    // the event binding API itself.
    this.map.on("error", evt => {
      if (this.state.isMapDraggingOrZooming || this.isMapTransitioning) {
        return;
      }

      if (
        evt.sourceId &&
        this.props.mapSourcesLoadStatus[evt.sourceId] !== "error"
      ) {
        this.props.onUpdateSourceLoadStatus(evt.sourceId, "error");
      }
    });

    this.map.on("sourcedata", evt => {
      if (
        this.state.isMapDraggingOrZooming ||
        this.isMapTransitioning ||
        evt.sourceId.startsWith("mapbox-gl-draw")
      ) {
        return;
      }

      const loadStatus = this.map.isSourceLoaded(evt.sourceId)
        ? "loaded"
        : "loading";

      if (this.props.mapSourcesLoadStatus[evt.sourceId] !== loadStatus) {
        this.props.onUpdateSourceLoadStatus(evt.sourceId, loadStatus);
      }
    });

    if (
      !this.props.mapConfig.options.disableDrawing &&
      !this.props.isDrawingPluginInitialized
    ) {
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

      this.props.updateDrawingPluginInitialized(true);
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
    // On unmount, save the current map viewport so we can restore it if we
    // return to the map template.
    this.props.onUpdateInitialMapViewport(this.props.mapViewport);
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

    this.props.updateMapContainerDimensions({
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
            place => place.datasetSlug === sourceId,
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
        this.props.onUpdateMapViewport({
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

  parsePopupContent = (popupContent, properties) => {
    // Support a Handlebars-inspired syntax for injecting feature properties
    // into popup content.
    return popupContent.replace(/{{(\w+?)}}/, (match, property) => {
      if (properties[property]) {
        return properties[property];
      } else {
        // eslint-disable-next-line no-console
        console.error(
          `Error: cannot find property ${property} on feature for use on popup`,
        );
      }
    });
  };

  isMapEvent = evt => {
    // An event's className will be `overlays` when the event originates on
    // the map itself (as opposed to on controls or on popups).
    return evt.target && evt.target.className === "overlays";
  };

  beginFeatureQuery = evt => {
    if (!this.isMapEvent(event)) {
      return;
    }

    // Relying on react-map-gl's built-in onClick handler produces a noticeable
    // lag when clicking around Places on the map. It's not clear why, but we
    // get better performance by querying rendered features as soon as the
    // onMouseDown or onTouchStart events fire, and using the onMouseUp and
    // onTouchEnd handler to test if the most recent queried feature is one we
    // should route to (i.e. is a Place).
    //
    // Note that if no features are found in the query, an empty array is
    // returned.
    this.mouseX = evt.center.x;
    this.mouseY = evt.center.y;
    this.queriedFeatures = this.map.queryRenderedFeatures(evt.point);
  };

  endFeatureQuery = evt => {
    if (!this.isMapEvent(evt)) {
      return;
    }

    const feature = this.queriedFeatures[0];

    if (
      !this.state.isMapDraggingOrZooming &&
      feature &&
      feature.properties &&
      feature.properties.clientSlug
    ) {
      // If the topmost clicked-on feature has a clientSlug property, there's
      // a good bet we've clicked on a Place. Assume we have and route to the
      // Place's detail view.
      const placeId = feature.properties.id;
      const clientSlug = feature.properties.clientSlug;
      Mixpanel.track("Clicked place on map", { placeId });
      this.props.history.push(`/${clientSlug}/${placeId}`);
    }

    if (
      feature &&
      this.props.mapLayerPopupSelector(feature.layer.id) &&
      // When `center.x` matches `mouseX` and `center.y` matches `mouseY`, the
      // user has clicked in place (as opposed to clicking, dragging, then
      // releasing). We only want to render popups on in-place clicks.
      //
      // We wouldn't need to worry about tracking this information
      // if we used the `onClick` listener, but as explained above we avoid
      // `onClick` for performance reasons.
      evt.center.x === this.mouseX &&
      evt.center.y === this.mouseY
    ) {
      const popupContent = this.parsePopupContent(
        this.props.mapLayerPopupSelector(feature.layer.id),
        feature.properties,
      );

      // Display popup.
      this.setState({
        popupContent,
        popupLatitude: evt.lngLat[1],
        popupLongitude: evt.lngLat[0],
      });
    }
  };

  onInteractionStateChange = evt => {
    if (
      (evt.isDragging || evt.isZooming) &&
      !this.state.isMapDraggingOrZooming
    ) {
      this.setState({
        isMapDraggingOrZooming: true,
      });
    } else if (
      !evt.isDragging &&
      !evt.isZooming &&
      this.state.isMapDraggingOrZooming
    ) {
      this.setState({
        isMapDraggingOrZooming: false,
      });
      this.props.onUpdateMapDraggedOrZoomed(true);
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
          width={this.props.mapContainerDimensions.width}
          height={this.props.mapContainerDimensions.height}
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
          onMouseDown={this.beginFeatureQuery}
          onMouseUp={this.endFeatureQuery}
          onTouchStart={this.beginFeatureQuery}
          onTouchEnd={this.endFeatureQuery}
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
            this.props.onUpdateMapViewport(
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
          {this.state.popupContent && (
            <Popup
              latitude={this.state.popupLatitude}
              longitude={this.state.popupLongitude}
              onClose={() =>
                this.setState({
                  popupContent: null,
                })
              }
              anchor="bottom"
            >
              <div
                dangerouslySetInnerHTML={{ __html: this.state.popupContent }}
              />
            </Popup>
          )}
          {this.props.isMapCenterpointVisible && (
            <MapCenterpoint
              isMapDraggingOrZooming={this.state.isMapDraggingOrZooming}
              isMapDraggedOrZoomed={this.props.isMapDraggedOrZoomed}
            />
          )}
          {this.state.isMapLoaded && (
            <MapControlsContainer>
              <NavigationControl
                onViewportChange={viewport =>
                  this.props.onUpdateMapViewport(viewport)
                }
              />
              <GeolocateControl
                updateMapViewport={this.props.onUpdateMapViewport}
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
        {this.props.filterableLayerGroupsMetadata.length > 0 && (
          <MapFilterSliderContainer
            filterableLayerGroupsMetadata={
              this.props.filterableLayerGroupsMetadata
            }
          />
        )}
      </>
    );
  }
}

MainMap.propTypes = {
  activeDrawGeometryId: PropTypes.string,
  activeDrawingTool: PropTypes.string,
  activeMarker: PropTypes.string,
  activeEditPlaceId: PropTypes.number,
  filterableLayerGroupsMetadata: PropTypes.arrayOf(
    filterableLayerGroupMetadataPropType,
  ),
  filteredPlaces: PropTypes.arrayOf(placePropType).isRequired,
  geometryStyle: geometryStyleProps,
  history: PropTypes.object.isRequired,
  interactiveLayerIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  isContentPanelVisible: PropTypes.bool.isRequired,
  isDrawModeActive: PropTypes.bool.isRequired,
  isDrawingPluginInitialized: PropTypes.bool.isRequired,
  isMapCenterpointVisible: PropTypes.bool.isRequired,
  isMapDraggedOrZoomed: PropTypes.bool.isRequired,
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
  mapContainerDimensions: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }),
  mapContainerWidthDeclaration: PropTypes.string.isRequired,
  mapContainerHeightDeclaration: PropTypes.string.isRequired,
  mapContainerRef: PropTypes.object.isRequired,
  mapLayerPopupSelector: PropTypes.func.isRequired,
  mapSourcesLoadStatus: PropTypes.object.isRequired,
  mapStyle: mapStylePropType.isRequired,
  mapViewport: mapViewportPropType.isRequired,
  placeFilters: PropTypes.array.isRequired,
  placeSelector: PropTypes.func.isRequired,
  setActiveDrawGeometryId: PropTypes.func.isRequired,
  setLeftSidebarExpanded: PropTypes.func.isRequired,
  setLeftSidebarComponent: PropTypes.func.isRequired,
  sourcesMetadata: sourcesMetadataPropType.isRequired,
  onUpdateMapDraggedOrZoomed: PropTypes.func.isRequired,
  updateFeaturesInGeoJSONSource: PropTypes.func.isRequired,
  updateLayers: PropTypes.func.isRequired,
  onUpdateMapViewport: PropTypes.func.isRequired,
  updateSources: PropTypes.func.isRequired,
  onUpdateInitialMapViewport: PropTypes.func.isRequired,
  onUpdateSourceLoadStatus: PropTypes.func.isRequired,
  onUpdateSpotlightMaskVisibility: PropTypes.func.isRequired,
  datasets: datasetsPropType,
  updateMapContainerDimensions: PropTypes.func.isRequired,
  updateDrawingPluginInitialized: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  activeDrawGeometryId: activeDrawGeometryIdSelector(state),
  activeDrawingTool: activeDrawingToolSelector(state),
  activeMarker: activeMarkerSelector(state),
  activeEditPlaceId: activeEditPlaceIdSelector(state),
  filterableLayerGroupsMetadata: filterableLayerGroupsMetadataSelector(state),
  filteredPlaces: filteredPlacesSelector(state),
  geometryStyle: geometryStyleSelector(state),
  isContentPanelVisible: uiVisibilitySelector("contentPanel", state),
  isDrawModeActive: drawModeActiveSelector(state),
  isDrawingPluginInitialized: isDrawingPluginInitializedSelector(state),
  isInviteModalOpen: uiVisibilitySelector("inviteModal", state),
  isMapCenterpointVisible: uiVisibilitySelector("mapCenterpoint", state),
  isMapDraggingOrZooming: mapDraggingOrZoomingSelector(state),
  isRightSidebarVisible: uiVisibilitySelector("rightSidebar", state),
  leftSidebarConfig: leftSidebarConfigSelector(state),
  interactiveLayerIds: interactiveLayerIdsSelector(state),
  mapConfig: mapConfigSelector(state),
  mapContainerDimensions: mapContainerDimensionsSeletor(state),
  mapLayerPopupSelector: layerId => mapLayerPopupSelector(layerId, state),
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
  updateFeaturesInGeoJSONSource: (sourceId, newFeatures) =>
    dispatch(updateFeaturesInGeoJSONSource(sourceId, newFeatures)),
  updateSources: (newSourceId, newSource) =>
    dispatch(updateSources(newSourceId, newSource)),
  updateLayers: newLayer => dispatch(updateLayers(newLayer)),
  updateMapContainerDimensions: newDimensions =>
    dispatch(updateMapContainerDimensions(newDimensions)),
  updateDrawingPluginInitialized: isInitialized =>
    dispatch(updateDrawingPluginInitialized(isInitialized)),
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(MainMap),
);

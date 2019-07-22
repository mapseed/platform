/** @jsx jsx */
import * as React from "react";
import { jsx } from "@emotion/core";
import { findDOMNode } from "react-dom";
import { Map } from "mapbox-gl";
import { GeometryObject } from "geojson";
import PropTypes from "prop-types";
import MapGL, { Popup, InteractiveMap } from "react-map-gl";
import { connect } from "react-redux";
import { throttle } from "throttle-debounce";
import { RouteComponentProps, withRouter } from "react-router";
import eventEmitter from "../../utils/event-emitter";

import {
  interactiveLayerIdsSelector,
  mapStyleSelector,
  mapStylePropType,
  updateFeaturesInGeoJSONSource,
  updateLayers,
  updateMapContainerDimensions,
  mapContainerDimensionsSelector,
  mapLayerPopupSelector,
} from "../../state/ducks/map-style";
import { datasetsSelector, datasetsPropType } from "../../state/ducks/datasets";
import {
  mapConfigSelector,
  mapConfigPropType,
  MapSourcesLoadStatus,
  LayerFeature,
} from "../../state/ducks/map";

import {
  MapViewportDiff,
  MapViewport,
  updateMapViewport,
  mapViewportSelector,
} from "../../state/ducks/map";
import {
  activeEditPlaceIdSelector,
  filteredPlacesSelector,
  placesPropType,
} from "../../state/ducks/places";
import { filtersSelector } from "../../state/ducks/filters";
import { uiVisibilitySelector } from "../../state/ducks/ui";
import { createGeoJSONFromPlaces } from "../../utils/place-utils";
import MapCenterpoint from "../molecules/map-centerpoint";
import MapControls from "../molecules/map-controls";
import MapWidgetContainer from "../organisms/map-widget-container";
import MapMeasurementOverlay from "../organisms/map-measurement-overlay";

import { Mixpanel } from "../../utils/mixpanel";
import { FlyToInterpolator } from "react-map-gl";
import produce from "immer";

const transitionInterpolator = new FlyToInterpolator();

const UPDATE_VIEWPORT = "update-viewport";
const mapViewportReducer = (
  state: MapViewport,
  action: {
    type: string;
    payload: { viewport: MapViewportDiff; scrollZoomAroundCenter: boolean };
  },
): MapViewport =>
  produce(state, draft => {
    switch (action.type) {
      case UPDATE_VIEWPORT:
        if (action.payload.viewport.zoom !== undefined) {
          draft.zoom = action.payload.viewport.zoom;
        }
        if (action.payload.viewport.pitch !== undefined) {
          draft.pitch = action.payload.viewport.pitch;
        }
        if (action.payload.viewport.transitionDuration !== undefined) {
          draft.transitionDuration = action.payload.viewport.transitionDuration;
        }
        // NOTE: NaN values in our viewport.bearing will cause a crash:
        // https://github.com/uber/react-map-gl/issues/630 (Although it's best
        // practice to guard against them anyway)
        if (!isNaN(Number(action.payload.viewport.bearing))) {
          draft.bearing = Number(action.payload.viewport.bearing);
        }
        // These checks support a "scroll zoom around center" feature (in
        // which a zoom of the map will not change the centerpoint) that is
        // not exposed by react-map-gl. These checks are pretty convoluted,
        // though, so it would be great if react-map-gl could just
        // incorporate the scroll zoom around center option natively.
        // See: https://github.com/uber/react-map-gl/issues/515
        if (
          !action.payload.scrollZoomAroundCenter &&
          action.payload.viewport.latitude !== undefined
        ) {
          draft.latitude = action.payload.viewport.latitude;
        }
        if (
          !action.payload.scrollZoomAroundCenter &&
          action.payload.viewport.longitude !== undefined
        ) {
          draft.longitude = action.payload.viewport.longitude;
        }
        return;
    }
  });

// TODO: remove this once we remove the Mapseed global:
declare const MAP_PROVIDER_TOKEN: string;

const statePropTypes = {
  activeEditPlaceId: PropTypes.number,
  filteredPlaces: placesPropType.isRequired,
  interactiveLayerIds: PropTypes.arrayOf(PropTypes.string.isRequired)
    .isRequired,
  isContentPanelVisible: PropTypes.bool.isRequired,
  mapConfig: mapConfigPropType,
  mapContainerDimensions: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  mapLayerPopupSelector: PropTypes.func.isRequired,
  mapStyle: mapStylePropType.isRequired,
  placeFilters: PropTypes.array.isRequired,
  datasets: datasetsPropType,
};

interface StateProps extends PropTypes.InferProps<typeof statePropTypes> {
  mapViewport: MapViewport;
}

type DispatchProps = {
  updateFeaturesInGeoJSONSource: typeof updateFeaturesInGeoJSONSource;
  updateLayers: typeof updateLayers;
  updateMapContainerDimensions: typeof updateMapContainerDimensions;
  updateMapViewport: typeof updateMapViewport;
};

type ParentProps = {
  isMapDraggedOrZoomed: boolean;
  mapContainerWidthDeclaration: string;
  mapContainerHeightDeclaration: string;
  mapContainerRef: React.RefObject<HTMLElement>;
  onUpdateMapDraggedOrZoomed: Function;
  onUpdateSpotlightMaskVisibility: Function;
  onUpdateSourceLoadStatus: Function;
  mapSourcesLoadStatus: MapSourcesLoadStatus;
};

type Props = StateProps & DispatchProps & ParentProps & RouteComponentProps<{}>;

interface State {
  isMapLoaded: boolean;
  isMapDraggingOrZooming: boolean;
  popupContent: string | null;
  popupLatitude: number | null;
  popupLongitude: number | null;
  mapViewport: MapViewport;
}

class MainMap extends React.Component<Props, State> {
  state: State = {
    isMapLoaded: false,
    isMapDraggingOrZooming: false,
    popupContent: null,
    popupLatitude: null,
    popupLongitude: null,
    mapViewport: this.props.mapViewport,
  };

  private queriedFeatures: LayerFeature<GeometryObject>[] = [];
  mouseX = 0;
  mouseY = 0;
  isMapTransitioning = false;
  mapRef: React.RefObject<InteractiveMap> = React.createRef();
  private map: Map | null = null;

  errorListener = evt => {
    if (this.state.isMapDraggingOrZooming || this.isMapTransitioning) {
      return;
    }

    if (
      evt.sourceId &&
      this.props.mapSourcesLoadStatus[evt.sourceId] !== "error"
    ) {
      this.props.onUpdateSourceLoadStatus(evt.sourceId, "error");
    }
  };

  sourceDataListener = evt => {
    if (this.state.isMapDraggingOrZooming || this.isMapTransitioning) {
      return;
    }

    const loadStatus = (this.map as Map).isSourceLoaded(evt.sourceId)
      ? "loaded"
      : "loading";

    if (this.props.mapSourcesLoadStatus[evt.sourceId] !== loadStatus) {
      this.props.onUpdateSourceLoadStatus(evt.sourceId, loadStatus);
    }
  };

  componentDidMount() {
    this.map = (this.mapRef.current as InteractiveMap).getMap();

    window.addEventListener("resize", () => {
      this.resizeMap();
    });

    eventEmitter.on(
      "setMapViewport",
      (viewport: MapViewportDiff): void => {
        this.setMapViewport(viewport);
      },
    );

    // MapboxGL fires many redundant events, so we only update load or error
    // status state if a new type of event is fired. It's necessary to attach
    // these events to a ref of the map because react-map-gl does not expose
    // the event binding API itself.
    this.map.on("error", this.errorListener);

    this.map.on("sourcedata", this.sourceDataListener);

    // Ensure that any filters set on another template (like the list) are
    // applied when returning to the map template.
    this.applyFeatureFilters();

    requestAnimationFrame(() => {
      this.resizeMap();
    });
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeMap);
    if (this.map) {
      this.map.off("error", this.errorListener);
      this.map.off("sourcedata", this.sourceDataListener);
    }

    eventEmitter.removeEventListener("setMapViewport", this.setMapViewport);
  }

  // This function gets called a lot, so we throttle it.
  setSlippyRoute = throttle(500, () => {
    if (this.props.isContentPanelVisible) {
      // Don't set the slippy route when we're at a url like /new or /page/xyz.
      return;
    }

    const { zoom, latitude, longitude } = this.state.mapViewport;
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
    const node = findDOMNode(this.props.mapContainerRef.current);
    if (node instanceof Element) {
      const containerDims = node.getBoundingClientRect();

      this.props.updateMapContainerDimensions({
        height: containerDims.height,
        width: containerDims.width,
      });
    } else {
      // eslint-disable-next-line no-console
      console.warn("resizemap: node is not element! node:", node);
    }
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

    if (this.props.placeFilters.length !== prevProps.placeFilters.length) {
      // Filters have been added or removed.
      this.applyFeatureFilters();
    }
  }

  parsePopupContent = (popupContent, properties) => {
    // Support a Handlebars-inspired syntax for injecting feature properties
    // into popup content.
    return popupContent.replace(/{{(\w+?)}}/gi, (...args) => {
      if (properties[args[1]]) {
        return properties[args[1]];
      } else {
        // eslint-disable-next-line no-console
        console.error(
          `Error: cannot find property ${args[1]} on feature for use on popup`,
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
    this.queriedFeatures = (this.map as Map).queryRenderedFeatures(evt.point);
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

  updateMapViewport = throttle(500, this.props.updateMapViewport);

  setMapViewport = (viewport: MapViewportDiff): void => {
    const scrollZoomAroundCenter = this.isMapTransitioning
      ? false
      : this.props.mapConfig.scrollZoomAroundCenter;
    const newMapViewport = mapViewportReducer(this.state.mapViewport, {
      type: UPDATE_VIEWPORT,
      payload: {
        viewport,
        scrollZoomAroundCenter,
      },
    });
    this.setState({
      mapViewport: newMapViewport,
    });
    this.updateMapViewport(newMapViewport);
    this.setSlippyRoute();
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
      <React.Fragment>
        <MapGL
          attributionControl={false}
          ref={this.mapRef}
          width={this.props.mapContainerDimensions.width}
          height={this.props.mapContainerDimensions.height}
          latitude={this.state.mapViewport.latitude}
          longitude={this.state.mapViewport.longitude}
          pitch={this.state.mapViewport.pitch}
          bearing={this.state.mapViewport.bearing}
          zoom={this.state.mapViewport.zoom}
          transitionDuration={this.state.mapViewport.transitionDuration}
          transitionInterpolator={transitionInterpolator}
          transitionEasing={this.state.mapViewport.transitionEasing}
          mapboxApiAccessToken={MAP_PROVIDER_TOKEN}
          minZoom={this.state.mapViewport.minZoom}
          maxZoom={this.state.mapViewport.maxZoom}
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

            // NOTE: the ViewState interface typings are missing width/height
            // properties:
            // https://github.com/DefinitelyTyped/DefinitelyTyped/blob/9e274b5be1609766d26ac3addfd14901dab658ba/types/react-map-gl/index.d.ts#L14-L21

            const { width, height, ...rest } = viewport as any;

            this.setMapViewport(rest);
          }}
          onTransitionStart={() => (this.isMapTransitioning = true)}
          onTransitionEnd={() => (this.isMapTransitioning = false)}
          interactiveLayerIds={this.props.interactiveLayerIds}
          mapStyle={this.props.mapStyle}
          onInteractionStateChange={this.onInteractionStateChange}
          onLoad={this.onMapLoad}
        >
          <MapMeasurementOverlay />
          {this.state.popupContent &&
            this.state.popupLatitude &&
            this.state.popupLongitude && (
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
          <MapCenterpoint
            isMapDraggingOrZooming={this.state.isMapDraggingOrZooming}
            isMapDraggedOrZoomed={this.props.isMapDraggedOrZoomed}
          />
          {this.state.isMapLoaded && <MapControls />}
        </MapGL>
        <MapWidgetContainer />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state): StateProps => ({
  activeEditPlaceId: activeEditPlaceIdSelector(state),
  filteredPlaces: filteredPlacesSelector(state),
  isContentPanelVisible: uiVisibilitySelector("contentPanel", state),
  interactiveLayerIds: interactiveLayerIdsSelector(state),
  mapConfig: mapConfigSelector(state),
  mapViewport: mapViewportSelector(state),
  mapContainerDimensions: mapContainerDimensionsSelector(state),
  mapLayerPopupSelector: layerId => mapLayerPopupSelector(layerId, state),
  mapStyle: mapStyleSelector(state),
  placeFilters: filtersSelector(state),
  datasets: datasetsSelector(state),
});

const mapDispatchToProps = {
  updateFeaturesInGeoJSONSource,
  updateLayers,
  updateMapContainerDimensions,
  updateMapViewport,
};

export default withRouter(
  connect<StateProps, DispatchProps, ParentProps>(
    mapStateToProps,
    mapDispatchToProps,
  )(MainMap),
);

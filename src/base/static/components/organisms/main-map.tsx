import * as React from "react";
import { findDOMNode } from "react-dom";
import { Map } from "mapbox-gl";
import { Feature, GeometryObject, Geometry, GeoJsonProperties } from "geojson";
import PropTypes from "prop-types";
import MapGL, { Popup, InteractiveMap } from "react-map-gl";
import { connect } from "react-redux";
import { throttle } from "throttle-debounce";
import { RouteComponentProps, withRouter } from "react-router";

import {
  interactiveLayerIdsSelector,
  mapStyleSelector,
  mapStylePropType,
  updateFeaturesInGeoJSONSource,
  updateLayers,
  updateMapContainerDimensions,
  mapContainerDimensionsSelector,
  mapLayerPopupSelector,
} from "../../state/ducks/map";
import { datasetsSelector, datasetsPropType } from "../../state/ducks/datasets";
import {
  mapConfigSelector,
  mapConfigPropType,
  MapViewport,
  MapSourcesLoadStatus,
} from "../../state/ducks/map-config";
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
import MapWidgetContainer from "../organisms/map-filter-slider-container";

import { Mixpanel } from "../../utils/mixpanel";

// TODO: remove this once we remove the Mapseed global:
declare const MAP_PROVIDER_TOKEN: string;

const statePropTypes = {
  activeEditPlaceId: PropTypes.number,
  filteredPlaces: placesPropType.isRequired,
  interactiveLayerIds: PropTypes.arrayOf(PropTypes.string.isRequired)
    .isRequired,
  isContentPanelVisible: PropTypes.bool.isRequired,
  isMapCenterpointVisible: PropTypes.bool.isRequired,
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

const dispatchPropTypes = {
  updateFeaturesInGeoJSONSource: PropTypes.func.isRequired,
  updateLayers: PropTypes.func.isRequired,
  updateMapContainerDimensions: PropTypes.func.isRequired,
};

type StateProps = PropTypes.InferProps<typeof statePropTypes>;
type DispatchProps = PropTypes.InferProps<typeof dispatchPropTypes>;
type ParentProps = {
  isMapDraggedOrZoomed: boolean;
  mapContainerWidthDeclaration: string;
  mapContainerHeightDeclaration: string;
  mapContainerRef: React.RefObject<HTMLElement>;
  onUpdateInitialMapViewport: Function;
  onUpdateMapViewport: Function;
  onUpdateMapDraggedOrZoomed: Function;
  onUpdateSpotlightMaskVisibility: Function;
  onUpdateSourceLoadStatus: Function;
  mapSourcesLoadStatus: MapSourcesLoadStatus;
  mapViewport: MapViewport;
};

type Props = StateProps & DispatchProps & ParentProps & RouteComponentProps<{}>;

interface State {
  isMapLoaded: boolean;
  isMapDraggingOrZooming: boolean;
  popupContent: string | null;
  popupLatitude: number | null;
  popupLongitude: number | null;
}

// TODO: make this a reusable Layer interface:
interface LayerFeature<
  G extends Geometry | null = Geometry,
  P = GeoJsonProperties
> extends Feature {
  layer: {
    id: string;
  };
}

class MainMap extends React.Component<Props, State> {
  state: State = {
    isMapLoaded: false,
    isMapDraggingOrZooming: false,
    popupContent: null,
    popupLatitude: null,
    popupLongitude: null,
  };

  private queriedFeatures: Array<LayerFeature<GeometryObject>> = [];
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

    window.addEventListener("resize", this.resizeMap);

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

    if (
      this.props.mapViewport.latitude !== prevProps.mapViewport.latitude ||
      this.props.mapViewport.longitude !== prevProps.mapViewport.longitude ||
      this.props.mapViewport.zoom !== prevProps.mapViewport.zoom
    ) {
      this.setSlippyRoute();
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

            // NOTE: the ViewState interface typings are missing width/height
            // properties:
            // https://github.com/DefinitelyTyped/DefinitelyTyped/blob/9e274b5be1609766d26ac3addfd14901dab658ba/types/react-map-gl/index.d.ts#L14-L21
            const { width, height, ...rest } = viewport as any;
            this.props.onUpdateMapViewport(
              rest,
              this.isMapTransitioning
                ? false
                : this.props.mapConfig.scrollZoomAroundCenter,
            );
          }}
          onTransitionStart={() => (this.isMapTransitioning = true)}
          onTransitionEnd={() => (this.isMapTransitioning = false)}
          interactiveLayerIds={this.props.interactiveLayerIds}
          mapStyle={this.props.mapStyle}
          onInteractionStateChange={this.onInteractionStateChange}
          onLoad={this.onMapLoad}
        >
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
          {this.props.isMapCenterpointVisible && (
            <MapCenterpoint
              isMapDraggingOrZooming={this.state.isMapDraggingOrZooming}
              isMapDraggedOrZoomed={this.props.isMapDraggedOrZoomed}
            />
          )}
          {this.state.isMapLoaded && (
            <MapControls onViewportChange={this.props.onUpdateMapViewport} />
          )}
        </MapGL>
        <MapWidgetContainer />
      </>
    );
  }
}

const mapStateToProps = (state): StateProps => ({
  activeEditPlaceId: activeEditPlaceIdSelector(state),
  filteredPlaces: filteredPlacesSelector(state),
  isContentPanelVisible: uiVisibilitySelector("contentPanel", state),
  isMapCenterpointVisible: uiVisibilitySelector("mapCenterpoint", state),
  interactiveLayerIds: interactiveLayerIdsSelector(state),
  mapConfig: mapConfigSelector(state),
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
};

export default withRouter(
  connect<StateProps, DispatchProps>(
    mapStateToProps,
    mapDispatchToProps,
  )(MainMap),
);

import React, { Component, createRef } from "react";
import PropTypes from "prop-types";
import MapGL, { NavigationControl } from "react-map-gl";
import { connect } from "react-redux";
import styled from "react-emotion";

import {
  interactiveLayerIdsSelector,
  mapDraggingSelector,
  mapStyleSelector,
  mapViewportSelector,
  mapViewportPropType,
  mapStylePropType,
  updateMapViewport,
  updateMapViewportFromReactMapGL,
  updateSourceLoadStatus,
  sourcesMetadataSelector,
  updateMapDragged,
  updateMapDragging,
} from "../../state/ducks/map";
import { mapConfigSelector } from "../../state/ducks/map-config";
import {
  leftSidebarConfigSelector,
  setLeftSidebarExpanded,
  setLeftSidebarComponent,
} from "../../state/ducks/left-sidebar";

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
  features = [];

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
    // status state if a new type of event is fired It's necessary to attach
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
      const loadStatus = this.map.isSourceLoaded(evt.sourceId)
        ? "loaded"
        : "loading";

      if (this.props.sourcesMetadata[evt.sourceId].loadStatus !== loadStatus) {
        this.props.updateSourceLoadStatus(evt.sourceId, loadStatus);
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onWindowResize);
  }

  onMouseDown = evt => {
    // Relying on react-map-gl's built-in onClick handler produces a noticeable
    // lag when clicking around Places on the map. It's not clear why, but we
    // get better performance by querying rendered features as soon as the
    // onMouseDown event fires, and using the onMouseUp handler to test if the
    // most recent queried feature is one we shoud route to (i.e. is a Place).
    //
    // Note that if no features are found in the query, an empty array is
    // returned.
    this.features = this.map.queryRenderedFeatures(evt.point);
  };

  onMouseUp = () => {
    if (
      !this.props.isMapDragging &&
      this.features.length &&
      this.features[0].properties &&
      this.features[0].properties._clientSlug
    ) {
      // If the topmost clicked-on feature has a _clientSlug property, there's
      // a good bet we've clicked on a Place. Assume we have and route to the
      // Place's detail view.
      this.props.router.navigate(
        `/${this.features[0].properties._clientSlug}/${this.features[0].id}`,
        { trigger: true },
      );
    }
  };

  onInteractionStateChange = evt => {
    if (evt.isDragging !== this.props.isMapDragging) {
      this.props.updateMapDragging(evt.isDragging);
      evt.isDragging && this.props.updateMapDragged(true);
    }
  };

  onMapLoad = () => {
    this.setState({
      isMapLoaded: true,
    });
  };

  render() {
    return (
      <MapGL
        ref={this.mapRef}
        mapOptions={this.props.mapConfig.options.mapOptions}
        width={this.props.mapViewport.width}
        height={this.props.mapViewport.height}
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
        onMouseUp={this.onMouseUp}
        onMouseDown={this.onMouseDown}
        onViewportChange={viewport =>
          this.props.updateMapViewportFromReactMapGL(viewport)
        }
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
    );
  }
}

MainMap.propTypes = {
  container: PropTypes.instanceOf(Element).isRequired,
  interactiveLayerIds: PropTypes.arrayOf(PropTypes.string).isRequired,
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
  mapConfig: PropTypes.object,
  mapStyle: mapStylePropType.isRequired,
  mapViewport: mapViewportPropType.isRequired,
  router: PropTypes.instanceOf(Backbone.Router),
  setLeftSidebarExpanded: PropTypes.func.isRequired,
  setLeftSidebarComponent: PropTypes.func.isRequired,
  sourcesMetadata: PropTypes.object.isRequired,
  updateMapDragged: PropTypes.func.isRequired,
  updateMapDragging: PropTypes.func.isRequired,
  updateMapViewport: PropTypes.func.isRequired,
  updateMapViewportFromReactMapGL: PropTypes.func.isRequired,
  updateSourceLoadStatus: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isMapDragging: mapDraggingSelector(state),
  leftSidebarConfig: leftSidebarConfigSelector(state),
  interactiveLayerIds: interactiveLayerIdsSelector(state),
  mapConfig: mapConfigSelector(state),
  mapViewport: mapViewportSelector(state),
  mapStyle: mapStyleSelector(state),
  sourcesMetadata: sourcesMetadataSelector(state),
});

const mapDispatchToProps = dispatch => ({
  setLeftSidebarExpanded: isExpanded =>
    dispatch(setLeftSidebarExpanded(isExpanded)),
  setLeftSidebarComponent: component =>
    dispatch(setLeftSidebarComponent(component)),
  updateMapDragged: isDragged => dispatch(updateMapDragged(isDragged)),
  updateMapDragging: isDragging => dispatch(updateMapDragging(isDragging)),
  updateMapViewport: viewport => dispatch(updateMapViewport(viewport)),
  updateMapViewportFromReactMapGL: viewport =>
    dispatch(updateMapViewportFromReactMapGL(viewport)),
  updateSourceLoadStatus: (sourceId, loadStatus) =>
    dispatch(updateSourceLoadStatus(sourceId, loadStatus)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MainMap);

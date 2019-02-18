import React, { Component, createRef } from "react";
import PropTypes from "prop-types";
import MapGL, { NavigationControl } from "react-map-gl";
import { connect } from "react-redux";
import styled from "react-emotion";

import {
  mapStyleSelector,
  mapViewportSelector,
  mapViewportPropType,
  mapStylePropType,
  updateMapViewport,
  updateSourceLoadStatus,
  sourcesMetadataSelector,
} from "../../state/ducks/map";
import { mapOptionsSelector } from "../../state/ducks/map-config";
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

  componentDidMount() {
    this.map = this.mapRef.current.getMap();

    // NOTE: MapboxGL fires many redundant loading events, so only update load
    // status state if a new type of event is fired, and if the target source 
    // is active on the map (i.e. is being consumed by at least one visible
    // layer).
    this.map.on("error", evt => {
      if (
        this.props.sourcesMetadata[evt.sourceId].isActive &&
        this.props.sourcesMetadata[evt.sourceId].loadStatus !== "error"
      ) {
        this.props.updateSourceLoadStatus(evt.sourceId, "error");
      }
    });

    this.map.on("sourcedata", evt => {
      if (!this.props.sourcesMetadata[evt.sourceId].isActive) {
        return;
      }

      const loadStatus = this.map.isSourceLoaded(evt.sourceId)
        ? "loaded"
        : "loading";

      if (this.props.sourcesMetadata[evt.sourceId].loadStatus !== loadStatus) {
        this.props.updateSourceLoadStatus(evt.sourceId, loadStatus);
      }
    });
  }

  onMapClick = () => {
    console.log("onMapClick");
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
        reuseMaps={true}
        mapOptions={this.props.mapOptions}
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
        onViewportChange={viewport => this.props.updateMapViewport(viewport)}
        mapStyle={this.props.mapStyle}
        onLoad={this.onMapLoad}
        onClick={this.onMapClick}
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
  mapStyle: mapStylePropType.isRequired,
  mapViewport: mapViewportPropType.isRequired,
  mapOptions: PropTypes.object,
  setLeftSidebarExpanded: PropTypes.func.isRequired,
  setLeftSidebarComponent: PropTypes.func.isRequired,
  sourcesMetadata: PropTypes.object.isRequired,
  updateMapViewport: PropTypes.func.isRequired,
  updateSourceLoadStatus: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  leftSidebarConfig: leftSidebarConfigSelector(state),
  mapOptions: mapOptionsSelector(state),
  mapViewport: mapViewportSelector(state),
  mapStyle: mapStyleSelector(state),
  sourcesMetadata: sourcesMetadataSelector(state),
});

const mapDispatchToProps = dispatch => ({
  setLeftSidebarExpanded: isExpanded =>
    dispatch(setLeftSidebarExpanded(isExpanded)),
  setLeftSidebarComponent: component =>
    dispatch(setLeftSidebarComponent(component)),
  updateMapViewport: viewport => dispatch(updateMapViewport(viewport)),
  updateSourceLoadStatus: (sourceId, loadStatus) =>
    dispatch(updateSourceLoadStatus(sourceId, loadStatus)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MainMap);

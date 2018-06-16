import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { leftSidebarPanelConfigSelector } from "../../state/ducks/left-sidebar-config";
import { mapConfigSelector } from "../../state/ducks/map-config";
import {
  toggleLayerVisibility,
  setBasemap,
  mapLayersSelector,
  mapBasemapSelector,
} from "../../state/ducks/map";
import { Header4, Header5 } from "../atoms/typography";
import { HorizontalRule } from "../atoms/misc";
import MapLayerSelector from "../molecules/map-layer-selector";

import "./map-layer-panel.scss";

const MapLayerPanel = props => {
  return (
    <div className="map-layer-panel">
      <Header4>{props.mapLayerPanelConfig.title}</Header4>
      {props.mapLayerPanelConfig.groupings &&
        props.mapLayerPanelConfig.groupings.map(grouping => (
          <div key={grouping.id}>
            <HorizontalRule />
            <div className="map-layer-panel__layer-group">
              <Header5>{grouping.title}</Header5>
              {grouping.layers.map(layer => {
                const isBasemap = !!props.mapConfig.layers.find(
                  layerConfig => layerConfig.id === layer.id,
                ).isBasemap;
                return (
                  <MapLayerSelector
                    key={layer.id}
                    type="layer"
                    group={grouping.id}
                    id={layer.id}
                    title={layer.title}
                    selected={
                      isBasemap
                        ? layer.id === props.visibleBasemapId
                        : props.visibleLayerIds.includes(layer.id)
                    }
                    onToggleLayer={layerId => {
                      if (isBasemap) {
                        props.setBasemap(layerId);
                      } else {
                        props.toggleLayerVisibility(layerId);
                      }
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
};

MapLayerPanel.propTypes = {
  mapConfig: PropTypes.shape({
    geolocation_enabled: PropTypes.bool.isRequired,
    layers: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        url: PropTypes.string,
        source: PropTypes.string,
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
  mapLayerPanelConfig: PropTypes.shape({
    id: PropTypes.string.isRequired,
    icon: PropTypes.string,
    component: PropTypes.string.isRequired,
    title: PropTypes.string,
    basemaps: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        visible_default: PropTypes.bool,
      }),
    ),
    groupings: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string,
        layers: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            visible_default: PropTypes.bool,
          }),
        ),
      }),
    ),
  }),
};

MapLayerPanel.defaultProps = {
  icon: "map-marker",
};

const mapStateToProps = state => ({
  mapLayerPanelConfig: leftSidebarPanelConfigSelector(state, "MapLayerPanel"),
  mapConfig: mapConfigSelector(state),
  visibleLayerIds: mapLayersSelector(state),
  visibleBasemapId: mapBasemapSelector(state),
});

const mapDispatchToProps = dispatch => ({
  toggleLayerVisibility: layerId => dispatch(toggleLayerVisibility(layerId)),
  setBasemap: layerId => dispatch(setBasemap(layerId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MapLayerPanel);

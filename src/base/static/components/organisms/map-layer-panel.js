import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { leftSidebarPanelConfigSelector } from "../../state/ducks/config";
import {
  setLayerVisibility,
  setBasemap,
  mapLayersBasemapSelector,
} from "../../state/ducks/map-layers";
import { Header4, Header5 } from "../atoms/typography";
import { HorizontalRule } from "../atoms/misc";
import MapLayerSelector from "../molecules/map-layer-selector";

import "./map-layer-panel.scss";

const MapLayerPanel = props => {
  const { leftSidebarConfigMapLayerPanel } = props;

  return (
    <div className="map-layer-panel">
      <Header4>{leftSidebarConfigMapLayerPanel.title}</Header4>
      <HorizontalRule />
      {leftSidebarConfigMapLayerPanel.basemaps && (
        <div className="map-layer-panel__basemaps-group">
          <Header5>Basemaps</Header5>
          {leftSidebarConfigMapLayerPanel.basemaps.map(basemap => (
            <MapLayerSelector
              key={basemap.id}
              type="basemap"
              group="basemaps"
              id={basemap.id}
              title={basemap.title}
              selected={props.visibleBasemap === basemap.id}
              onToggleLayer={props.onToggleLayer}
            />
          ))}
        </div>
      )}
      {leftSidebarConfigMapLayerPanel.groupings &&
        leftSidebarConfigMapLayerPanel.groupings.map(grouping => (
          <div key={grouping.id}>
            <HorizontalRule />
            <div className="map-layer-panel__layer-group">
              <Header5>{grouping.title}</Header5>
              {grouping.layers.map(layer => (
                <MapLayerSelector
                  key={layer.id}
                  type="layer"
                  group={grouping.id}
                  id={layer.id}
                  title={layer.title}
                  onToggleLayer={props.onToggleLayer}
                />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

MapLayerPanel.propTypes = {
  leftSidebarConfigMapLayerPanel: PropTypes.shape({
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
  onToggleLayer: PropTypes.func.isRequired,
};

MapLayerPanel.defaultProps = {
  icon: "map-marker",
};

const mapStateToProps = state => ({
  leftSidebarConfigMapLayerPanel: leftSidebarPanelConfigSelector(
    state,
    "MapLayerPanel",
  ),
  visibleBasemap: mapLayersBasemapSelector(state),
});

const mapDispatchToProps = dispatch => ({
  onToggleLayer: layerId => dispatch(setBasemap(layerId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MapLayerPanel);

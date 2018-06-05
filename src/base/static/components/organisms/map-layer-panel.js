import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { leftSidebarPanelConfigSelector } from "../../state/ducks/left-sidebar-config"
import { mapConfigSelector } from "../../state/ducks/map-config";
import {
  toggleLayerVisibility,
  setBasemap,
  mapLayersBasemapSelector,
} from "../../state/ducks/map-layers";
import { Header4, Header5 } from "../atoms/typography";
import { HorizontalRule } from "../atoms/misc";
import MapLayerSelector from "../molecules/map-layer-selector";

import "./map-layer-panel.scss";

const MapLayerPanel = props => {
  const { mapLayerPanel, mapConfig } = props;

  return (
    <div className="map-layer-panel">
      <Header4>{mapLayerPanel.title}</Header4>
      {mapLayerPanel.groupings &&
        mapLayerPanel.groupings.map(grouping => (
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
                  selected={
                    layer.isBasemap
                      ? layer.id === props.visibleBasemapId
                      : false /*props.visibleLayers.includes(layer.id)*/
                  }
                  onToggleLayer={layerId => {
                    if (layer.isBasemap) {
                      props.setBasemap(layerId);
                    } else {
                      props.toggleLayerVisibility(layerId);
                    }
                  }}
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
  mapLayerPanel: leftSidebarPanelConfigSelector(state, "MapLayerPanel"),
  mapConfig: mapConfigSelector(state),
  visibleBasemapId: mapLayersBasemapSelector(state),
});

const mapDispatchToProps = dispatch => ({
  toggleLayerVisibility: layerId => dispatch(toggleLayerVisibility(layerId)),
  setBasemap: layerId => dispatch(setBasemap(layerId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MapLayerPanel);

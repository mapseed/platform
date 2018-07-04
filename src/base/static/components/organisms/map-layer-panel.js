import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { leftSidebarPanelConfigSelector } from "../../state/ducks/left-sidebar-config";
import { Header4 } from "../atoms/typography";
import MapLayerGroup from "../molecules/map-layer-group";

import "./map-layer-panel.scss";

const MapLayerPanel = props => {
  return (
    <div className="map-layer-panel">
      <Header4>{props.mapLayerPanelConfig.title}</Header4>
      {props.mapLayerPanelConfig.groupings &&
        props.mapLayerPanelConfig.groupings.map(grouping => (
          <MapLayerGroup
            key={grouping.id}
            classes="map-layer-panel__layer-group"
            layers={grouping.layers}
            title={grouping.title}
          />
        ))}
    </div>
  );
};

MapLayerPanel.propTypes = {
  mapLayerPanelConfig: PropTypes.shape({
    id: PropTypes.string.isRequired,
    icon: PropTypes.string,
    component: PropTypes.string.isRequired,
    title: PropTypes.string,
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
  visibleBasemapId: PropTypes.string,
};

MapLayerPanel.defaultProps = {
  icon: "map-marker",
};

const mapStateToProps = state => ({
  mapLayerPanelConfig: leftSidebarPanelConfigSelector(state, "MapLayerPanel"),
});

export default connect(mapStateToProps)(MapLayerPanel);

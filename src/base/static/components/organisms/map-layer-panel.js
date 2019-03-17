import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { leftSidebarPanelConfigSelector } from "../../state/ducks/left-sidebar";
import { SmallTitle } from "../atoms/typography";
import MapLayerPanelSection from "../molecules/map-layer-panel-section";

import "./map-layer-panel.scss";

const MapLayerPanel = props => (
  <div className="map-layer-panel">
    <SmallTitle>{props.mapLayerPanelConfig.title}</SmallTitle>
    {props.mapLayerPanelConfig.content &&
      props.mapLayerPanelConfig.content.map(section => (
        <MapLayerPanelSection
          key={section.id}
          layerGroups={section.layerGroups}
          title={section.title}
        />
      ))}
  </div>
);

MapLayerPanel.propTypes = {
  mapLayerPanelConfig: PropTypes.shape({
    id: PropTypes.string.isRequired,
    component: PropTypes.string.isRequired,
    title: PropTypes.string,
    content: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string,
        layerGroups: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
          }),
        ),
      }),
    ),
  }),
  visibleBasemapId: PropTypes.string,
};

const mapStateToProps = state => ({
  mapLayerPanelConfig: leftSidebarPanelConfigSelector(state, "MapLayerPanel"),
});

export default connect(mapStateToProps)(MapLayerPanel);

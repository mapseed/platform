/** @jsx jsx */
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { translate } from "react-i18next";
import { jsx, css } from "@emotion/core";

import { leftSidebarPanelConfigSelector } from "../../state/ducks/left-sidebar";
import { SmallTitle } from "../atoms/typography";
import MapLayerPanelSection from "../molecules/map-layer-panel-section";

import "./map-layer-panel.scss";

const MapLayerPanel = props => (
  <div className="map-layer-panel">
    <SmallTitle
      css={css`
        margin-top: 0;
      `}
    >
      {props.t("mapLayerPanelTitle", props.mapLayerPanelConfig.title)}
    </SmallTitle>
    {props.mapLayerPanelConfig.content &&
      props.mapLayerPanelConfig.content.map(
        (section, layerPanelSectionIndex) => (
          <MapLayerPanelSection
            key={section.id}
            layerPanelSectionIndex={layerPanelSectionIndex}
            layerGroups={section.layerGroups}
            mapSourcesLoadStatus={props.mapSourcesLoadStatus}
            title={section.title}
          />
        ),
      )}
  </div>
);

MapLayerPanel.propTypes = {
  mapSourcesLoadStatus: PropTypes.object.isRequired,
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
  t: PropTypes.func.isRequired,
  visibleBasemapId: PropTypes.string,
};

const mapStateToProps = state => ({
  mapLayerPanelConfig: leftSidebarPanelConfigSelector(state, "MapLayerPanel"),
});

export default connect(mapStateToProps)(
  translate("MapLayerPanel")(MapLayerPanel),
);

/** @jsx jsx */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Spinner from "react-spinner";
import styled from "@emotion/styled";
import { translate } from "react-i18next";
import { jsx, css } from "@emotion/core";

import { InfoModalTrigger } from "../atoms/feedback";
import { FontAwesomeIcon } from "../atoms/imagery";
import { HorizontalRule } from "../atoms/layout";
import { TinyTitle } from "../atoms/typography";

import {
  sourcesMetadataSelector,
  sourcesMetadataPropType,
  layerGroupsSelector,
  layerGroupsPropType,
  updateLayerGroupVisibility,
} from "../../state/ducks/map";

const MapLayerSelectorContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  paddingLeft: "16px",
  paddingRight: "16px",
  marginBottom: "16px",
});

const SelectableArea = styled("span")({
  display: "flex",
  flex: 1,
  alignItems: "center",

  "&:hover": {
    cursor: "pointer",
  },
});

const LayerGroupsStatusContainer = styled("span")({
  display: "flex",
  alignItems: "center",
  width: "24px",
  height: "24px",
  marginLeft: "16px",
});

const SpinnerContainer = styled("div")({
  flex: 1,
  position: "relative",
  marginLeft: "8px",
});

const LayerGroupTitle = styled("span")(props => ({
  flex: 6,
  backgroundColor: props.isLayerGroupVisible ? "#ffff00" : "initial",
  fontFamily: props.theme.text.bodyFontFamily,

  "&:hover": {
    backgroundColor: props.isLayerGroupVisible ? "#ffff00" : "#ffffd4",
  },
}));

const LayerGroupStatusIcon = styled(props => (
  <FontAwesomeIcon
    className={props.className}
    faClassname={props.faClassname}
    color={props.color}
  />
))({
  marginLeft: "8px",
  textAlign: "center",
});

const InfoModalContainer = styled("span")({
  width: "16px",
  height: "16px",
});

const statusIcons = {
  loaded: "fa fa-check",
  error: "fa fa-times",
};

const statusColors = {
  loaded: "#22c722",
  error: "#ff0000",
};

const MapLayerSelector = props => {
  return (
    <MapLayerSelectorContainer>
      <SelectableArea onClick={props.onToggleLayerGroup}>
        <LayerGroupTitle isLayerGroupVisible={props.isLayerGroupVisible}>
          {props.t(
            `layerSelectorLayerGroupTitle${props.layerSelectorIndex}`,
            props.title,
          )}
        </LayerGroupTitle>
        <LayerGroupsStatusContainer>
          {props.isLayerGroupVisible &&
            props.loadStatus === "loading" && (
              <SpinnerContainer className="map-layer-status-spinner">
                <Spinner style={{ width: "20px", height: "20px" }} />
              </SpinnerContainer>
            )}
          {props.isLayerGroupVisible &&
            (props.loadStatus === "loaded" || props.loadStatus === "error") && (
              <LayerGroupStatusIcon
                faClassname={statusIcons[props.loadStatus]}
                color={statusColors[props.loadStatus]}
              />
            )}
        </LayerGroupsStatusContainer>
      </SelectableArea>
      {props.info && (
        <InfoModalContainer>
          <InfoModalTrigger
            modalContent={{
              header: props.info.header,
              body: props.info.body,
            }}
          />
        </InfoModalContainer>
      )}
    </MapLayerSelectorContainer>
  );
};

MapLayerSelector.propTypes = {
  isLayerGroupVisible: PropTypes.bool.isRequired,
  icon: PropTypes.string,
  layerSelectorIndex: PropTypes.string.isRequired,
  info: PropTypes.object,
  id: PropTypes.string.isRequired,
  loadStatus: PropTypes.string.isRequired,
  onToggleLayerGroup: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

MapLayerSelector.defaultProps = {
  type: "layer",
};

class MapLayerPanelSection extends Component {
  onToggleLayerGroup = layerGroup => {
    if (layerGroup.isBasemap && layerGroup.isVisible) {
      // Prevent toggling the current visible basemap.
      return;
    }

    this.props.updateLayerGroupVisibility(layerGroup.id, !layerGroup.isVisible);
  };

  render() {
    return (
      <div>
        <HorizontalRule spacing="tiny" />
        <TinyTitle
          css={css`
            margin-bottom: 16px;
          `}
        >
          {this.props.t(
            `mapLayerPanelSectionTitle${this.props.layerPanelSectionIndex}`,
            this.props.title,
          )}
        </TinyTitle>
        {this.props.layerGroupPanels.map((layerGroupPanel, layerGroupIndex) => {
          // Assume at first that all sources consumed by layers in this
          // layerGroup have loaded.
          let loadStatus = "loaded";
          const layerGroup = this.props.layerGroups.byId[layerGroupPanel.id];
          const sourcesStatus = layerGroup.sourceIds.map(
            sourceId =>
              this.props.mapSourcesLoadStatus[sourceId]
                ? this.props.mapSourcesLoadStatus[sourceId]
                : "unloaded",
          );

          if (sourcesStatus.includes("error")) {
            // If any source has an error, set the entire layerGroupPanel's
            // status to "error".
            loadStatus = "error";
          } else if (sourcesStatus.includes("loading")) {
            // Otherwise, if any source is still loading, set the entire
            // layerGroupPanel's status to "loading".
            loadStatus = "loading";
          }

          // Note that below `layerSelectorIndex` needs to be a unique
          // combination of the panel section index and the layer selector
          // index.
          return (
            <MapLayerSelector
              key={layerGroupPanel.id}
              id={layerGroupPanel.id}
              layerSelectorIndex={`${
                this.props.layerPanelSectionIndex
              }${layerGroupIndex}`}
              info={layerGroupPanel.info}
              title={layerGroupPanel.title}
              loadStatus={loadStatus}
              isLayerGroupVisible={layerGroup.isVisible}
              isSelected={true}
              onToggleLayerGroup={() => this.onToggleLayerGroup(layerGroup)}
              t={this.props.t}
            />
          );
        })}
      </div>
    );
  }
}

MapLayerPanelSection.propTypes = {
  layerPanelSectionIndex: PropTypes.number.isRequired,
  layerGroupPanels: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    }),
  ).isRequired,
  layerGroups: layerGroupsPropType.isRequired,
  mapSourcesLoadStatus: PropTypes.object.isRequired,
  sourcesMetadata: sourcesMetadataPropType.isRequired,
  t: PropTypes.func.isRequired,
  title: PropTypes.string,
  updateLayerGroupVisibility: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  layerGroups: layerGroupsSelector(state),
  sourcesMetadata: sourcesMetadataSelector(state),
});

const mapDispatchToProps = dispatch => ({
  updateLayerGroupVisibility: (layerGroupId, isVisible) =>
    dispatch(updateLayerGroupVisibility(layerGroupId, isVisible)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(translate("MapLayerPanelSection")(MapLayerPanelSection));

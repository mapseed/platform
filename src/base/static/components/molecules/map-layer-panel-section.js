import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Spinner from "react-spinner";
import styled from "react-emotion";

import { InfoModalTrigger } from "../atoms/feedback";
import { FontAwesomeIcon } from "../atoms/imagery";
import { HorizontalRule } from "../atoms/layout";
import { Header5 } from "../atoms/typography";

import { mapConfigSelector } from "../../state/ducks/map-config";
import { mapBasemapSelector } from "../../state/ducks/map";
import {
  sourcesMetadataSelector,
  layerGroupsMetadataSelector,
  updateLayerGroupVisibility,
} from "../../state/ducks/map-alt";

import "./map-layer-panel-section.css";

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
          {props.title}
        </LayerGroupTitle>
        <LayerGroupsStatusContainer>
          {props.isLayerGroupVisible &&
            props.loadStatus === "loading" && (
              <SpinnerContainer>
                <Spinner />
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
  info: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  loadStatus: PropTypes.string.isRequired,
  onToggleLayerGroup: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
};

MapLayerSelector.defaultProps = {
  info: {},
  type: "layer",
};

class MapLayerPanelSection extends Component {
  onToggleLayerGroup = (layerGroupId, layerGroupMetadata) => {
    this.props.updateLayerGroupVisibility(
      layerGroupId,
      !layerGroupMetadata.isVisible,
    );
  };

  render() {
    return (
      <div>
        <HorizontalRule spacing="tiny" />
        <Header5>{this.props.title}</Header5>
        {this.props.layerGroups.map(lg => {
          // Assume at first that all sources consumed by layers in this
          // layerGroup have loaded.
          let loadStatus = "loaded";
          const layerGroupMetadata = this.props.layerGroupsMetadata[lg.id];
          const sourcesStatus = layerGroupMetadata.sourceIds.map(
            sourceId =>
              this.props.sourcesMetadata[sourceId]
                ? this.props.sourcesMetadata[sourceId].loadStatus
                : "unloaded",
          );

          if (sourcesStatus.includes("error")) {
            // If any source has an error, set the entire layerGroup's status to
            // "error".
            loadStatus = "error";
          } else if (sourcesStatus.includes("loading")) {
            // Otherwise, if any source is still loading, set the entire
            // layerGroup's status to "loading".
            loadStatus = "loading";
          }

          return (
            <MapLayerSelector
              key={lg.id}
              id={lg.id}
              info={lg.info}
              title={lg.title}
              loadStatus={loadStatus}
              isLayerGroupVisible={
                this.props.layerGroupsMetadata[lg.id].isVisible
              }
              isSelected={true}
              onToggleLayerGroup={() =>
                this.onToggleLayerGroup(lg.id, layerGroupMetadata)
              }
            />
          );
        })}
      </div>
    );
  }
}

MapLayerPanelSection.propTypes = {
  mapConfig: PropTypes.shape({
    layerGroups: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        info: PropTypes.string,
      }),
    ),
  }),
  layerGroups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    }),
  ),
  layerGroupsMetadata: PropTypes.object.isRequired,
  sourcesMetadata: PropTypes.object.isRequired,
  title: PropTypes.string,
  updateLayerGroupVisibility: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  layerGroupsMetadata: layerGroupsMetadataSelector(state),
  mapConfig: mapConfigSelector(state),
  sourcesMetadata: sourcesMetadataSelector(state),
  visibleBasemapId: mapBasemapSelector(state),
});

const mapDispatchToProps = dispatch => ({
  updateLayerGroupVisibility: (layerGroupId, isVisible) =>
    dispatch(updateLayerGroupVisibility(layerGroupId, isVisible)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapLayerPanelSection);

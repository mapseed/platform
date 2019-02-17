import React from "react";
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
  sourcesStatusSelector,
  layerGroupsStatusSelector,
} from "../../state/ducks/map-alt";

import "./map-layer-panel-section.css";

const MapLayerSelectorContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  paddingLeft: "16px",
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
});

const SpinnerContainer = styled("div")({
  flex: 1,
  position: "relative",
  marginLeft: "8px",
});

const LayerGroupTitle = styled("span")(props => ({
  flex: 6,
  backgroundColor: props.isSelected ? "#ffff00" : "initial",

  "&:hover": {
    backgroundColor: props.isSelected ? "#ffff00" : "#ffffd4",
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
      <SelectableArea>
        <LayerGroupTitle isSelected={props.isSelected}>
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
  onToggleLayer: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
};

MapLayerSelector.defaultProps = {
  info: {},
  type: "layer",
};

const MapLayerPanelSection = props => {
  return (
    <div>
      <HorizontalRule spacing="tiny" />
      <Header5>{props.title}</Header5>
      {props.layerGroups.map(layerGroup => {
        // Assume at first that all sources consumed by layers in this
        // layerGroup have loaded.
        let loadStatus = "loaded";
        const sourcesStatus = props.layerGroupsStatus[
          layerGroup.id
        ].sourceIds.map(sourceId => props.sourcesStatus[sourceId]);

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
            key={layerGroup.id}
            id={layerGroup.id}
            info={layerGroup.info}
            title={layerGroup.title}
            loadStatus={loadStatus}
            isLayerGroupVisible={
              props.layerGroupsStatus[layerGroup.id].isVisible
            }
            isSelected={true}
            onToggleLayer={() => {}}
          />
        );
      })}
    </div>
  );
};

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
  layerGroupsStatus: PropTypes.object.isRequired,
  sourcesStatus: PropTypes.object.isRequired,
  title: PropTypes.string,
};

const mapStateToProps = state => ({
  layerGroupsStatus: layerGroupsStatusSelector(state),
  mapConfig: mapConfigSelector(state),
  sourcesStatus: sourcesStatusSelector(state),
  visibleBasemapId: mapBasemapSelector(state),
});

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapLayerPanelSection);

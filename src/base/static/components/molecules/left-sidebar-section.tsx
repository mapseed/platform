/** @jsx jsx */
import * as React from "react";
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
  layerGroupsSelector,
  updateLayerGroupVisibility,
  LayerGroups,
  SourcesMetadata,
} from "../../state/ducks/map";
import {
  LeftSidebarSection,
  LeftSidebarOption,
} from "../../state/ducks/left-sidebar";
import { MapSourcesLoadStatus } from "../../state/ducks/map-config";

const MapLayerSelectorContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  paddingLeft: "16px",
  paddingRight: "16px",
  marginBottom: "16px",
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
  loaded: "fas fa-check",
  error: "fas fa-times",
};

const statusColors = {
  loaded: "#22c722",
  error: "#ff0000",
};

type MapLayerSelectorProps = {
  isLayerGroupVisible: boolean;
  icon?: string;
  id: string;
  loadStatus: string;
  onToggleLayerGroup: any;
  isSelected: boolean;
  t: Function;
  option: LeftSidebarOption;
};

const OptionSelector: React.FunctionComponent<
  MapLayerSelectorProps
> = props => {
  return (
    <MapLayerSelectorContainer>
      <span
        css={{
          display: "flex",
          flex: 1,
          alignItems: "center",

          "&:hover": {
            cursor: "pointer",
          },
        }}
        onClick={props.onToggleLayerGroup}
      >
        <span
          css={theme => ({
            flex: 6,
            backgroundColor: props.isLayerGroupVisible ? "#ffff00" : "initial",
            fontFamily: theme.text.bodyFontFamily,

            "&:hover": {
              backgroundColor: props.isLayerGroupVisible
                ? "#ffff00"
                : "#ffffd4",
            },
          })}
        >
          {props.option.title}
        </span>
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
      </span>
      {props.option.info && (
        // TODO: refactor this to use ReactModal
        <InfoModalContainer>
          <InfoModalTrigger
            modalContent={{
              header: props.option.info.header,
              body: props.option.info.body,
            }}
          />
        </InfoModalContainer>
      )}
    </MapLayerSelectorContainer>
  );
};

type OwnProps = {
  section: LeftSidebarSection;
  mapSourcesLoadStatus: MapSourcesLoadStatus;
};

type StateProps = {
  layerGroups: LayerGroups;
  sourcesMetadata: SourcesMetadata;
};

type Props = {
  t: Function;
  updateLayerGroupVisibility: Function;
} & OwnProps &
  StateProps;

class LeftSidebarSectionSelector extends React.Component<Props> {
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
          {this.props.section.title}
        </TinyTitle>
        {this.props.section.options.map(option => {
          // Assume at first that all sources consumed by layers in this
          // layerGroup have loaded.
          let loadStatus = "loaded";
          const layerGroup = this.props.layerGroups.byId[option.layerGroupId];
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

          return (
            <OptionSelector
              key={option.layerGroupId}
              id={option.layerGroupId}
              option={option}
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

const mapStateToProps = (state: any, ownProps: OwnProps): StateProps => ({
  layerGroups: layerGroupsSelector(state),
  sourcesMetadata: sourcesMetadataSelector(state),
  ...ownProps,
});

const mapDispatchToProps = {
  updateLayerGroupVisibility,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(translate("MapLayerPanelSection")(LeftSidebarSectionSelector));

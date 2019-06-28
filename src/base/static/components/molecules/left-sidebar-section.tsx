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
  LayerGroup,
  Layer,
  layersSelector,
  updateLayer,
} from "../../state/ducks/map";
import {
  LeftSidebarSection,
  LeftSidebarOption,
} from "../../state/ducks/left-sidebar";
import { MapSourcesLoadStatus } from "../../state/ducks/map-config";
import {
  isSidebarOptionToggled,
  clearAndSetAggregator,
  toggleAggregator,
  hasNoAggregators,
} from "../../utils/map-style";

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
  loaded: "fa fa-check",
  error: "fa fa-times",
};

const statusColors = {
  loaded: "#22c722",
  error: "#ff0000",
};

type MapLayerSelectorProps = {
  isSidebarOptionToggled: boolean;
  icon?: string;
  loadStatus: string;
  onToggleOption: any;
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
        onClick={props.onToggleOption}
      >
        <span
          css={theme => ({
            flex: 6,
            backgroundColor: props.isSidebarOptionToggled
              ? "#ffff00"
              : "initial",
            fontFamily: theme.text.bodyFontFamily,

            "&:hover": {
              backgroundColor: props.isSidebarOptionToggled
                ? "#ffff00"
                : "#ffffd4",
            },
          })}
        >
          {props.option.title}
        </span>
        <LayerGroupsStatusContainer>
          {props.isSidebarOptionToggled &&
            props.loadStatus === "loading" && (
              <SpinnerContainer className="map-layer-status-spinner">
                <Spinner style={{ width: "20px", height: "20px" }} />
              </SpinnerContainer>
            )}
          {props.isSidebarOptionToggled &&
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
  layers: Layer[];
};

type Props = {
  t: Function;
  updateLayerGroupVisibility: Function;
  updateLayer: Function;
} & OwnProps &
  StateProps;

class LeftSidebarSectionSelector extends React.Component<Props> {
  onToggleOption = (
    option: LeftSidebarOption,
    layerGroup: LayerGroup,
    layers: Layer[],
  ) => {
    if (layerGroup.isBasemap && layerGroup.isVisible) {
      // Prevent toggling the current visible basemap.
      return;
    }

    if (!option.aggregationOptionId || !layerGroup.aggregationSelector) {
      this.props.updateLayerGroupVisibility(
        layerGroup.id,
        !layerGroup.isVisible,
      );
      return;
    }

    // Handle toggling of an "aggregation" option:

    // First query for the layer:
    const layerId = layerGroup.aggregationSelector.layerId;
    const layer = layers.find(layer => layer.id === layerId);

    // Then query for the aggretorOption:
    const aggregatorOption = layerGroup.aggregationSelector.options.find(
      aggregatorOption => aggregatorOption.id === option.aggregationOptionId,
    );
    if (layerGroup.isVisible) {
      const updatedLayer = toggleAggregator(
        layer!,
        aggregatorOption!,
        layerGroup,
      );

      if (hasNoAggregators(updatedLayer, layerGroup)) {
        // If visible, and our aggregator is the only one enabled, then turn off the entire layer:
        this.props.updateLayerGroupVisibility(
          layerGroup.id,
          !layerGroup.isVisible,
        );
      }
      // we need to update the layer after the LayerGroup is visible to avoid rendering a layer that has no categories:
      this.props.updateLayer(updatedLayer);
    } else {
      // If the layerGroup is invisible, make it visible, and set the aggregator
      // to be the only aggregator on the layer:
      this.props.updateLayer(
        clearAndSetAggregator(layer!, aggregatorOption!, layerGroup),
      );
      this.props.updateLayerGroupVisibility(
        layerGroup.id,
        !layerGroup.isVisible,
      );
    }
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
          const isToggled = isSidebarOptionToggled(
            option,
            layerGroup,
            this.props.layers,
          );
          return (
            <OptionSelector
              key={option.title}
              option={option}
              loadStatus={loadStatus}
              isSidebarOptionToggled={isToggled}
              isSelected={true}
              onToggleOption={() =>
                this.onToggleOption(option, layerGroup, this.props.layers)
              }
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
  layers: layersSelector(state),
  ...ownProps,
});

const mapDispatchToProps = {
  updateLayerGroupVisibility,
  updateLayer,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(translate("MapLayerPanelSection")(LeftSidebarSectionSelector));

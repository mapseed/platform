/** @jsx jsx */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { css, jsx } from "@emotion/core";
import { withTranslation } from "react-i18next";
import { getReadableColor } from "../../utils/color";

import InputFormCategorySelector from "./input-form-category-selector";
import InputForm from "../input-form";

import { placeConfigSelector } from "../../state/ducks/place-config";
import { hasGroupAbilitiesInDatasets } from "../../state/ducks/user";
import { hasAnonAbilitiesInDataset } from "../../state/ducks/datasets-config";
import { getCategoryConfig } from "../../utils/config-utils";
import { updateUIVisibility } from "../../state/ducks/ui";
import { datasetUrlSelector } from "../../state/ducks/datasets";
import { updateLayerGroupVisibility } from "../../state/ducks/map-style";

import { RegularText } from "../atoms/typography";

const alertBackground = "#ffc107"; // bright yellow-orange

class FormCategoryMenuWrapper extends Component {
  constructor(props) {
    super(props);
    this.visibleCategoryConfigs = this.props.placeConfig.place_detail.filter(
      config =>
        config.includeOnForm &&
        (this.props.hasAnonAbilitiesInDataset({
          abilities: ["create"],
          submissionSet: "places",
          datasetSlug: config.datasetSlug,
        }) ||
          this.props.hasGroupAbilitiesInDatasets({
            abilities: ["create"],
            submissionSet: "places",
            datasetSlugs: [config.datasetSlug],
          })),
    );

    if (this.visibleCategoryConfigs.length === 1) {
      const selectedCategoryConfig = getCategoryConfig(
        this.props.placeConfig,
        this.visibleCategoryConfigs[0].category,
      );

      this.state = {
        selectedCategory: this.visibleCategoryConfigs[0].category,
        isShowingCategorySelector: false,
        isSingleCategory: true,
        datasetUrl: this.props.datasetUrlSelector(
          selectedCategoryConfig.datasetSlug,
        ),
        datasetSlug: selectedCategoryConfig.datasetSlug,
      };
    } else {
      this.state = {
        selectedCategory: null,
        isShowingCategorySelector: true,
        isSingleCategory: false,
      };
    }
  }

  componentDidMount() {
    this.props.updateMapCenterpointVisibility(true);

    if (this.props.placeConfig.visibleLayerGroupIds) {
      this.props.placeConfig.visibleLayerGroupIds.forEach(layerGroupId =>
        this.props.updateLayerGroupVisibility(layerGroupId, true),
      );
    }
  }

  onCategoryChange = selectedCategory => {
    const categoryConfig = getCategoryConfig(
      this.props.placeConfig,
      selectedCategory,
    );

    this.setState({
      selectedCategory: selectedCategory,
      isShowingCategorySelector: !categoryConfig.multi_stage,
      datasetUrl: this.props.datasetUrlSelector(categoryConfig.datasetSlug),
      datasetSlug: categoryConfig.datasetSlug,
    });
  };

  render() {
    return (
      <>
        {this.state.isShowingCategorySelector && (
          <InputFormCategorySelector
            onCategoryChange={this.onCategoryChange.bind(this)}
            selectedCategory={this.state.selectedCategory}
            visibleCategoryConfigs={this.visibleCategoryConfigs}
          />
        )}
        {this.state.selectedCategory && (
          <InputForm
            contentPanelInnerContainerRef={
              this.props.contentPanelInnerContainerRef
            }
            selectedCategory={this.state.selectedCategory}
            datasetUrl={this.state.datasetUrl}
            datasetSlug={this.state.datasetSlug}
            isMapTransitioning={this.props.isMapTransitioning}
            isSingleCategory={this.state.isSingleCategory}
            onCategoryChange={this.onCategoryChange}
          />
        )}
      </>
    );
  }
}

FormCategoryMenuWrapper.propTypes = {
  contentPanelInnerContainerRef: PropTypes.object.isRequired,
  datasetUrlSelector: PropTypes.func.isRequired,
  hasAnonAbilitiesInDataset: PropTypes.func.isRequired,
  hasGroupAbilitiesInDatasets: PropTypes.func.isRequired,
  layout: PropTypes.string.isRequired,
  placeConfig: PropTypes.object.isRequired,
  customHooks: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.objectOf(PropTypes.func),
  ]),
  containers: PropTypes.instanceOf(NodeList),
  updateLayerGroupVisibility: PropTypes.func.isRequired,
  updateMapCenterpointVisibility: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  datasetUrlSelector: datasetSlug => datasetUrlSelector(state, datasetSlug),
  hasGroupAbilitiesInDatasets: ({ abilities, submissionSet, datasetSlugs }) =>
    hasGroupAbilitiesInDatasets({
      state,
      abilities,
      submissionSet,
      datasetSlugs,
    }),
  hasAnonAbilitiesInDataset: ({ abilities, submissionSet, datasetSlug }) =>
    hasAnonAbilitiesInDataset({ state, abilities, submissionSet, datasetSlug }),
  placeConfig: placeConfigSelector(state),
});

const mapDispatchToProps = dispatch => ({
  updateMapCenterpointVisibility: isVisible =>
    dispatch(updateUIVisibility("mapCenterpoint", isVisible)),
  updateLayerGroupVisibility: (layerGroupId, isVisible) =>
    dispatch(updateLayerGroupVisibility(layerGroupId, isVisible)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation("FormCategoryMenuWrapper")(FormCategoryMenuWrapper));

import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import styled from "react-emotion";
import { translate } from "react-i18next";

import InputFormCategorySelector from "./input-form-category-selector";

import { placeConfigSelector } from "../../state/ducks/place-config";
import { updateMapDragged, mapDraggedSelector } from "../../state/ducks/map";
import { hasGroupAbilitiesInDatasets } from "../../state/ducks/user";
import { hasAnonAbilitiesInDataset } from "../../state/ducks/datasets-config";
import { getCategoryConfig } from "../../utils/config-utils";

import { datasetUrlSelector } from "../../state/ducks/datasets";

const DragMapAlert = styled("div")({
  backgroundColor: "#ffc107",
  color: "#fff",
  border: "2px dotted #ffffff",
  borderRadius: "8px",
  padding: "8px",
  marginBottom: "8px",
  fontWeight: "800",
});

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
    this.props.updateMapDragged(false);
    this.props.showNewPin();
  }

  onCategoryChange(selectedCategory) {
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
  }

  render() {
    return (
      <div className="input-form-category-menu-container">
        {this.state.isShowingCategorySelector && (
          <Fragment>
            {!this.props.isMapDragged && (
              <DragMapAlert>{this.props.t("dragMapAlert")}</DragMapAlert>
            )}
            <InputFormCategorySelector
              onCategoryChange={this.onCategoryChange.bind(this)}
              selectedCategory={this.state.selectedCategory}
              visibleCategoryConfigs={this.visibleCategoryConfigs}
            />
          </Fragment>
        )}
        {this.state.selectedCategory
          ? this.props.render(
              this.state,
              this.props,
              this.onCategoryChange.bind(this),
            )
          : null}
      </div>
    );
  }
}

FormCategoryMenuWrapper.propTypes = {
  datasetUrlSelector: PropTypes.func.isRequired,
  hasAnonAbilitiesInDataset: PropTypes.func.isRequired,
  hasGroupAbilitiesInDatasets: PropTypes.func.isRequired,
  hideSpotlightMask: PropTypes.func.isRequired,
  showNewPin: PropTypes.func.isRequired,
  hideNewPin: PropTypes.func.isRequired,
  hidePanel: PropTypes.func.isRequired,
  placeConfig: PropTypes.object.isRequired,
  places: PropTypes.objectOf(PropTypes.instanceOf(Backbone.Collection)),
  router: PropTypes.instanceOf(Backbone.Router),
  customHooks: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.objectOf(PropTypes.func),
  ]),
  containers: PropTypes.instanceOf(NodeList),
  isMapDragged: PropTypes.bool.isRequired,
  render: PropTypes.func.isRequired,
  updateMapDragged: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  customComponents: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
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
  isMapDragged: mapDraggedSelector(state),
  placeConfig: placeConfigSelector(state),
});

const mapDispatchToProps = dispatch => ({
  updateMapDragged: isMapDragged => dispatch(updateMapDragged(isMapDragged)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(translate("FormCategoryMenuWrapper")(FormCategoryMenuWrapper));

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import InputFormCategoryButton from "./input-form-category-button";

import { hasGroupAbilitiesInDatasets } from "../../state/ducks/user";
import { hasAnonAbilitiesInDataset } from "../../state/ducks/datasets-config";

class InputFormCategorySelector extends Component {
  state = {
    isCollapsed: false,
  };

  setCategory(categoryName) {
    this.setState({
      isCollapsed: true,
    });
    this.props.onCategoryChange(categoryName);
  }

  render() {
    return (
      <div className="input-form__category-selector">
        {this.props.visibleCategoryConfigs.map(config => {
          const isSelected = this.props.selectedCategory === config.category;

          // NOTE: These permissions checks do not allow for the possibility
          // of controlling category visibility on a group-by-group basis,
          // though we may want to add that feature at some point.
          return (
            (this.props.hasAnonAbilitiesInDataset({
              abilities: ["create"],
              submissionSet: "places",
              datasetSlug: config.datasetSlug,
            }) ||
              this.props.hasGroupAbilitiesInDatasets({
                abilites: ["create"],
                submissionSet: "places",
                datasetSlugs: [config.datasetSlug],
              })) && (
              <InputFormCategoryButton
                isSelected={isSelected}
                isCategoryMenuCollapsed={this.state.isCollapsed}
                isSingleCategory={
                  this.props.visibleCategoryConfigs.length === 1
                }
                key={config.category}
                categoryName={config.category}
                onCategoryChange={evt => {
                  this.setCategory(evt.target.value, false);
                }}
                onExpandCategories={() => this.setState({ isCollapsed: false })}
              />
            )
          );
        })}
      </div>
    );
  }
}

InputFormCategorySelector.propTypes = {
  hasAnonAbilitiesInDataset: PropTypes.func.isRequired,
  hasGroupAbilitiesInDatasets: PropTypes.func.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  selectedCategory: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  visibleCategoryConfigs: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
  hasGroupAbilitiesInDatasets: ({ abilities, submissionSet, datasetSlugs }) =>
    hasGroupAbilitiesInDatasets({
      state,
      abilities,
      submissionSet,
      datasetSlugs,
    }),
  hasAnonAbilitiesInDataset: ({ abilities, submissionSet, datasetSlug }) =>
    hasAnonAbilitiesInDataset({ state, abilities, submissionSet, datasetSlug }),
});

export default connect(mapStateToProps)(InputFormCategorySelector);

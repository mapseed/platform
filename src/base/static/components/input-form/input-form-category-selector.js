import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import InputFormCategoryButton from "./input-form-category-button";

import { hasGroupAbilityInDataset } from "../../state/ducks/user";
import { hasAnonAbilityInDataset } from "../../state/ducks/datasets-config";

class InputFormCategorySelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isCollapsed: false,
    };
  }

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
            this.props.hasAnonAbilityInDataset({
              ability: "create",
              submissionSet: "places",
              datasetSlug: config.dataset_slug,
            }) ||
            (this.props.hasGroupAbilityInDataset({
              ability: "create",
              submissionSet: "places",
              datasetSlug: config.dataset_slug,
            }) && (
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
            ))
          );
        })}
      </div>
    );
  }
}

InputFormCategorySelector.propTypes = {
  hasAnonAbilityInDataset: PropTypes.func.isRequired,
  hasGroupAbilityInDataset: PropTypes.func.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  selectedCategory: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  visibleCategoryConfigs: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
  hasGroupAbilityInDataset: ({ ability, submissionSet, datasetSlug }) =>
    hasGroupAbilityInDataset({ state, ability, submissionSet, datasetSlug }),
  hasAnonAbilityInDataset: ({ ability, submissionSet, datasetSlug }) =>
    hasAnonAbilityInDataset({ state, ability, submissionSet, datasetSlug }),
});

export default connect(mapStateToProps)(InputFormCategorySelector);

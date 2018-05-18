import React, { Component } from "react";
import PropTypes from "prop-types";

import InputFormCategorySelector from "./input-form-category-selector";

import { place as placeConfig } from "config";
import { getCategoryConfig } from "../../utils/config-utils";

const Util = require("../../js/utils.js");

class FormCategoryMenuWrapper extends Component {
  constructor(props) {
    super(props);
    this.visibleCategoryConfigs = placeConfig.place_detail
      .filter(config => config.includeOnForm)
      .filter(config => {
        return !(
          config.admin_only &&
          !Util.getAdminStatus(config.dataset, config.admin_groups)
        );
      });
    this.state = {
      selectedCategory:
        this.visibleCategoryConfigs.length === 1
          ? this.visibleCategoryConfigs[0].category
          : null,
      isShowingCategorySelector: this.visibleCategoryConfigs.length !== 1,
      isSingleCategory: this.visibleCategoryConfigs.length === 1,
    };
  }

  onCategoryChange(selectedCategory) {
    this.setState({
      selectedCategory: selectedCategory,
      isShowingCategorySelector: !getCategoryConfig(selectedCategory)
        .multi_stage,
    });
  }

  render() {
    return (
      <div className="input-form-category-menu-container">
        {this.state.isShowingCategorySelector && (
          <InputFormCategorySelector
            onCategoryChange={this.onCategoryChange.bind(this)}
            selectedCategory={this.state.selectedCategory}
            visibleCategoryConfigs={this.visibleCategoryConfigs}
          />
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
  hideSpotlightMask: PropTypes.func.isRequired,
  hideCenterPoint: PropTypes.func.isRequired,
  showNewPin: PropTypes.func.isRequired,
  hideNewPin: PropTypes.func.isRequired,
  hidePanel: PropTypes.func.isRequired,
  places: PropTypes.objectOf(PropTypes.instanceOf(Backbone.Collection)),
  router: PropTypes.instanceOf(Backbone.Router),
  customHooks: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.objectOf(PropTypes.func),
  ]),
  container: PropTypes.instanceOf(HTMLElement),
  render: PropTypes.func.isRequired,
  customComponents: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
};

export default FormCategoryMenuWrapper;

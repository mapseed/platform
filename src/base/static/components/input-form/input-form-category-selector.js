import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import InputFormCategoryButton from "./input-form-category-button";

const Util = require("../../js/utils.js");

import "./input-form-category-selector.scss";

class InputFormCategorySelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isCollapsed: false,
      isHidden: false,
    };
  }

  componentWillMount() {
    this.visibleCategories = this.props.placeConfig.place_detail
      .filter(config => config.includeOnForm)
      .filter(config => {
        return !(
          config.admin_only &&
          !Util.getAdminStatus(config.dataset, config.admin_groups)
        );
      });

    if (this.visibleCategories.length === 1) {
      this.setCategory(this.visibleCategories[0].category, true);
    }
  }

  setCategory(categoryName, isSingleCategory) {
    this.setState({
      isCollapsed: true,
      isHidden: isSingleCategory,
    });
    this.props.onCategoryChange(categoryName);
  }

  render() {
    const cn = classNames("input-form__category-selector", {
      "input-form__category-selector--hidden": this.state.isHidden,
    });

    return (
      <div className={cn}>
        {this.visibleCategories.map(config => (
          <InputFormCategoryButton
            isActive={
              this.props.selectedCategoryConfig.category === config.category
            }
            isCategoryMenuCollapsed={this.state.isCollapsed}
            key={config.category}
            categoryConfig={config}
            onCategoryChange={evt => {
              this.setCategory(evt.target.value, false);
            }}
            onExpandCategories={() => this.setState({ isCollapsed: false })}
          />
        ))}
      </div>
    );
  }
}

InputFormCategorySelector.propTypes = {
  onCategoryChange: PropTypes.func.isRequired,
  placeConfig: PropTypes.object.isRequired,
  selectedCategoryConfig: PropTypes.object,
};

export default InputFormCategorySelector;

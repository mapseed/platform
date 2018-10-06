import React, { Component } from "react";
import PropTypes from "prop-types";

import InputFormCategoryButton from "./input-form-category-button";

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

          return (
            <InputFormCategoryButton
              isSelected={isSelected}
              isCategoryMenuCollapsed={this.state.isCollapsed}
              isSingleCategory={this.props.visibleCategoryConfigs.length === 1}
              key={config.category}
              categoryName={config.category}
              onCategoryChange={evt => {
                this.setCategory(evt.target.value, false);
              }}
              onExpandCategories={() => this.setState({ isCollapsed: false })}
            />
          );
        })}
      </div>
    );
  }
}

InputFormCategorySelector.propTypes = {
  onCategoryChange: PropTypes.func.isRequired,
  selectedCategory: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  visibleCategoryConfigs: PropTypes.array.isRequired,
};

export default InputFormCategorySelector;

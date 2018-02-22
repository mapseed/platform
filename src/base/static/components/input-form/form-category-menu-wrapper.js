import React, { Component } from "react";
import PropTypes from "prop-types";

import InputForm from "./";
import VVInputForm from "../vv-input-form";
import InputFormCategorySelector from "./input-form-category-selector";

class FormCategoryMenuWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categoryConfig: {},
      isFormResetting: false,
      renderCount: 0,
    };
  }

  onCategoryChange(selectedCategory, isFormResetting) {
    const config = this.props.placeConfig.place_detail.find(
      config => config.category === selectedCategory
    );
    const count = this.state.renderCount + 1;

    this.setState({
      categoryConfig: config,
      isFormResetting: isFormResetting,
      renderCount: count,
    });
  }

  render() {
    if (
      this.props.customComponents &&
      this.props.customComponents.InputForm === "VVInputForm"
    ) {
      return (
        <div className="input-form-category-menu-container">
          <InputFormCategorySelector
            onCategoryChange={this.onCategoryChange.bind(this)}
            selectedCategoryConfig={this.state.categoryConfig}
            placeConfig={this.props.placeConfig}
          />
          <VVInputForm
            {...this.props}
            onCategoryChange={this.onCategoryChange.bind(this)}
            categoryConfig={this.state.categoryConfig}
            isFormResetting={this.state.isFormResetting}
            autofillMode="hide"
            renderCount={this.state.renderCount}
          />
        </div>
      );
    } else {
      return (
        <div className="input-form-category-menu-container">
          <InputFormCategorySelector
            onCategoryChange={this.onCategoryChange.bind(this)}
            selectedCategoryConfig={this.state.categoryConfig}
            placeConfig={this.props.placeConfig}
          />
          <InputForm
            {...this.props}
            categoryConfig={this.state.categoryConfig}
            renderCount={this.state.renderCount}
          />
        </div>
      );
    }
  }
}

FormCategoryMenuWrapper.propTypes = {
  customComponents: PropTypes.object,
  placeConfig: PropTypes.object.isRequired,
};

export default FormCategoryMenuWrapper;

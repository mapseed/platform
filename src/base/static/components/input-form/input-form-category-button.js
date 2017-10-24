import React, { Component } from "react";
import cx from "bem-classnames";

import { LabelWithInlineImage } from "../ui-elements/label-with-inline-image";

const baseClass = "input-form-category-button";

class InputFormCategoryButton extends Component {

  constructor() {
    super(...arguments);
    this.classes = {
      expandCategoriesButton: {
        name: baseClass + "__expand-categories-button",
        modifiers: ["visibility"]
      },
      baseClass: {
        name: baseClass,
        modifiers: ["visibility"]
      }
    };
    this.state = {
      isActive: false
    };
  }

  onCategoryChange(evt) {
    this.props.onCategoryChange(evt);
  }

  componentWillReceiveProps() {
    this.setState({ isActive: this.props.isActive })
  }

  onClickExpandCategories(evt) {
    this.props.onExpandCategories();
  }

  getVisibility() {
    if (!this.props.categoryMenuIsCollapsed) {
      return true;
    } else if (this.props.isActive) {
      return true;
    }
    return false;
  }

  render() {
    return (
      <div className={cx(this.classes.baseClass, { visibility: (this.getVisibility()) ? "visible" : "hidden" })}>
        <input 
          id={this.props.categoryConfig.category}
          type="radio"
          name="input-form-category-buttons"
          value={this.props.categoryConfig.category}
          onChange={this.onCategoryChange.bind(this)} />
        <LabelWithInlineImage 
          labelText={this.props.categoryConfig.label}
          imageSrc={this.props.categoryConfig.icon_url} 
          imageAlignment="left"
          inputId={this.props.categoryConfig.category} />
        <span 
          className={cx(this.classes.expandCategoriesButton, { visibility: (this.props.isActive) ? "visible" : "hidden" })} 
          onClick={this.onClickExpandCategories.bind(this)}/>
      </div>
    );
  }
}

export { InputFormCategoryButton }

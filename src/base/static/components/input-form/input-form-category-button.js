import React, { Component } from "react";
const cn = require("classnames");

import "./input-form-category-button.scss";

class InputFormCategoryButton extends Component {

  constructor() {
    super();
    this.state = {
      isHoveringCategory: false,
      isHoveringExpandButton: false,
      isFocusedExpandButton: false
    }
    this.onMouseOverCategoryButton = this.onMouseOverCategoryButton.bind(this);
    this.onMouseOutCategoryButton = this.onMouseOutCategoryButton.bind(this);
    this.onMouseOverExpandButton = this.onMouseOverExpandButton.bind(this);
    this.onMouseOutExpandButton = this.onMouseOutExpandButton.bind(this);
    this.onFocusExpandButton = this.onFocusExpandButton.bind(this);
    this.onBlurExpandButton = this.onBlurExpandButton.bind(this);
  }

  onMouseOverCategoryButton() {
    this.setState({ isHoveringCategory: true });
  }

  onMouseOutCategoryButton() {
    this.setState({ isHoveringCategory: false });
  }

  onMouseOverExpandButton() {
    this.setState({ isHoveringExpandButton: true });
  }

  onMouseOutExpandButton() {
    this.setState({ isHoveringExpandButton: false });
  }

  onFocusExpandButton() {
    this.setState({ isFocusedExpandButton: true });
  }

  onBlurExpandButton() {
    this.setState({ isFocusedExpandButton: false });
  }

  render() {
    const { isFocusedExpandButton, isHoveringCategory, isHoveringExpandButton } = this.state;
    const { categoryConfig, isCategoryMenuCollapsed, isActive,
            onCategoryChange, onExpandCategories } = this.props;
    const isVisible = !isCategoryMenuCollapsed || isActive;
    const classNames = {
      base: cn("input-form-category-button", {
        "input-form-category-button--hovering": isHoveringCategory,
        "input-form-category-button--visible": isVisible,
        "input-form-category-button--hidden": !isVisible
      }),
      label: cn("input-form-category-button__label", {
        "input-form-category-button__label--active": isActive
      }),
      imageContainer: cn("input-form-category-button__image-container", {
        "input-form-category-button__image-container--active": isActive,
        "input-form-category-button__image-container--hovering": isHoveringCategory
      }),
      labelContainer: cn("input-form-category-button__label-text", {
        "input-form-category-button__label-text--active": isActive,
        "input-form-category-button__label-text--hovering": isHoveringCategory
      }),
      expandCategoriesButton: cn("input-form-category-button__expand-categories-button", {
        "input-form-category-button__expand-categories-button--visible": isActive,
        "input-form-category-button__expand-categories-button--hidden": !isActive,
        "input-form-category-button__expand-categories-button--hovering": isHoveringExpandButton,
        "input-form-category-button__expand-categories-button--focused": isFocusedExpandButton
      })
    };

    return (
      <div
        className={classNames.base}
        onMouseOver={this.onMouseOverCategoryButton}
        onMouseOut={this.onMouseOutCategoryButton}
      >
        <input
          className="input-form-category-button__input"
          checked={isActive}
          id={categoryConfig.category}
          type="radio"
          name="input-form-category-buttons"
          value={categoryConfig.category}
          onChange={onCategoryChange}
        />
        <label
          className={classNames.label}
          htmlFor={categoryConfig.category}
        >
          <span className={classNames.imageContainer}>
            <img
              className="input-form-category-button__image"
              src={categoryConfig.icon_url} 
            />
          </span>
          <span className={classNames.labelContainer}>
            {categoryConfig.label}
          </span>
        </label>
        <button
          className={classNames.expandCategoriesButton}
          type="button"
          onMouseOver={this.onMouseOverExpandButton}
          onMouseOut={this.onMouseOutExpandButton}
          onFocus={this.onFocusExpandButton}
          onBlur={this.onBlurExpandButton}
          onClick={onExpandCategories}
        />
      </div>
    );
  }

}

export default InputFormCategoryButton;

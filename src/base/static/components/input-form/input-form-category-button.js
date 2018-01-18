import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./input-form-category-button.scss";

class InputFormCategoryButton extends Component {
  constructor() {
    super();
    this.state = {
      isHoveringCategory: false,
      isHoveringExpandButton: false,
      isFocusedExpandButton: false,
    };
  }

  render() {
    const {
      isFocusedExpandButton,
      isHoveringCategory,
      isHoveringExpandButton,
    } = this.state;
    const {
      categoryConfig,
      isCategoryMenuCollapsed,
      isActive,
      onCategoryChange,
      onExpandCategories,
    } = this.props;
    const isVisible = !isCategoryMenuCollapsed || isActive;
    const cn = {
      base: classNames("input-form-category-button", {
        "input-form-category-button--hovering": isHoveringCategory,
        "input-form-category-button--hidden": !isVisible,
      }),
      label: classNames("input-form-category-button__label", {
        "input-form-category-button__label--active": isActive,
      }),
      imageContainer: classNames(
        "input-form-category-button__image-container",
        {
          "input-form-category-button__image-container--active": isActive,
          "input-form-category-button__image-container--hovering": isHoveringCategory,
        }
      ),
      labelContainer: classNames("input-form-category-button__label-text", {
        "input-form-category-button__label-text--active": isActive,
        "input-form-category-button__label-text--hovering": isHoveringCategory,
      }),
      expandCategoriesButton: classNames(
        "input-form-category-button__expand-categories-button",
        {
          "input-form-category-button__expand-categories-button--hidden": !isActive,
          "input-form-category-button__expand-categories-button--hovering": isHoveringExpandButton,
          "input-form-category-button__expand-categories-button--focused": isFocusedExpandButton,
        }
      ),
    };

    return (
      <div
        className={cn.base}
        onMouseOver={() => this.setState({ isHoveringCategory: true })}
        onMouseOut={() => this.setState({ isHoveringCategory: false })}
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
        <label className={cn.label} htmlFor={categoryConfig.category}>
          <span className={cn.imageContainer}>
            <img
              className="input-form-category-button__image"
              src={categoryConfig.icon_url}
            />
          </span>
          <span className={cn.labelContainer}>{categoryConfig.label}</span>
        </label>
        <button
          className={cn.expandCategoriesButton}
          type="button"
          onMouseOver={() => this.setState({ isHoveringExpandButton: true })}
          onMouseOut={() => this.setState({ isHoveringExpandButton: false })}
          onFocus={() => this.setState({ isFocusedExpandButton: true })}
          onBlur={() => this.setState({ isFocusedExpandButton: false })}
          onClick={onExpandCategories}
        />
      </div>
    );
  }
}

InputFormCategoryButton.propTypes = {
  isCategoryMenuCollapsed: PropTypes.bool.isRequired,
  isActive: PropTypes.bool.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  onExpandCategories: PropTypes.func.isRequired,
};

export default InputFormCategoryButton;

import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import { getCategoryConfig } from "../../utils/config-utils";
import "./input-form-category-button.scss";

const InputFormCategoryButton = props => {
  const cn = {
    base: classNames("input-form-category-button", {
      "input-form-category-button--hidden":
        props.isCategoryMenuCollapsed && !props.isSelected,
    }),
    imageContainer: classNames("input-form-category-button__image-container", {
      "input-form-category-button__image-container--active": props.isSelected,
    }),
    labelContainer: classNames("input-form-category-button__label-text", {
      "input-form-category-button__label-text--active": props.isSelected,
    }),
  };
  const categoryConfig = getCategoryConfig(props.categoryName);

  return (
    <div className={cn.base}>
      <input
        className="input-form-category-button__input"
        checked={props.isSelected}
        id={props.categoryName}
        type="radio"
        name="input-form-category-buttons"
        value={props.categoryName}
        onChange={props.onCategoryChange}
      />
      <label
        className={"input-form-category-button__label"}
        htmlFor={props.categoryName}
        onClick={() => {
          props.isCategoryMenuCollapsed && props.onExpandCategories();
        }}
      >
        <span className={cn.imageContainer}>
          <img
            className="input-form-category-button__image"
            src={categoryConfig.icon_url}
          />
        </span>
        <span className={cn.labelContainer}>{categoryConfig.label}</span>
      </label>
    </div>
  );
};

InputFormCategoryButton.propTypes = {
  categoryName: PropTypes.string.isRequired,
  isCategoryMenuCollapsed: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  isSingleCategory: PropTypes.bool.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  onExpandCategories: PropTypes.func.isRequired,
};

export default InputFormCategoryButton;

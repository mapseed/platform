/** @jsx jsx */
import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { css, jsx } from "@emotion/core";
import { connect } from "react-redux";
import { withTheme } from "emotion-theming";
import { translate } from "react-i18next";
import { getReadableColor } from "../../utils/color";

import { getCategoryConfig } from "../../utils/config-utils";
import { placeConfigSelector } from "../../state/ducks/place-config";
import { RegularText } from "../atoms/typography";

import "./input-form-category-button.scss";

const InputFormCategoryButton = props => {
  const cn = {
    base: classNames("input-form-category-button", {
      "input-form-category-button--hidden":
        props.isCategoryMenuCollapsed && !props.isSelected,
    }),
  };
  const categoryConfig = getCategoryConfig(
    props.placeConfig,
    props.categoryName,
  );

  return (
    <div className={cn.base}>
      <input
        css={css`
          display: none;
        `}
        checked={props.isSelected}
        id={props.categoryName}
        type="radio"
        name="input-form-category-buttons"
        value={props.categoryName}
        onChange={props.onCategoryChange}
      />
      <label
        css={css`
          display: flex;
          width: 100%;
          border: 2px solid #eee;
          border-radius: 6px;
          align-items: center;
          text-transform: uppercase;
          height: 55px;

          &:hover {
            cursor: pointer;
            border-color: ${props.theme.brand.primary};
          }
        `}
        htmlFor={props.categoryName}
        onClick={() => {
          props.isCategoryMenuCollapsed && props.onExpandCategories();
        }}
      >
        <span
          css={css`
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 100%;
            border-top-left-radius: 6px;
            border-bottom-left-radius: 6px;
            background-color: ${props.isSelected
              ? getReadableColor(props.theme.brand.primary)
              : "unset"};
          `}
        >
          <img
            className="input-form-category-button__image"
            src={categoryConfig.icon_url}
            alt={`image for ${categoryConfig.label}`}
          />
        </span>
        <RegularText
          css={css`
            display: flex;
            align-items: center;
            color: ${props.isSelected ? "#fff" : "initial"};
            padding-left: 16px;
            height: 100%;
            width: 100%;
            border-top-right-radius: 6px;
            border-bottom-right-radius: 6px;
            background-color: ${props.isSelected
              ? props.theme.brand.primary
              : "unset"};
          `}
        >
          {props.t(
            `inputFormCategorySelectorLabel${props.formCategoryIndex}`,
            categoryConfig.label,
          )}
        </RegularText>
      </label>
    </div>
  );
};

InputFormCategoryButton.propTypes = {
  categoryName: PropTypes.string.isRequired,
  formCategoryIndex: PropTypes.number.isRequired,
  isCategoryMenuCollapsed: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  isSingleCategory: PropTypes.bool.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  onExpandCategories: PropTypes.func.isRequired,
  placeConfig: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  placeConfig: placeConfigSelector(state),
});

export default withTheme(
  connect(mapStateToProps)(
    translate("InputFormCategoryButton")(InputFormCategoryButton),
  ),
);

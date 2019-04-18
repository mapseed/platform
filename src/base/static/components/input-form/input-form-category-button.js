/** @jsx jsx */
import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { css, jsx } from "@emotion/core";
import { connect } from "react-redux";
import { withTheme } from "emotion-theming";
import { lighten } from "@material-ui/core/styles/colorManipulator";

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
          border: 2px solid transparent;
          border-radius: 8px;
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
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
            background-color: ${props.isSelected
              ? lighten(props.theme.brand.primary, 0.9)
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
            border-top-right-radius: 8px;
            border-bottom-right-radius: 8px;
            background-color: ${props.isSelected
              ? props.theme.brand.primary
              : "unset"};
          `}
        >
          {categoryConfig.label}
        </RegularText>
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
  placeConfig: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  placeConfig: placeConfigSelector(state),
});

export default withTheme(connect(mapStateToProps)(InputFormCategoryButton));

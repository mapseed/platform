import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { translate } from "react-i18next";

import constants from "./constants";
import "./input-explorer-category-menu.scss";

const InputExplorerCategoryMenu = props => {
  const categoryNames = props.placeConfig
    .find(
      category => category.category === constants.COMMUNITY_INPUT_CATEGORY_NAME,
    )
    .fields.find(field => field.name === constants.INPUT_CATEGORY_FIELDNAME)
    .content;
  const cn = {
    summaryLabel: classNames("input-explorer-category-menu__label", {
      "input-explorer-category-menu__label--active":
        props.selectedCategory === "summary",
    }),
  };

  return (
    <div className="input-explorer-category-menu">
      <span>
        <input
          className="input-explorer-category-menu__input"
          type="radio"
          name="input-explorer-category-menu"
          id={"input-explorer-category-menu-summary"}
          value="summary"
          checked={props.selectedCategory === "summary"}
          onChange={props.onChange}
        />
        <label
          className={cn.summaryLabel}
          htmlFor={"input-explorer-category-menu-summary"}
        >
          {props.t("categorySummaryLabel")}
        </label>
      </span>
      {categoryNames.map(category => {
        const categoryLabelClassname = classNames(
          "input-explorer-category-menu__label",
          {
            "input-explorer-category-menu__label--active":
              props.selectedCategory === category.value,
          },
        );

        return (
          <span key={category.value}>
            <input
              className="input-explorer-category-menu__input"
              type="radio"
              name="input-explorer-category-menu"
              id={"input-explorer-category-menu-" + category.value}
              value={category.value}
              checked={props.selectedCategory === category.value}
              onChange={props.onChange}
            />
            <label
              className={categoryLabelClassname}
              htmlFor={"input-explorer-category-menu-" + category.value}
            >
              {category.label_plural}
            </label>
          </span>
        );
      })}
      <hr />
    </div>
  );
};

InputExplorerCategoryMenu.propTypes = {
  categorySummaryLabel: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeConfig: PropTypes.array.isRequired,
  selectedCategory: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

export default translate("InputExplorerCategoryMenu")(
  InputExplorerCategoryMenu,
);

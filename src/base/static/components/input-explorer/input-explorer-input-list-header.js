import React from "react";
import PropTypes from "prop-types";
const cn = require("classnames");

import messages from "./messages";
import "./input-explorer-input-list-header.scss";

const InputExplorerInputListHeader = props => {
  const classNames = {
    container: cn("input-explorer-input-list-header", {
      "input-explorer-input-list-header--visible": props.visibility,
    }),
    allLabel: cn("input-explorer-input-list-header__label", {
      "input-explorer-input-list-header__label--active":
        props.selectedSubcategory === "all",
    }),
  };

  return (
    <div className={classNames.container}>
      <h5 className="input-explorer-input-list-header__header">
        {messages("inputExplorer:inputListHeader")}
      </h5>
      <div className="input-explorer-input-list-header__subcategory-menu">
        <span>
          <input
            className="input-explorer-input-list-header__input"
            type="radio"
            name="input-explorer-subcategory-menu"
            id="input-explorer-subcategory-menu-all"
            value="all"
            checked={props.selectedSubcategory === "all"}
            onChange={props.onChange}
          />
          <label
            className={classNames.allLabel}
            htmlFor={"input-explorer-subcategory-menu-all"}
          >
            {messages("inputExplorer:subcategorySummaryLabel")}
          </label>
        </span>
        {props.subcategoryNames.map(subcategory => {
          const subcategoryLabelClassname = cn(
            "input-explorer-input-list-header__label",
            {
              "input-explorer-input-list-header__label--active":
                props.selectedSubcategory === subcategory.value,
            }
          );

          return (
            <span key={subcategory.value}>
              <input
                className="input-explorer-input-list-header__input"
                type="radio"
                name="input-explorer-subcategory-menu"
                id={"input-explorer-subcategory-menu-" + subcategory.value}
                value={subcategory.value}
                checked={props.selectedSubcategory === subcategory.value}
                onChange={props.onChange}
              />
              <label
                className={subcategoryLabelClassname}
                htmlFor={"input-explorer-subcategory-menu-" + subcategory.value}
              >
                {subcategory.label}
              </label>
            </span>
          );
        })}
      </div>
    </div>
  );
};

InputExplorerInputListHeader.propTypes = {
  onChange: PropTypes.func.isRequired,
  selectedSubcategory: PropTypes.string.isRequired,
  subcategoryNames: PropTypes.array.isRequired,
  visibility: PropTypes.bool.isRequired,
};

export default InputExplorerInputListHeader;

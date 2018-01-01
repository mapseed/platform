import React, { Component } from "react";
const cn = require("classnames");

import messages from "./messages";
import "./input-explorer-input-list-header.scss";

class InputExplorerInputListHeader extends Component {

  render() {
    const { onChange, selectedSubcategory, subcategoryNames, visibility } = this.props;
    const classNames = {
      container: cn("input-explorer-input-list-header", {
        "input-explorer-input-list-header--visible": visibility,
        "input-explorer-input-list-header--hidden": !visibility
      }),
      allLabel: cn("input-explorer-input-list-header__label", {
        "input-explorer-input-list-header__label--active": selectedSubcategory === "all"
      })
    };

    return (
      <div className={classNames.container}>
        <h5 className="input-explorer-input-list-header__header">
          {messages.inputListHeader}
        </h5>
        <div className="input-explorer-input-list-header__subcategory-menu">
          <span>
            <input
              className="input-explorer-input-list-header__input"
              type="radio"
              name="input-explorer-subcategory-menu"
              id="input-explorer-subcategory-menu-all"
              value="all"
              checked={selectedSubcategory === "all"}
              onChange={onChange}
            />
            <label
              className={classNames.allLabel}
              htmlFor={"input-explorer-subcategory-menu-all"}
            >
              {messages.subcategorySummaryLabel}
            </label>
          </span>
          {subcategoryNames.map(subcategory => {
            const subcategoryLabelClassname = cn("input-explorer-input-list-header__label", {
              "input-explorer-input-list-header__label--active": selectedSubcategory === subcategory.value
            });

            return (
              <span key={subcategory.value}>
                <input
                  className="input-explorer-input-list-header__input"
                  type="radio"
                  name="input-explorer-subcategory-menu"
                  id={"input-explorer-subcategory-menu-" + subcategory.value}
                  value={subcategory.value}
                  checked={selectedSubcategory === subcategory.value}
                  onChange={onChange}
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
  }

}

export default InputExplorerInputListHeader;

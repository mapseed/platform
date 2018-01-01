import React, { Component } from "react";
const cn = require("classnames");

import constants from "./constants";
import messages from "./messages";
import "./input-explorer-category-menu.scss";

class InputExplorerCategoryMenu extends Component {

  constructor(props) {
    super(props);
    this.categoryNames = this.props.placeConfig
      .find(category => category.category === constants.COMMUNITY_INPUT_CATEGORY_NAME).fields
      .find(field => field.name === constants.INPUT_CATEGORY_FIELDNAME).content;
  }

  render() {
    const { categorySummaryLabel, onChange, selectedCategory } = this.props;
    const classNames = {
      summaryLabel: cn("input-explorer-category-menu__label", {
        "input-explorer-category-menu__label--active": selectedCategory === "summary"
      })
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
            checked={selectedCategory === "summary"}
            onChange={onChange}
          />
          <label
            className={classNames.summaryLabel}
            htmlFor={"input-explorer-category-menu-summary"}
          >
            {messages.categorySummaryLabel}
          </label>
        </span>
        {this.categoryNames.map(category => {
          const categoryLabelClassname = cn("input-explorer-category-menu__label", {
            "input-explorer-category-menu__label--active": selectedCategory === category.value
          });

          return (
            <span key={category.value}>
              <input
                className="input-explorer-category-menu__input"
                type="radio"
                name="input-explorer-category-menu"
                id={"input-explorer-category-menu-" + category.value}
                value={category.value}
                checked={selectedCategory === category.value}
                onChange={onChange}
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
  }

}

export default InputExplorerCategoryMenu;

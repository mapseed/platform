// TODO: in-component localization!

import React, { Component } from "react";
import cx from "bem-classnames";

const baseClass = "mapseed-input-explorer-category-menu";

class InputExplorerCategoryMenu extends Component {

  constructor() {
    super(...arguments);
    this.classes = {
      inputSectionHeader: {
        name: baseClass + "__input-section-header"
      }
    };
    this.categoryNames = this.props.placeConfig
      .find(category => category.category === "community_input").fields
      .find(field => field.name === "input_category").content;
  }

  render() {

    return (
      <div className={baseClass}>
        <span>
          <input 
            type="radio" 
            name="input-explorer-category-menu" 
            id={"input-explorer-category-menu-summary"} 
            value="summary"
            checked={this.props.selectedCategory === "summary"} 
            onChange={this.props.onChange} />
          <label htmlFor={"input-explorer-category-menu-summary"}>
            Summary
          </label>
        </span>
        {this.categoryNames.map(category => 
          <span key={category.value}>
            <input 
              type="radio" 
              name="input-explorer-category-menu" 
              id={"input-explorer-category-menu-" + category.value} 
              value={category.value}
              checked={this.props.selectedCategory === category.value} 
              onChange={this.props.onChange} />
            <label htmlFor={"input-explorer-category-menu-" + category.value}>
              {category.label_plural}
            </label>
          </span>
        )}
        <hr />
      </div>
    );
  }
}

export default InputExplorerCategoryMenu;

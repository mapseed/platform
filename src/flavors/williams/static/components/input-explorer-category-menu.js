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

    this.categoryNames.unshift({
      label_plural: "Summary", // TODO: localization
      value: "summary"
    });
  }

  render() {

    return (
      <div className={baseClass}> 
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

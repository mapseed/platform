import React, { Component } from "react";
import cx from "bem-classnames";
import update from "react-addons-update";

import InputExplorerCategoryMenu from "../components/input-explorer-category-menu";
import InputExplorerInputListHeader from "../components/input-explorer-input-list-header";
import InputExplorerInputItem from "../components/input-explorer-input-item";

const baseClass = "mapseed-input-explorer";

class InputExplorer extends Component {

  constructor() {
    super(...arguments);
    this.subcategoryNames = this.props.placeConfig
      .find(category => category.category === "community_input").fields
      .find(field => field.name === "input_subcategory").content;

    // TODO: wait until collection syncs before accessing communityInput
    this.inputCategories = _.uniq(this.props.communityInput.pluck("input_category"));

    this.subcategoryNames.unshift({
      label: "All", // TODO: localization
      value: "all"
    });

    this.state = {
      selectedCategory: "recommendation",
      selectedSubcategories: ["all"]
    };
  }

  onCategoryFilterChange(evt) {
    this.setState({ selectedCategory: evt.target.value });
  }

  onSubcategoryFilterChange(evt) {
    let nextState;

    if (evt.target.value === "all") {

      // TODO: switch on all subcategories
    } else {
      if (evt.target.checked) {

        // Push the newly selected checkbox value onto our array of selected
        // checkbox values.
        nextState = update(
          this.state, {
            selectedSubcategories: {$push: [evt.target.value]}
          }
        );
      } else {

        // If a checkbox was unchecked, splice its value out of our array of
        // selected checkbox values.
        let index = this.state.selectedSubcategories
                      .findIndex(item => item === evt.target.value);

        nextState = update(
          this.state, {
            selectedSubcategories: {$splice: [[index, 1]]}
          }
        );
      }      
    }

    this.setState(nextState);
  }

  render() {
    let communityInputToRender = this.props.communityInput
      .where({input_category: this.state.selectedCategory})
      .filter((model) => {
        let returnVal = false;
        model.get("input_subcategory").forEach((subcategory) => {
          if (this.state.selectedSubcategories.includes(subcategory)) {
            returnVal = true;
          }
        });

        return returnVal;
      });

    return (
      <div className={baseClass}>
        <InputExplorerCategoryMenu 
          inputCategories={this.inputCategories} 
          selectedCategory={this.state.selectedCategory}
          placeConfig={this.props.placeConfig} 
          onChange={this.onCategoryFilterChange.bind(this)} />
        <InputExplorerInputListHeader 
          subcategoryNames={this.subcategoryNames} 
          selectedSubcategories={this.state.selectedSubcategories}
          onChange={this.onSubcategoryFilterChange.bind(this)} />
        {communityInputToRender.map(model => 
          <InputExplorerInputItem 
            key={model.id}
            inputText={model.get("input_text")} 
            subcategories={model.get("input_subcategory")}
            updatedDatetime={model.get("updated_datetime")} />
        )}
      </div>
    );
  }
}

export default InputExplorer;

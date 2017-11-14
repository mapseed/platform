import React, { Component } from "react";
import cx from "bem-classnames";
import update from "react-addons-update";

import InputExplorerCategoryMenu from "../components/input-explorer-category-menu";
import InputExplorerInputListHeader from "../components/input-explorer-input-list-header";
import InputExplorerInputItem from "../components/input-explorer-input-item";
import InputExplorerSummary from "../components/input-explorer-summary";

const Util = require("../../../../base/static/js/utils.js");

const baseClass = "mapseed-input-explorer";

const normalizeCheckboxData = function(data) {
  if (Array.isArray(data)) {
    return data;
  } else {
    return [data];
  }
}

class InputExplorer extends Component {

  constructor() {
    super(...arguments);
    this.subcategoryNames = this.props.placeConfig
      .find(category => category.category === "community_input").fields
      .find(field => field.name === "input_subcategory").content;

    // TODO: wait until collection syncs before accessing communityInput
    this.inputCategories = _.uniq(this.props.communityInput.pluck("input_category"));

    this.state = {
      selectedCategory: "recommendation",
      selectedSubcategory: "all"
    };
  }

  onCategoryFilterChange(evt) {
    this.setState({ selectedCategory: evt.target.value });
  }

  onSubcategoryFilterChange(evt) {
    this.setState({ selectedSubcategory: evt.target.value });
  }

  render() {
    let config = this.props.placeConfig.find(category => category.category === "community_input"),
        isAdmin = Util.getAdminStatus(config.dataset, config.admin_groups),
        communityInputToRender = this.props.communityInput
          // filter by main category
          .where({
            input_category: this.state.selectedCategory
          })
          // filter by subcategory
          .filter((model) => {
            if (this.state.selectedSubcategory === "all") {
              return true;
            }

            let inputSubcategory = normalizeCheckboxData(model.get("input_subcategory"));

            if (inputSubcategory.includes(this.state.selectedSubcategory)) {
              return true;
            }

            return false;
          })
          // sort by datetime
          .sort((a, b) => {
            if (a.get("created_datetime") < b.get("created_datetime")) {
              return 1;
            }
            if (a.get("created_datetime") > b.get("created_datetime")) {
              return -1;
            }
            return 0;
          })
          // sort by sticky state: sticky items on top
          .sort((a, b) => {
            if (a.get("is_sticky") && !b.get("is_sticky")) {
              return -1;
            }
            if (b.get("is_sticky") && !a.get("is_sticky")) {
              return 1;
            }
            return 0;
          });

    return (
      <div className={baseClass}>
        <InputExplorerCategoryMenu 
          inputCategories={this.inputCategories} 
          selectedCategory={this.state.selectedCategory}
          placeConfig={this.props.placeConfig} 
          onChange={this.onCategoryFilterChange.bind(this)} 
          visibility={(this.state.selectedCategory === "summary") ? false : true} />
        <InputExplorerSummary 
          headerMsg={this.props.appConfig.summary_page_header}
          communityInput={this.props.communityInput}
          subcategoryNames={this.subcategoryNames}
          visibility={(this.state.selectedCategory === "summary") ? true : false} />
        <InputExplorerInputListHeader 
          subcategoryNames={this.subcategoryNames} 
          selectedSubcategory={this.state.selectedSubcategory}
          onChange={this.onSubcategoryFilterChange.bind(this)} 
          visibility={(this.state.selectedCategory === "summary") ? false : true} />
        {communityInputToRender.map(model => 
          <InputExplorerInputItem 
            key={model.id}
            model={model}
            isAdmin={isAdmin}
            parent={this}
            inputText={model.get("input_text")} 
            subcategory={model.get("input_subcategory")}
            createdDatetime={model.get("created_datetime")} />
        )}
      </div>
    );
  }
}

export default InputExplorer;

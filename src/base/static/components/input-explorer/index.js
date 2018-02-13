import React, { Component } from "react";
import PropTypes from "prop-types";

import InputExplorerCategoryMenu from "./input-explorer-category-menu";
import InputExplorerInputListHeader from "./input-explorer-input-list-header";
import InputExplorerInputItem from "./input-explorer-input-item";
import InputExplorerSummary from "./input-explorer-summary";
import constants from "./constants";

const Util = require("../../js/utils.js");

const normalizeCheckboxData = data => {
  if (Array.isArray(data)) {
    return data;
  } else {
    return [data];
  }
};

class InputExplorer extends Component {
  constructor(props) {
    super(props);
    this.subcategoryNames = this.props.placeConfig
      .find(
        category =>
          category.category === constants.COMMUNITY_INPUT_CATEGORY_NAME
      )
      .fields.find(
        field => field.name === constants.INPUT_SUBCATEGORY_FIELDNAME
      ).content;

    // Get unique input category names.
    // TODO: Wait until collection syncs before accessing communityInput.
    this.props.communityInput
      .pluck(constants.INPUT_CATEGORY_FIELDNAME)
      .filter((value, idx, self) => self.indexOf(value) === idx);

    this.state = {
      selectedCategory: constants.INPUT_CATEGORY_SUMMARY_NAME,
      selectedSubcategory: constants.INPUT_SUBCATEGORY_SUMMARY_NAME,
    };

    this.onCategoryFilterChange = this.onCategoryFilterChange.bind(this);
    this.onSubcategoryFilterChange = this.onSubcategoryFilterChange.bind(this);
  }

  onCategoryFilterChange(evt) {
    this.setState({ selectedCategory: evt.target.value });
  }

  onSubcategoryFilterChange(evt) {
    this.setState({ selectedSubcategory: evt.target.value });
  }

  render() {
    const { selectedCategory, selectedSubcategory } = this.state;
    const { communityInput, placeConfig } = this.props;
    const config = placeConfig.find(
      category => category.category === constants.COMMUNITY_INPUT_CATEGORY_NAME
    );
    const isAdmin = Util.getAdminStatus(config.dataset, config.admin_groups);
    const communityInputToRender = communityInput
      // filter by main category
      .where({
        [constants.INPUT_CATEGORY_FIELDNAME]: selectedCategory,
      })
      // filter by subcategory
      .filter(model => {
        if (selectedSubcategory === constants.INPUT_SUBCATEGORY_SUMMARY_NAME) {
          return true;
        }

        let inputSubcategory = normalizeCheckboxData(
          model.get(constants.INPUT_SUBCATEGORY_FIELDNAME)
        );

        if (inputSubcategory.includes(selectedSubcategory)) {
          return true;
        }

        return false;
      })
      // sort by datetime
      .sort((a, b) => {
        if (
          a.get(constants.CREATED_DATETIME_FIELDNAME) <
          b.get(constants.CREATED_DATETIME_FIELDNAME)
        ) {
          return 1;
        }
        if (
          a.get(constants.CREATED_DATETIME_FIELDNAME) >
          b.get(constants.CREATED_DATETIME_FIELDNAME)
        ) {
          return -1;
        }
        return 0;
      })
      // sort by sticky state: sticky items on top
      .sort((a, b) => {
        if (
          a.get(constants.IS_STICKY_FIELDNAME) &&
          !b.get(constants.IS_STICKY_FIELDNAME)
        ) {
          return -1;
        }
        if (
          b.get(constants.IS_STICKY_FIELDNAME) &&
          !a.get(constants.IS_STICKY_FIELDNAME)
        ) {
          return 1;
        }
        return 0;
      });

    return (
      <div className="input-explorer">
        <InputExplorerCategoryMenu
          inputCategories={this.inputCategories}
          selectedCategory={selectedCategory}
          placeConfig={placeConfig}
          onChange={this.onCategoryFilterChange}
          visibility={
            selectedCategory === constants.INPUT_CATEGORY_SUMMARY_NAME
              ? false
              : true
          }
        />
        <InputExplorerSummary
          headerMsg={this.props.appConfig.summary_page_header}
          communityInput={this.props.communityInput}
          subcategoryNames={this.subcategoryNames}
          visibility={
            selectedCategory === constants.INPUT_CATEGORY_SUMMARY_NAME
              ? true
              : false
          }
        />
        <InputExplorerInputListHeader
          subcategoryNames={this.subcategoryNames}
          selectedSubcategory={selectedSubcategory}
          onChange={this.onSubcategoryFilterChange}
          visibility={
            selectedCategory === constants.INPUT_CATEGORY_SUMMARY_NAME
              ? false
              : true
          }
        />
        {communityInputToRender.map(model => (
          <InputExplorerInputItem
            key={model.id}
            model={model}
            isAdmin={isAdmin}
            parent={this}
            inputText={model.get(constants.INPUT_TEXT_FIELDNAME)}
            subcategory={model.get(constants.INPUT_SUBCATEGORY_FIELDNAME)}
            createdDatetime={model.get(constants.CREATED_DATETIME_FIELDNAME)}
          />
        ))}
      </div>
    );
  }
}

InputExplorer.propTypes = {
  appConfig: PropTypes.object.isRequired,
  communityInput: PropTypes.object.isRequired,
  placeConfig: PropTypes.array.isRequired,
};

export default InputExplorer;

import React, { Component } from "react";
const cn = require("classnames");

import constants from "./constants";
import messages from "./messages";
import "./input-explorer-summary.scss";

class InputExplorerSummary extends Component {

  render() {
    const { communityInput, headerMsg, subcategoryNames, visibility } = this.props;
    const numRecommendations = communityInput
      .where({ [constants.INPUT_CATEGORY_FIELDNAME]: constants.RECOMMENDATION_CATEGORY_NAME })
      .length;
    const numConcerns = communityInput
      .where({ [constants.INPUT_CATEGORY_FIELDNAME]: constants.CONCERN_CATEGORY_NAME })
      .length;
    const classNames = {
      container: cn("input-explorer-summary", {
        "input-explorer-summary--visible": visibility,
        "input-explorer-summary--hidden": !visibility
      })
    };
    
    let numTotal = 0;
    let summaryInfoBySubcategory = [];

    subcategoryNames.forEach(subcategory => {
      let info = {};
      let modelsFilteredBySubcategory = communityInput.filter(model => {
        let inputSubcategory = model.get(constants.INPUT_SUBCATEGORY_FIELDNAME);

        // there might be a single string subcategory, or an array of subcategories
        if (Array.isArray(inputSubcategory)) {
          return inputSubcategory.includes(subcategory.value);
        } else {
          return inputSubcategory === subcategory.value;
        }
      });

      modelsFilteredBySubcategory = new Backbone.Collection(modelsFilteredBySubcategory);
      info["total"] = modelsFilteredBySubcategory.length
      info["label"] = subcategory.label;
      info["numRecommendations"] = modelsFilteredBySubcategory.where({ 
        [constants.INPUT_CATEGORY_FIELDNAME]: constants.RECOMMENDATION_CATEGORY_NAME
      }).length;
      info["numConcerns"] = modelsFilteredBySubcategory.where({ 
        [constants.INPUT_CATEGORY_FIELDNAME]: constants.CONCERN_CATEGORY_NAME
      }).length;

      summaryInfoBySubcategory.push(info);
      numTotal += info["total"];
    });

    summaryInfoBySubcategory.sort((a, b) => {
      if (a.total < b.total) {
        return 1;
      }
      if (a.total > b.total) {
        return -1;
      }
      return 0;
    });

    // unitWidth is the percentage width of a single response, based on the
    // subcategory with the most responses
    const unitWidth = 100/summaryInfoBySubcategory[0].total;

    return (
      <div className={classNames.container}>
        <h5 className="input-explorer-summary__summary-quote">
          {headerMsg}
        </h5>
        <div className="input-explorer-summary__summary-box">
          <div className="input-explorer-summary__summary-header">
            <span className="input-explorer-summary__summary-total-items-header">
              {numRecommendations + numConcerns} Community comments submitted
            </span>
            <span className="input-explorer-summary__num-recommendations">
              {numRecommendations} {messages.recommendationsLabel}
            </span>
            <span className="input-explorer-summary__num-concerns">
              {numConcerns} {messages.concernsLabel}
            </span>
          </div>
          {summaryInfoBySubcategory.map((subcategory, i) =>
            <div
              key={i}
              className="input-explorer-summary__summary-item-container"
            >
              <div className="input-explorer-summary__summary-bar-label-container">
                <span className="input-explorer-summary__summary-bar-label">
                  {subcategory.label + " "}
                </span>
                <span className="input-explorer-summary__summary-bar-label-percentage">
                  {isNaN(parseInt(subcategory.total/numTotal*100)) ? 0 : parseInt(subcategory.total/numTotal*100)}%
                </span>
              </div>
              <div className="input-explorer-summary__summary-bar-container">
                <div
                  className="input-explorer-summary__summary-bar-recommendations"
                  style={{
                    width: subcategory.numRecommendations*unitWidth + "%"
                  }}
                >
                </div>
                <div
                  className="input-explorer-summary__summary-bar-concerns"
                  style={{
                    width: subcategory.numConcerns*unitWidth + "%"
                  }}
                >
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

}

export default InputExplorerSummary;

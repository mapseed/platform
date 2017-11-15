import React, { Component } from "react";
import cx from "bem-classnames";

const baseClass = "mapseed-input-explorer-summary";

class InputExplorerSummary extends Component {

  constructor() {
    super(...arguments);
    this.classes = {
      base: {
        name: baseClass,
        modifiers: ["visibility"]
      },
      numRecommendations: {
        name: baseClass + "__num-recommendations"
      },
      numConcerns: {
        name: baseClass + "__num-concerns"
      }
    }
  }

  render() {
    let numRecommendations = this.props.communityInput
          .where({ input_category: "recommendation" })
          .length,
        numConcerns = this.props.communityInput
          .where({ input_category: "concern" })
          .length,
        numTotal = this.props.communityInput.length;

    let summaryInfoBySubcategory = [];

    this.props.subcategoryNames.forEach((subcategory) => {
      let info = {};

      info["total"] = this.props.communityInput.where({
        input_subcategory: subcategory.value
      }).length;
      info["label"] = subcategory.label;
      info["numRecommendations"] = this.props.communityInput.where({ 
        input_category: "recommendation",
        input_subcategory: subcategory.value
      }).length;
      info["numConcerns"] = this.props.communityInput.where({ 
        input_category: "concern",
        input_subcategory: subcategory.value
      }).length;

      summaryInfoBySubcategory.push(info);
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
    let unitWidth = 100/summaryInfoBySubcategory[0].total;

    return (
      <div className={cx(this.classes.base, { visibility: (this.props.visibility) ? "visible" : "hidden" })}>
        <h5 className="summary-quote">{this.props.headerMsg}</h5>
        <div className="summary-box">
          <div className="summary-header">
            <span className="summary-total-items-header">{numRecommendations + numConcerns} Community comments submitted</span>
            <span className={cx(this.classes.numRecommendations)}>{numRecommendations} Recommendations</span>
            <span className={cx(this.classes.numConcerns)}>{numConcerns} Concerns</span>
          </div>
          {summaryInfoBySubcategory.map((subcategory, i) => 
            <div
              key={i} 
              className="summary-item-container">
              <div className="summary-bar-label">
                <span className="summary-bar-label__label">{subcategory.label} </span>
                <span className="summary-bar-label__percentage">{parseInt(subcategory.total/numTotal*100)}%</span>
              </div>
              <div className="summary-bar-container">
                <div 
                  className="summary-bar-recommendations"
                  style={{
                    width: subcategory.numRecommendations*unitWidth + "%"
                  }}>
                </div>
                <div 
                  className="summary-bar-concerns"
                  style={{
                    width: subcategory.numConcerns*unitWidth + "%"
                  }}>
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

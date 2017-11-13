import React, { Component } from "react";
import cx from "bem-classnames";

const baseClass = "mapseed-input-explorer-input-item";

class InputExplorerInputItem extends Component {

  constructor() {
    super(...arguments);
    this.state = {

    };
    this.classes = {
      responseText: {
        name: baseClass + "__response-text"
      },
      responseTime: {
        name: baseClass + "__response-time"
      },
      subcatgories: {
        name: baseClass + "__subcategory"
      }
    };
  }

  render() {

    return (
      <div className={baseClass}>
        <p className={cx(this.classes.responseText)}>{this.props.inputText}</p>
        <p className={cx(this.classes.responseTime)}>{moment(this.props.updatedDatetime).format('MMMM Do YYYY, h:mm a')}</p>
        {this.props.subcategories.map(subcategory => 
          <span
            key={subcategory} 
            className={cx(this.classes.subcatgories)}>{subcategory}</span>
        )}
      </div>
    );
  }
}

export default InputExplorerInputItem;

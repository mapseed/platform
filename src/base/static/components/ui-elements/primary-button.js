import React, { Component } from "react";
const cn = require("classnames");

import "./primary-button.scss";

class PrimaryButton extends Component {

  render() {
    const { className, children, disabled } = this.props;
    const classNames = cn("primary-button", "primary-button--hoverable", className);

    return (
      <button 
        className={classNames}
        type="button"
        disabled={disabled}>
        {children}
      </button>
    );
  }

}

export default PrimaryButton;

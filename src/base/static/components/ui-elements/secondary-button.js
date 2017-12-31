import React, { Component } from "react";
const cn = require("classnames");

import "./secondary-button.scss";

class SecondaryButton extends Component {

  render() {
    const { children, className, onClick } = this.props;
    const classNames = cn("secondary-button", className);

    return (
      <button
        className={classNames} 
        type="button"
        onClick={onClick}>
        {children}
      </button>
    );
  }

}

export default SecondaryButton;

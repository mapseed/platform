import React, { Component } from "react";
const cn = require("classnames");

import "./submit-field.scss";

class SubmitField extends Component {

  render() {
    const { disabled, id, name, usageContext, value } = this.props;
    const classNames = cn("submit-field", {
      "submit-field--primary-button-context": usageContext === "PrimaryButton"
    });

    return (
      <input
        className={classNames}
        type="submit"
        id={id}
        name={name}
        value={value} 
        disabled={disabled} 
      />
    );
  }

};

export default SubmitField;

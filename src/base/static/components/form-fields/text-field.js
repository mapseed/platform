import React, { Component } from "react";
const cn = require("classnames");

import "./text-field.scss";

class TextField extends Component {

  render() {

    const { hasAutofill, name, onChange, placeholder, required, value } = this.props;
    const classNames = cn("mapseed-text-field", {
        "mapseed-file-field__label--has-autofill": hasAutofill
      });

    return (
      <input 
        className={classNames}
        name={name}
        type="text"
        value={value}
        placeholder={placeholder} 
        required={required} 
        onChange={onChange} />
    );
  }
};

export default TextField;

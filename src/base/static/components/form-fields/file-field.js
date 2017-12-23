import React, { Component } from "react";
const cn = require("classnames");

import "./file-field.scss";

class FileField extends Component {

  render() {

    const { label, name, onChange, required, value } = this.props;
    const classNames = {
        input: cn("mapseed-file-field__input", "mapseed-file-field__input--hidden"),
        label: cn("mapseed-file-field__label", "mapseed-file-field__label--hoverable")
      };

    return (
      <div className="mapseed-file-field">
        <input 
          className={classNames.input}
          type="file"
          id={name}
          name={name}
          value={value}
          required={required} 
          onChange={onChange} />
        <label 
          className={classNames.label}
          htmlFor={name}>
          {label}
        </label>
      </div>
    );
  }

};

export default FileField;

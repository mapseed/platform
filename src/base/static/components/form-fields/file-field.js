import React, { Component } from "react";
const cn = require("classnames");

import "./file-field.scss";

class FileField extends Component {

  render() {
    const { accept, label, name, onChange, required, value } = this.props;
    const classNames = {
      input: cn("file-field__input", "file-field__input--hidden"),
      label: cn("file-field__label", "file-field__label--hoverable")
    };

    return (
      <div className="file-field">
        <input
          className={classNames.input}
          type="file"
          id={name}
          name={name}
          value={value}
          required={required}
          onChange={onChange}
          accept={accept}
        />
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

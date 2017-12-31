import React, { Component } from "react";

import "./textarea-field.scss";

class TextareaField extends Component {

  render() {
    const { name, onChange, placeholder, required, value } = this.props;

    return (
      <textarea
        className="textarea-field"
        name={name}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={onChange}
      />
    );
  }

};

export default TextareaField;

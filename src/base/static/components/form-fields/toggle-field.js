import React, { Component } from "react";
const cn = require("classnames");

class ToggleField extends Component {

  render() {
    const { checked, className, id, name, onChange, required, value } = this.props;
    const classNames = cn("toggle-field", className);

    return (
      <input
        className={classNames}
        type="checkbox"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        required={required}
      />
    );
  }

};

export default ToggleField;

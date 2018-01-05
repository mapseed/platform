import React, { Component } from "react";
const cn = require("classnames");

class RangeField extends Component {

  render() {
    const { className, id, max, min, name, onChange, required, value } = this.props;
    const classNames = cn("range-field", className);

    return (
      <input 
        className={classNames}
        type="range"
        id={id}
        name={name}
        value={value}
        required={required}
        onChange={onChange}
      />
    );
  }

};

export default RangeField;

import React, { Component } from "react";
const cn = require("classnames");

import RangeField from "../form-fields/range-field";
import "./range-slider-with-label.scss";

class RangeSliderWithLabel extends Component {

  render() {
    const { autofillMode, hasAutofill, max, min, name, onChange, value } = this.props;
    const classNames = cn("range-slider-with-label", {
      "range-slider-with-label--has-autofill-colored": hasAutofill && value && autofillMode === "color"
    });

    return (
      <label className={classNames}>
        <RangeField
          className="range-slider-with-label__input"
          name={name}
          max={max}
          min={min}
          value={value}
          onChange={onChange}
        />
        {value}
      </label>
    );
  }

};

export default RangeSliderWithLabel;

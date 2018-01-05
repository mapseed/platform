import React, { Component } from "react";

import RangeField from "../form-fields/range-field";
import "./range-slider-with-label.scss";

class RangeSliderWithLabel extends Component {

  render() {
    const { max, min, name, onChange, value } = this.props;

    return (
      <label className="range-slider-with-label">
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

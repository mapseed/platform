import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import RangeField from "../form-fields/range-field";
import "./range-slider-with-label.scss";

const RangeSliderWithLabel = props => {
  const { autofillMode, hasAutofill, max, min, name, onChange, value } = props;
  const cn = classNames("range-slider-with-label", {
    "range-slider-with-label--has-autofill-colored":
      hasAutofill && value && autofillMode === "color",
  });

  return (
    <label className={cn}>
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
};

RangeSliderWithLabel.propTypes = {
  autofillMode: PropTypes.string.isRequired,
  hasAutofill: PropTypes.bool,
  max: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.number.isRequired,
};

RangeSliderWithLabel.defaultProps = {
  autofillMode: "color",
  max: 100,
  min: 0,
};

export default RangeSliderWithLabel;

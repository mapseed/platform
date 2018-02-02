import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import RangeField from "../form-field-types/range-field";
import "./range-slider-with-label.scss";

const RangeSliderWithLabel = props => {
  const cn = classNames("range-slider-with-label", {
    "range-slider-with-label--has-autofill--colored":
      props.hasAutofill && props.value && props.autofillMode === "color",
  });

  return (
    <label className={cn}>
      <RangeField
        className="range-slider-with-label__input"
        name={props.name}
        max={props.max}
        min={props.min}
        value={props.value}
        onChange={props.onChange}
      />
      {props.value}
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
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

RangeSliderWithLabel.defaultProps = {
  autofillMode: "color",
  max: 100,
  min: 0,
};

export default RangeSliderWithLabel;

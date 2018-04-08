import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import RangeField from "./range-field";
import "./range-slider-with-label.scss";

const RangeSliderWithLabel = props => {
  const cn = classNames("range-slider-with-label", {
    "range-slider-with-label--has-autofill": props.hasAutofill && props.value,
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
  hasAutofill: PropTypes.bool,
  max: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

RangeSliderWithLabel.defaultProps = {
  max: 100,
  min: 0,
};

export default RangeSliderWithLabel;

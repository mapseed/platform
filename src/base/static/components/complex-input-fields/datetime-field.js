import React from "react";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";

import "./datetime-field.scss";

const DatetimeField = props => {
  return (
    <DatePicker
      className="datetime-field"
      dateFormat={props.showTimeSelect ? "LLL" : "LL"}
      showTimeSelect={props.showTimeSelect}
      selected={props.date}
      onChange={value => props.onChange(props.name, value)}
    />
  );
};

DatetimeField.propTypes = {
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  showTimeSelect: PropTypes.bool.isRequired,
};

DatetimeField.defaultProps = {
  showTimeSelect: true,
};

export default DatetimeField;

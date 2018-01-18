import React from "react";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";

import "./datetime-field.scss";

const DatetimeField = props => {
  const { date, name, onChange, showTimeSelect } = props;

  return (
    <DatePicker
      className="datetime-field"
      dateFormat={showTimeSelect ? "LLL" : "LL"}
      showTimeSelect={showTimeSelect}
      selected={date}
      onChange={evt => onChange(evt, name)}
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

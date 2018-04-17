import React from "react";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import moment from "moment";

import "./datetime-field.scss";

const DatetimeField = props => {
  const datetimeFormat = "MMMM Do YYYY, h:mm:ss a";

  return (
    <DatePicker
      className="datetime-field"
      dateFormat={props.showTimeSelect ? "LLL" : "LL"}
      showTimeSelect={props.showTimeSelect}
      selected={props.date ? moment(props.date, datetimeFormat) : ""}
      onChange={dateObj =>
        props.onChange(props.name, dateObj.format(datetimeFormat))
      }
    />
  );
};

DatetimeField.propTypes = {
  date: PropTypes.string,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  showTimeSelect: PropTypes.bool.isRequired,
};

DatetimeField.defaultProps = {
  showTimeSelect: true,
};

export default DatetimeField;

import React from "react";
import PropTypes from "prop-types";
import Datetime from "react-datetime";
import moment from "moment";

import "react-datetime/css/react-datetime.css";

import constants from "../../../constants";

import "./datetime-field.scss";

/* eslint-disable react/prop-types */
const renderInput = ({ datetimeProps, props, openCalendar }) => {
  return (
    <button
      type="button"
      className="datetime-field__open-button"
      onClick={openCalendar}
    >
      {datetimeProps.value
        ? moment(datetimeProps.value).format(props.displayFormat)
        : props.placeholder ? props.placeholder : "Select a date"}
    </button>
  );
};
/* eslint-enable react/prop-types */

const DatetimeField = props => {
  return (
    <Datetime
      className="datetime-field"
      dateFormat={props.dateFormat}
      timeFormat={props.timeFormat}
      renderInput={(datetimeProps, openCalendar) => {
        return renderInput({
          datetimeProps: datetimeProps,
          openCalendar: openCalendar,
          props: props,
        });
      }}
      onChange={date => {
        props.onChange(
          props.name,
          date.format(
            `${props.dateFormat}${
              props.timeFormat ? " " + props.timeFormat : ""
            }`,
          ),
        );
      }}
    />
  );
};

DatetimeField.propTypes = {
  dateFormat: PropTypes.string.isRequired,
  displayFormat: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  timeFormat: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
    .isRequired,
};

DatetimeField.defaultProps = {
  dateFormat: constants.DEFAULT_DATE_FORMAT,
  displayFormat: constants.DEFAULT_DATE_DISPLAY_FORMAT,
  timeFormat: false,
};

export default DatetimeField;

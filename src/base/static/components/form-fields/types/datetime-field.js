import React, { Component } from "react";
import PropTypes from "prop-types";
import Datetime from "react-datetime";
import moment from "moment";

import "react-datetime/css/react-datetime.css";

import constants from "../../../constants";

import "./datetime-field.scss";

class DatetimeField extends Component {
  componentDidMount() {
    this.props.isAutoFocusing && this.inputRef.focus();
  }

  render() {
    return (
      <Datetime
        className="datetime-field"
        dateFormat={this.props.dateFormat}
        timeFormat={this.props.timeFormat}
        renderInput={(datetimeProps, openCalendar) => {
          return (
            <input
              type="text"
              ref={input => {
                this.inputRef = input;
              }}
              className="datetime-field__input"
              onFocus={openCalendar}
              placeholder={this.props.placeholder || "Select a date"}
              value={
                this.props.value &&
                moment(this.props.value).format(this.props.displayFormat)
              }
            />
          );
        }}
        onChange={date => {
          this.props.onChange(
            this.props.name,
            date.format(
              `${this.props.dateFormat}${
                this.props.timeFormat ? " " + this.props.timeFormat : ""
              }`,
            ),
          );
        }}
      />
    );
  }
}

DatetimeField.propTypes = {
  dateFormat: PropTypes.string.isRequired,
  displayFormat: PropTypes.string.isRequired,
  isAutoFocusing: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  timeFormat: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
    .isRequired,
  value: PropTypes.string,
};

DatetimeField.defaultProps = {
  dateFormat: constants.DEFAULT_DATE_FORMAT,
  displayFormat: constants.DEFAULT_DATE_DISPLAY_FORMAT,
  timeFormat: false,
};

export default DatetimeField;

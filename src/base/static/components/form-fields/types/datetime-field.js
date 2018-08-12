import React, { Component } from "react";
import PropTypes from "prop-types";
import Datetime from "react-datetime";
import moment from "moment";
import classNames from "classnames";

import "react-datetime/css/react-datetime.css";

import constants from "../../../constants";

import "./datetime-field.scss";

// HACK: We use a far-future timestamp to represent the notion of an "ongoing"
// datetime selection.
// TODO: Support the ability for field components to write to multiple backend
// data fields of different data types.
const ONGOING_DATETIME = "9999-12-31 23:59:59";

class DatetimeField extends Component {
  componentDidMount() {
    this.props.isAutoFocusing && this.inputRef.focus();
    this.ongoingValue = moment(ONGOING_DATETIME).format(this.props.dateFormat);
  }

  render() {
    return (
      <Datetime
        className="datetime-field"
        dateFormat={this.props.dateFormat}
        timeFormat={this.props.timeFormat}
        renderInput={(datetimeProps, openCalendar) => {
          return (
            <div className="datetime-field__input-wrapper">
              {this.props.ongoingLabel && (
                <label
                  className={classNames("datetime-field__label-ongoing", {
                    "datetime-field__label-ongoing--toggled":
                      this.props.value === this.ongoingValue,
                  })}
                >
                  <input
                    className="datetime-field__input-ongoing"
                    type="checkbox"
                    checked={this.props.value === this.ongoingValue}
                    onChange={e =>
                      this.props.onChange(
                        this.props.name,
                        e.target.checked ? this.ongoingValue : "",
                      )
                    }
                  />
                  <em>{this.props.ongoingLabel}</em>
                </label>
              )}
              <input
                type="text"
                ref={input => {
                  this.inputRef = input;
                }}
                className="datetime-field__input"
                onFocus={openCalendar}
                placeholder={this.props.placeholder || "Select a date"}
                value={
                  (this.props.value &&
                    this.props.value !== this.ongoingValue &&
                    moment(this.props.value).format(
                      this.props.displayFormat,
                    )) ||
                  ""
                }
              />
            </div>
          );
        }}
        closeOnSelect={true}
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
  ongoingLabel: PropTypes.string,
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

import React, { Component } from "react";
import DatePicker from "react-datepicker";

import "./datetime-field.scss";

class DatetimeField extends Component {

  render() {
    const { date, name, onChange, showTimeSelect } = this.props;

    return (
      <DatePicker
        className="datetime-field"
        dateFormat={(showTimeSelect) ? "LLL" : "LL"}
        showTimeSelect={showTimeSelect}
        selected={date}
        onChange={evt => onChange(evt, name)}
      />
    );
  }

};

export default DatetimeField;

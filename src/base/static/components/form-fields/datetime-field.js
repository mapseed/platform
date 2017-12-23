import React, { Component } from "react";
import DatePicker from "react-datepicker";

import "./datetime-field.scss";

class DatetimeField extends Component {

  constructor() {
    super(...arguments);
    this.state = {
      startDate: this.props.value
    };
    this.dateFormat = (this.props.showTimeSelect) ? "LLL" : "LL";
  }

  onChange(date) {
    this.setState({
      startDate: date
    });
    this.props.onChange && this.props.onChange();
  }

  render() {

    const { showTimeSelect } = this.props;
    const { startDate } = this.state;

    return (
      <DatePicker 
        className="mapseed-datetime-field"
        dateFormat={this.dateFormat}
        showTimeSelect={showTimeSelect}
        selected={startDate}
        onChange={this.onChange.bind(this)} />
    );
  }

};

export default DatetimeField;

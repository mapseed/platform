import React, { Component } from "react";
import DatePicker from "react-datepicker";

const baseClass = "mapseed-datetime-field";

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
		return (
			<DatePicker 
				className={baseClass}
				dateFormat={this.dateFormat}
				showTimeSelect={this.props.showTimeSelect}
				selected={this.state.startDate}
				onChange={this.onChange.bind(this)} />
		);
	}
};

export { DatetimeField };

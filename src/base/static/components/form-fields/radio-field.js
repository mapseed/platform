import React, { Component } from "react";

const baseClass = "mapseed-radio-field";

class RadioField extends Component {
	render() {
		return (
			<input 
				className={baseClass}
				type="radio"
				id={this.props.id}
				name={this.props.name}
				defaultChecked={this.props.defaultChecked}
				required={this.props.required} />
		);
	}
};

export { RadioField };

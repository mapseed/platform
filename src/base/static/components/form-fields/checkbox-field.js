import React, { Component } from "react";

const baseClass = "mapseed-checkbox-field";

class CheckboxField extends Component {
	render() {
		return (
			<input 
				className={baseClass}
				type="checkbox"
				id={this.props.id}
				name={this.props.name}
				required={this.props.required} 
				defaultChecked={this.props.defaultChecked} />
		);
	}
};

export { CheckboxField };

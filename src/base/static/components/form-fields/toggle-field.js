import React, { Component } from "react";

const baseClass = "mapseed-toggle-field";

class ToggleField extends Component {
	render() {
		return (
			<input 
				className={baseClass}
				type="checkbox"
				id={this.props.id}
				name={this.props.name}
				value={this.props.value}
				required={this.props.required} />
		);
	}
};

export { ToggleField };

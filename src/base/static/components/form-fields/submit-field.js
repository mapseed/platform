import React, { Component } from "react";

const baseClass = "mapseed-submit-field";

class SubmitField extends Component {
	render() {
		return (
			<input 
				className={baseClass}
				type="submit"
				id={this.props.id}
				name={this.props.name}
				value={this.props.value} />
		);
	}
};

export { SubmitField };

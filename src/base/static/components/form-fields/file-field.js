import React, { Component } from "react";

const baseClass = "mapseed-file-field";

class FileField extends Component {
	render() {
		return (
			<input 
				className={baseClass}
				type="file"
				id={this.props.id}
				name={this.props.name}
				value={this.props.value}
				required={this.props.required} />
		);
	}
};

export { FileField };

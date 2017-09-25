import React, { Component } from "react";

const baseClass = "basic-button";

class BasicButton extends Component {

	render() {
		return (
			<button className={baseClass}>
				{this.props.children}
			</button>
		);
	}
}

export { BasicButton }

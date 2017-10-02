import React, { Component } from "react";

const baseClass = "tertiary-button";

class TertiaryButton extends Component {

	render() {
		return (
			<button className={baseClass}>
				{this.props.children}
			</button>
		);
	}
}

export { TertiaryButton }

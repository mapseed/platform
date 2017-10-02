import React, { Component } from "react";

const baseClass = "secondary-button";

class SecondaryButton extends Component {

	render() {
		return (
			<button className={`${ baseClass } ${ this.props.className }`}>
				{this.props.children}
			</button>
		);
	}
}

export { SecondaryButton }

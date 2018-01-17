import React, { Component } from "react";

class TertiaryButton extends Component {
  render() {
    return <button className="tertiary-button">{this.props.children}</button>;
  }
}

export default TertiaryButton;

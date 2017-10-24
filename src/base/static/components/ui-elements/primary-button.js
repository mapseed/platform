import React, { Component } from "react";

const baseClass = "primary-button";

class PrimaryButton extends Component {

  render() {
    return (
      <button 
        className={baseClass}
        disabled={this.props.disabled}>
        {this.props.children}
      </button>
    );
  }
}

export { PrimaryButton }

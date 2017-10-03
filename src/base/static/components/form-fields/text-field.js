import React, { Component } from "react";

const baseClass = "mapseed-text-field";

class TextField extends Component {
  render() {
    return (
      <input 
        className={baseClass}
        name={this.props.name}
        type="text"
        defaultValue={this.props.defaultValue}
        placeholder={this.props.placeholder} 
        required={this.props.required} 
        onChange={this.props.onChange} />
    );
  }
};

export { TextField };

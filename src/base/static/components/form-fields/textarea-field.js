import React, { Component } from "react";

const baseClass = "mapseed-textarea-field";

class TextareaField extends Component {
  render() {
    return (
      <textarea 
        className={baseClass}
        name={this.props.name}
        placeholder={this.props.placeholder}
        defaultValue={this.props.defaultValue}
        required={this.props.required}
        onChange={this.props.onChange}>	
      </textarea>
    );
  }
};

export { TextareaField };

import React, { Component } from "react";
import PropTypes from "prop-types";

import TextField from "./text-field";
import { customUrlField as messages } from "../../messages";
import "./custom-url-toolbar.scss";

const Util = require("../../../js/utils.js");

class CustomUrlToolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: "",
    };
    this.urlPrefix =
      window.location.protocol + "//" + window.location.hostname + "/";
  }

  onUrlChange(name, value) {
    value = Util.prepareCustomUrl(value);
    this.setState({
      url: value,
    });
    this.props.onChange(name, value);
  }

  render() {
    return (
      <div className="custom-url-field">
        <div className="custom-url-field__url-readout-container">
          <p className="custom-url-field__url-readout-prefix-msg">
            {messages.urlReadoutPrefix}
          </p>
          <span className="custom-url-field__url-readout-prefix">
            {this.urlPrefix}
          </span>
          <span className="custom-url-field__url-readout-url">
            {this.state.url}
          </span>
        </div>
        <TextField
          placeholder={this.props.placeholder}
          value={this.props.value}
          name={this.props.name}
          onChange={this.onUrlChange.bind(this)}
        />
      </div>
    );
  }
}

CustomUrlToolbar.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
};

export default CustomUrlToolbar;

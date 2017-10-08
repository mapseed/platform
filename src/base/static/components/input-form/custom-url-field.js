import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "bem-classnames";

import { TextField } from "../form-fields/text-field";
import { customUrlField as messages } from "../messages";

const Util = require("../../js/utils.js");

const baseClass = "custom-url-field";

class CustomUrlField extends Component {

  constructor() {
    super(...arguments);
    this.state = {
      url: ""
    };
    this.classes = {
      urlReadoutContainer: {
        name: baseClass + "__url-readout-container"
      },
      urlReadoutPrefix: {
        name: baseClass + "__url-readout-prefix"
      },
      urlReadoutUrl: {
        name: baseClass + "__url-readout-url"
      },
      urlReadoutPrefixMsg: {
        name: baseClass + "__url-readout-prefix-msg"
      }
    };

    let slug = this.props.layerConfig.slug;

    this.urlPrefix = 
      window.location.protocol +
      "//" +
      window.location.hostname +
      "/" +
      (this.props.layerConfig.useSlugForCustomUrls ? this.props.layerConfig.slug + "/" : "");
  }

  onUrlChange(evt) {
    evt.target.value = Util.prepareCustomUrl(evt.target.value);
    this.setState({
      url: evt.target.value
    });
    this.props.onChange(evt);
  }

  render() {
    return (
      <div className={baseClass}>
        <div className={cx(this.classes.urlReadoutContainer)}>
          <p className={cx(this.classes.urlReadoutPrefixMsg)}>{messages.urlReadoutPrefix}</p>
          <span className={cx(this.classes.urlReadoutPrefix)}>{this.urlPrefix}</span>
          <span className={cx(this.classes.urlReadoutUrl)}>{this.state.url}</span>
        </div>
        <TextField 
          placeholder={this.props.placeholder} 
          onChange={this.onUrlChange.bind(this)} />
      </div>
    );
  }
};

export { CustomUrlField };

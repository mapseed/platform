import React, { Component } from "react";
import cx from "bem-classnames";

import { RadioBigButton } from "../input-form/radio-big-button";
import { publishControlToolbar as messages } from "../messages";

const baseClass = "publish-control-toolbar";

class PublishControlToolbar extends Component {

  constructor() {
    super(...arguments);
    this.classes = {
      footerMsg: {
        name: baseClass + "__footer-message"
      },
      buttonsContainer: {
        name: baseClass + "__buttons-container"
      }
    }
  }

  render() {
    let footerMsg = (this.props.published === "isPublished")
      ? messages.publishedFooterMsg
      : messages.notPublishedFooterMsg;

    return (
      <div className={baseClass}>
        <div className={cx(this.classes.buttonsContainer)}>
          <RadioBigButton
            value="isPublished"
            label={messages.publishedLabel}
            id={"input-form-" + this.props.name + "-isPublished"}
            name={this.props.name}
            value="isPublished"
            checked={this.props.published === "isPublished"}
            onChange={this.props.onChange} />
          <RadioBigButton
            value="isNotPublished"
            label={messages.notPublishedLabel}
            id={"input-form-" + this.props.name + "-isNotPublished"}
            name={this.props.name}
            value="isNotPublished"
            checked={this.props.published === "isNotPublished"}
            onChange={this.props.onChange} />
          </div>
        <p className={cx(this.classes.footerMsg)}><em>{footerMsg}</em></p>
      </div>
    );
  }
}

export { PublishControlToolbar }

import React, { Component } from "react";
import BigRadioField from "../input-form/big-radio-field";
import { publishControlToolbar as messages } from "../messages";
import "./publish-control-toolbar.scss";

class PublishControlToolbar extends Component {
  render() {
    const { name, onChange, published } = this.props;
    const footerMsg =
      published === "isPublished"
        ? messages.publishedFooterMsg
        : messages.notPublishedFooterMsg;

    return (
      <div className="publish-control-toolbar">
        <div className="publish-control-toolbar__buttons-container">
          <BigRadioField
            value="isPublished"
            label={messages.publishedLabel}
            id={"input-form-" + name + "-isPublished"}
            name={this.props.name}
            value="isPublished"
            checked={this.props.published === "isPublished"}
            onChange={this.props.onChange}
          />
          <BigRadioField
            value="isNotPublished"
            label={messages.notPublishedLabel}
            id={"input-form-" + name + "-isNotPublished"}
            name={name}
            value="isNotPublished"
            checked={published === "isNotPublished"}
            onChange={onChange}
          />
        </div>
        <p className="publish-control-toolbar__footer-message">
          <em>{footerMsg}</em>
        </p>
      </div>
    );
  }
}

export default PublishControlToolbar;

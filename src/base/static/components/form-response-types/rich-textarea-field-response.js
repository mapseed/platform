import React, { Component } from "react";
import PropTypes from "prop-types";

import constants from "../constants";

class RichTextareaFieldResponse extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.images = {};
    this.props.model.attachmentCollection.models
      .filter(model => model.get("type") === "RT")
      .forEach(model => {
        this.images[model.get("name")] = model.get("file");
      });
  }

  insertEmbeddedImages(html) {
    // Replace rich text image markup with <img /> tags.
    const regex = new RegExp(
      constants.RICH_TEXT_IMAGE_MARKUP_PREFIX +
        "(.*?)" +
        constants.RICH_TEXT_IMAGE_MARKUP_SUFFIX,
      "g"
    );
    return html.replace(regex, (match, imgName) => {
      return "<img src='" + this.images[imgName] + "' />";
    });
  }

  render() {
    return (
      <div
        className="rich-textarea-field-response"
        dangerouslySetInnerHTML={{
          __html: this.insertEmbeddedImages(this.props.value),
        }}
      />
    );
  }
}

RichTextareaFieldResponse.propTypes = {
  model: PropTypes.object.isRequired,
  value: PropTypes.string.isRequired,
};

export default RichTextareaFieldResponse;

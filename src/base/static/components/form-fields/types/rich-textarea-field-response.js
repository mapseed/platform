import React, { Component } from "react";
import PropTypes from "prop-types";

import constants from "../../constants";

class RichTextareaFieldResponse extends Component {
  componentWillMount() {
    this.images = this.props.attachmentModels
      .filter(
        attributes =>
          attributes.get(constants.ATTACHMENT_TYPE_PROPERTY_NAME) ===
          constants.RICH_TEXT_IMAGE_CODE
      )
      .reduce((images, attributes) => {
        images[
          attributes.get(constants.ATTACHMENT_NAME_PROPERTY_NAME)
        ] = attributes.get(constants.ATTACHMENT_FILE_PROPERTY_NAME);
        return images;
      }, {});
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
  attachmentModels: PropTypes.object,
  value: PropTypes.string.isRequired,
};

export default RichTextareaFieldResponse;

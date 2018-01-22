import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import SecondaryButton from "../ui-elements/secondary-button";
import FileField from "../basic-input-fields/file-field";
import constants from "../constants";

import "./add-attachment-button.scss";

const Util = require("../../js/utils.js");

class AddAttachmentButton extends Component {
  constructor() {
    super();
    this.state = {
      displayFilename: null,
    };
    this.onChange = this.onChange.bind(this);
  }

  onChange(evt) {
    evt.persist();

    if (evt.target.files && evt.target.files.length) {
      const file = evt.target.files[0];
      this.setState({ displayFilename: file.name });

      Util.fileToCanvas(
        file,
        canvas => {
          canvas.toBlob(blob => {
            const fileObj = {
              name: this.props.name,
              blob: blob,
              file: canvas.toDataURL("image/jpeg"),
              type: "CO", // cover image
            };

            // Keep track of whether or not a cover image has been added for the
            // purposes of validating an attachment button that is required.
            this.props.onChange(evt.target.name, true);
            this.props.onAdditionalData(
              constants.ON_ADD_ATTACHMENT_ACTION,
              fileObj
            );
          }, "image/jpeg");
        },
        {
          // TODO: make configurable
          maxWidth: 800,
          maxHeight: 800,
          canvas: true,
        }
      );
    }
  }

  render() {
    const cn = classNames("add-attachment-button__filename", {
      "add-attachment-button__filename--visible": this.state.displayFilename,
    });

    return (
      <div className="add-attachment-button">
        <SecondaryButton>
          <FileField
            onChange={this.onChange}
            name={this.props.name}
            label={this.props.label}
            accept="image/*"
          />
        </SecondaryButton>
        <span className={cn}>{this.state.displayFilename}</span>
      </div>
    );
  }
}

AddAttachmentButton.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default AddAttachmentButton;

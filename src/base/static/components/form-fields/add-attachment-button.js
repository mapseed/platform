import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import SecondaryButton from "../ui-elements/secondary-button";
import FileField from "../form-fields/file-field";

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
      const { name, onChange } = this.props;
      this.setState({ displayFilename: file.name });

      Util.fileToCanvas(
        file,
        canvas => {
          canvas.toBlob(blob => {
            const fileObj = {
              name: name,
              blob: blob,
              file: canvas.toDataURL("image/jpeg"),
              type: "CO", // cover image
            };
            onChange(evt, fileObj);
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
    const { name, label } = this.props;
    const { displayFilename } = this.state;
    const cn = classNames("add-attachment-button__filename", {
      "add-attachment-button__filename--visible": displayFilename,
    });

    return (
      <div className="add-attachment-button">
        <SecondaryButton>
          <FileField
            onChange={this.onChange}
            name={name}
            label={label}
            accept="image/*"
          />
        </SecondaryButton>
        <span className={cn}>{displayFilename}</span>
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

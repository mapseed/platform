import React, { Component } from "react";
const cn = require("classnames");

import SecondaryButton from "../ui-elements/secondary-button";
import FileField from "../form-fields/file-field";

import "./add-attachment-button.scss";

const Util = require("../../js/utils.js");

class AddAttachmentButton extends Component {

  constructor() {
    super(...arguments);
    this.state = {
      displayFilename: null
    };
    // TODO: reset this
    // TODO: keep track of attachments in parent component?
    this.attachments = [];
  }

  onChange(evt) {
    if (evt.target.files && evt.target.files.length) {
      let file = evt.target.files[0];
      this.setState({ displayFilename: file.name });

      Util.fileToCanvas(
        file,
        (canvas) => {
          canvas.toBlob((blob) => {
            this.attachments.push({
              name: this.props.name,
              blob: blob,
              file: canvas.toDataURL("image/jpeg"),
              type: "CO" // cover image
            });
          }, "image/jpeg");
        },
        {
          // TODO: make configurable
          maxWidth: 800,
          maxHeight: 800,
          canvas: true,
        },
      );
    }
  }

  render() {
    const { name, label } = this.props;
    const { displayFilename } = this.state;
    const classNames = cn("mapseed-add-attachment-button__filename", {
        "mapseed-add-attachment-button__filename--visible": displayFilename,
        "mapseed-add-attachment-button__filename--hidden": !displayFilename
      });

    return (
      <div className="mapseed-add-attachment-button">
        <SecondaryButton>
          <FileField
            onChange={this.onChange.bind(this)}
            name={name} 
            label={label} />
        </SecondaryButton>
        <span className={classNames}>
          {displayFilename}
        </span>
      </div>
    );
  }
};

export default AddAttachmentButton;

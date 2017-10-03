import React, { Component } from "react";
import cx from "bem-classnames";

import { SecondaryButton } from "../ui-elements/secondary-button";
import { FileField } from "../form-fields/file-field";

const Util = require("../../js/utils.js");

const baseClass = "add-attachment-button";

class AddAttachmentButton extends Component {

  constructor() {
    super(...arguments);
    this.state = {
      displayFilename: null
    };
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
    let addAttachmentFilenameClass = {
          name: baseClass + "__filename",
          modifiers: ["visibility"]
        };

    return (
      <div className={baseClass}>
        <SecondaryButton>
          Add an image
          <FileField onChange={this.onChange.bind(this)} 
                     name={this.props.name} />
        </SecondaryButton>
        <span className={cx(addAttachmentFilenameClass, { visibility: this.state.displayFilename ? "visible" : "hidden" })}>
          {this.state.displayFilename}
        </span>
      </div>
    );
  }
};

export { AddAttachmentButton };

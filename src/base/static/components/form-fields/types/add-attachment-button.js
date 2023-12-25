import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import FileField from "./file-field";

import "./add-attachment-button.scss";

import Util from "../../../js/utils.js";

const MODES = {
  image: {
    accept: "image/*",
    type: "CO"
  },
  pdf: {
    accept: "application/pdf",
    type: "PD"
  }
}

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

      Util.loadFile(
        file,
        result => {
          this.props.onChange(evt.target.name, "");
          this.props.onAddAttachment({
            name: this.props.name,
            file: result,
            type: MODES[this.props.mode].type
          })
        }
      );
    }
  }

  render() {
    const cn = classNames("add-attachment-button__filename", {
      "add-attachment-button__filename--visible": this.state.displayFilename,
    });

    return (
      <div className="add-attachment-container">
        <FileField
          className="add-attachment-button__file-field-label"
          formId={this.props.formId}
          onChange={this.onChange}
          name={this.props.name}
          label={this.props.label}
          accept={MODES[this.props.mode].accept}
        />
        <span className={cn}>{this.state.displayFilename}</span>
      </div>
    );
  }
}

AddAttachmentButton.defaultProps = {
  mode: "image"
}

AddAttachmentButton.propTypes = {
  formId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onAddAttachment: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(["image", "pdf"]),
};

export default AddAttachmentButton;

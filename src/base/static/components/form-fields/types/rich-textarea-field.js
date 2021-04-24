import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactQuill, { Quill } from "react-quill";
import classNames from "classnames";
const BlockEmbed = Quill.import("blots/block/embed");
const Embed = Quill.import("blots/embed");
const SnowTheme = Quill.import("themes/snow");
const Link = Quill.import("formats/link");
import { withTranslation } from "react-i18next";

import constants from "../../../constants";

import "./rich-textarea-field.scss";
import Util from "../../../js/utils.js";

const getRandomName = () => {
  return Math.random().toString(36).substring(7);
};

let onAddAttachment;
class ImageWithName extends Embed {
  static create(value) {
    value.name = value.name || getRandomName();

    const node = super.create();
    node.setAttribute("alt", value.alt);
    node.setAttribute("src", value.file);
    node.setAttribute("name", value.name);

    if (!value.blob && value.file.startsWith("data:")) {
      // If there is no blob data and the image file is represented by a data
      // url, we want to create an attachment model for this image.
      const binary = atob(value.file.split(",")[1]);
      const array = [];
      for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      value.blob = new Blob([new Uint8Array(array)], {
        type: "image/jpeg",
      });
      value.type = constants.RICH_TEXT_IMAGE_CODE;
      onAddAttachment(value);
    }

    return node;
  }

  static value(node) {
    return {
      name: getRandomName(),
      alt: node.getAttribute("alt"),
      file: node.getAttribute("src"),
    };
  }
}
ImageWithName.blotName = "imageWithName";
ImageWithName.tagName = "IMG";
Quill.register(ImageWithName);

class PdfEmbed extends BlockEmbed {
  static create(url) {
    const node = super.create();
    const iframe = document.createElement("iframe");

    iframe.setAttribute("src", url);
    iframe.setAttribute("frameborder", 0);
    iframe.setAttribute("allowfullscreen", true);
    iframe.style = "position: absolute; top: 0; left: 0; width: 100%;";
    node.appendChild(iframe);

    return node;
  }

  static value(domNode) {
    const iframe = domNode.querySelector("iframe");
    return iframe.getAttribute("src");
  }
}
PdfEmbed.blotName = "pdfEmbed";
PdfEmbed.tagName = "DIV";
PdfEmbed.className = "ql-pdf-embed";
Quill.register(PdfEmbed);

class RichTextareaField extends Component {
  constructor(props) {
    super(props);

    onAddAttachment = props.onAddAttachment;
    this.modules = {
      toolbar: {
        container: [
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ color: [] }, { background: [] }],
          ["link", "image", "video", "pdf"],
        ],
        handlers: {
          image: this.onClickEmbedImage.bind(this),
          pdf: this.onClickEmbedPdf.bind(this),
        },
      },
    };
    this.onAddImage = this.onAddImage.bind(this);
  }

  onClickEmbedImage() {
    this.quillFileInput.click();
  }

  onClickEmbedPdf() {
    // This is hacky, but Quill just doesn't have another way of handling this,
    // AFAICT. We need to temporarily swap out the save handler for the tooltip box.
    const editor = this.quillEditor.getEditor();
    const oldSave = editor.theme.tooltip.save;

    editor.theme.tooltip.save = () => {
      editor.focus();
      const tooltipValue = editor.theme.tooltip.textbox.value;

      editor.insertEmbed(
        editor.getSelection().index,
        "pdfEmbed",
        tooltipValue,
        "user",
      );

      // Restore old save method.
      editor.theme.tooltip.save = oldSave;
    };

    this.quillEditor.getEditor().theme.tooltip.edit("pdf");
  }

  onChange(value) {
    // "Blank" Quill editors actually contain the following markup; we replace
    // that here with an empty string.
    if (value === "<p><br></p>") value = "";

    this.props.onChange(this.props.name, value);
  }

  onAddImage(evt) {
    if (evt.target.files && evt.target.files.length) {
      const file = evt.target.files[0];
      Util.fileToCanvas(
        file,
        canvas => {
          const data = {
            file: canvas.toDataURL("image/jpeg"),
            type: constants.RICH_TEXT_IMAGE_CODE,
          };
          const editor = this.quillEditor.getEditor();

          editor.insertEmbed(
            editor.getSelection().index,
            "imageWithName",
            data,
            "user",
          );
        },
        {
          // TODO: make configurable
          maxWidth: 800,
          maxHeight: 800,
          canvas: true,
        },
      );
    }

    this.quillFileInput.value = "";
  }

  render() {
    const cn = {
      base: classNames("rich-textarea-field", {
        "rich-textarea-field--has-autofill--colored": this.props.hasAutofill,
      }),
      quillFileInput: classNames(
        "rich-textarea-field__quill-file-input",
        "rich-textarea-field__quill-file-input--hidden",
      ),
    };

    return (
      <div className={cn.base}>
        <ReactQuill
          ref={node => (this.quillEditor = node)}
          theme="snow"
          modules={this.modules}
          placeholder={this.props.t(
            `richTextareaFieldPlaceholder${this.props.formId}${this.props.name}`,
            this.props.placeholder || " ",
          )}
          bounds={`.${cn.base}`}
          value={this.props.value}
          onChange={this.onChange.bind(this)}
        />
        <input
          className={cn.quillFileInput}
          ref={node => (this.quillFileInput = node)}
          type="file"
          onChange={this.onAddImage}
          accept="image/png, image/gif, image/jpeg"
        />
      </div>
    );
  }
}

RichTextareaField.propTypes = {
  formId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onAddAttachment: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  t: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

export default withTranslation("RichTextareaField")(RichTextareaField);

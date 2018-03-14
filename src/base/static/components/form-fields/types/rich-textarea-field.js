import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactQuill, { Quill } from "react-quill";
import classNames from "classnames";
const BlockEmbed = Quill.import("blots/block/embed");
const Embed = Quill.import("blots/embed");
const SnowTheme = Quill.import("themes/snow");
const Link = Quill.import("formats/link");

import constants from "../../constants";

import "./rich-textarea-field.scss";
const Util = require("../../../js/utils.js");

// NOTE: this routine is taken from Quill's themes/base module, which is not
// importable via react-quill.
const extractVideoUrl = url => {
  let match =
    url.match(
      /^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/
    ) ||
    url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return (
      (match[1] || "https") +
      "://www.youtube.com/embed/" +
      match[2] +
      "?showinfo=0"
    );
  }
  if ((match = url.match(/^(?:(https?):\/\/)?(?:www\.)?vimeo\.com\/(\d+)/))) {
    return (
      (match[1] || "https") + "://player.vimeo.com/video/" + match[2] + "/"
    );
  }
  return url;
};

const getRandomName = () => {
  return Math.random()
    .toString(36)
    .substring(7);
};

class WrappedVideo extends BlockEmbed {
  static create(url) {
    let node = super.create();
    const iframe = document.createElement("iframe");

    url = Link.sanitize(extractVideoUrl(url));
    iframe.setAttribute("src", url);
    iframe.setAttribute("frameborder", 0);
    iframe.setAttribute("allowfullscreen", true);
    iframe.className = "ql-video";
    node.appendChild(iframe);

    return node;
  }
}
WrappedVideo.blotName = "wrappedVideo";
WrappedVideo.tagName = "DIV";
WrappedVideo.className = "ql-video-container";
Quill.register(WrappedVideo);

let onAdditionalData;
class ImageWithName extends Embed {
  static create(value) {
    value.name = value.name || getRandomName();

    let node = super.create();
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
      onAdditionalData(constants.ON_ADD_ATTACHMENT_ACTION, value);
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

class RichTextareaField extends Component {
  constructor(props) {
    super(props);

    onAdditionalData = props.onAdditionalData;
    this.modules = {
      toolbar: {
        container: [
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ color: [] }, { background: [] }],
          ["link", "image", "video"],
        ],
        handlers: {
          image: this.onClickEmbedImage.bind(this),
          video: this.onClickEmbedVideo.bind(this),
        },
      },
    };
    this.onAddImage = this.onAddImage.bind(this);
  }

  componentDidMount() {
    let editor = this["quill-editor"].getEditor();

    // NOTE: we create a whole new SnowTheme here so we can make use of a
    // tooltip box with custom click handler.
    // TODO: is there a lighter-weight way to accomplish this?
    this.snowTheme = new SnowTheme(editor, editor.options);
    this.snowTheme.extendToolbar(editor.theme.modules.toolbar);

    // We replace the ql-action element so we can attach our own click listener
    // below.
    let oldElt = this.snowTheme.tooltip.root.querySelector("a.ql-action"),
      newElt = oldElt.cloneNode(true);
    oldElt.parentNode.replaceChild(newElt, oldElt);

    this.snowTheme.tooltip.root
      .querySelector("a.ql-action")
      .addEventListener("click", evt => {
        evt.preventDefault();
        editor.focus();
        let url = this.snowTheme.tooltip.root.querySelector("input").value;
        editor.insertEmbed(
          editor.getSelection().index,
          "wrappedVideo",
          url,
          "user"
        );
        this.snowTheme.tooltip.root.className += " ql-hidden";
      });
  }

  onClickEmbedImage() {
    // TODO: is there a way around using refs here?
    this["quill-file-input"].click();
  }

  onClickEmbedVideo() {
    this.snowTheme.tooltip.edit("video");
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
          const editor = this["quill-editor"].getEditor();

          editor.insertEmbed(
            editor.getSelection().index,
            "imageWithName",
            data,
            "user"
          );
        },
        {
          // TODO: make configurable
          maxWidth: 800,
          maxHeight: 800,
          canvas: true,
        }
      );
    }

    this["quill-file-input"].value = "";
  }

  render() {
    const cn = {
      base: classNames("rich-textarea-field", {
        "rich-textarea-field--has-autofill--colored": this.props.hasAutofill,
      }),
      quillFileInput: classNames(
        "rich-textarea-field__quill-file-input",
        "rich-textarea-field__quill-file-input--hidden"
      ),
    };

    return (
      <div className={cn.base}>
        <ReactQuill
          ref={node => (this["quill-editor"] = node)}
          theme="snow"
          modules={this.modules}
          placeholder={this.props.placeholder}
          bounds={this.props.bounds}
          value={this.props.value}
          onChange={this.onChange.bind(this)}
        />
        <input
          className={cn.quillFileInput}
          ref={node => (this["quill-file-input"] = node)}
          type="file"
          onChange={this.onAddImage}
          accept="image/png, image/gif, image/jpeg"
        />
      </div>
    );
  }
}

RichTextareaField.propTypes = {
  bounds: PropTypes.string.isRequired,
  hasAutofill: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onAdditionalData: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
};

export default RichTextareaField;

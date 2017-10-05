import React, { Component, MouseEvent } from "react";
import cx from "bem-classnames";
import ReactQuill from "react-quill";

const Util = require("../../js/utils.js");

const baseClass = "mapseed-rich-textarea-field";

class RichTextareaField extends Component {

  constructor() {
    super(...arguments);
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
          "image": this.onClickAddImage.bind(this)
        }
      }
    };
  }

  onClickAddImage() {
    this.refs["quill-file-input"].click();
  }

  onAddImage(evt) {

    // TODO: model/no model distinction here
    if (evt.target.files && evt.target.files.length) {
      let file = evt.target.files[0];
      Util.fileToCanvas(
        file,
        (canvas) => {
          canvas.toBlob((blob) => {
            let data = {
              name: Math.random().toString(36).substring(7),
              blob: blob,
              file: canvas.toDataURL("image/jpeg"),
            },
            editor = this.refs["quill-editor"].getEditor();
              
            editor.insertEmbed(
              editor.getSelection().index,
              "image",
              data.file,
              "user",
            );

            // if (self.options.placeDetailView) {
            //   // If we have a place detail view, we already have a model to which
            //   // we can add attachments
            //   self.options.placeDetailView.onAddAttachmentCallback =
            //     self.onAddAttachment;
            //   self.options.placeDetailView.onAddAttachmentCallbackContext = self;
            //   self.model.attachmentCollection.add(data);
            // } else if (self.options.placeFormView) {
            //   // Otherwise, store up the added attachments in the place form view
            //   self.options.placeFormView.formState.attachmentData.push(data);
            //   self.quill.insertEmbed(
            //     self.quill.getSelection().index,
            //     "image",
            //     data.file,
            //     "user",
            //   );
            //   self
            //     .$("img")
            //     .filter(function() {
            //       return !$(this).attr("name");
            //     })
            //     .last()
            //     .attr("name", data.name);
            // }
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

    // NOTE: we reset the value of the file input field here so the user can
    // add multiple images to the rich text editor. If we don't reset the value,
    // the input field's onChange handler will only fire after the first image
    // is added.
    this.refs["quill-file-input"].value = "";
  }

  onChange(evt) {
    //console.log("rich textarea field onChange");

  }

  render() {
    let quillFileInputClass = {
          name: baseClass + "__quill-file-input",
          modifiers: ["visibility"]
        };

    return (
      <div className={baseClass}>
        <ReactQuill 
          ref="quill-editor"
          theme="snow"
          modules={this.modules}
          placeholder={this.props.placeholder}
          value={this.props.value}
          bounds={this.props.bounds}
          onChange={this.onChange.bind(this)}>
        </ReactQuill>
        <input 
          className={cx(quillFileInputClass, { visibility: "hidden" })}
          ref="quill-file-input"
          type="file" 
          onChange={this.onAddImage.bind(this)}
          accept="image/png, image/gif, image/jpeg" />
      </div>
    );
  }
};

export { RichTextareaField };

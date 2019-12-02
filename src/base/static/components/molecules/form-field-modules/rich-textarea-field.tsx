// TODO: Replace Quill with draftjs

import React, { Component, createRef } from "react";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import { withTranslation, WithTranslation } from "react-i18next";
import { FieldProps as FormikFieldProps } from "formik";
import ReactQuill, { Quill } from "react-quill";
const BlockEmbed = Quill.import("blots/block/embed");
const Embed = Quill.import("blots/embed");
const SnowTheme = Quill.import("themes/snow");
const Link = Quill.import("formats/link");
import loadImage from "blueimp-load-image";

import { MapseedRichTextareaFieldModule } from "../../../state/ducks/forms";
import { FieldPrompt } from "../../atoms/typography";

// NOTE: this routine is taken from Quill's themes/base module, which is not
// importable via react-quill.
const extractVideoUrl = url => {
  let match =
    url.match(
      /^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/,
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
    const node = super.create();
    node.style =
      "position: relative; padding-bottom: 56.25%; padding-top: 0; height: 0; overflow: hidden;";

    const iframe = document.createElement("iframe") as HTMLIFrameElement;

    url = Link.sanitize(extractVideoUrl(url));
    iframe.setAttribute("src", url);
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowfullscreen", "true");
    iframe.setAttribute(
      "style",
      "position: absolute; top: 0; left: 0; width: 100%; height: 100%;",
    );
    node.appendChild(iframe);

    return node;
  }

  static value(domNode) {
    const iframe = domNode.querySelector("iframe");
    return iframe.getAttribute("src");
  }
}
WrappedVideo.blotName = "wrappedVideo";
WrappedVideo.tagName = "DIV";
WrappedVideo.className = "ql-wrapped-video";
Quill.register(WrappedVideo);

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
        // @ts-ignore
        array.push(binary.charCodeAt(i));
      }
      value.blob = new Blob([new Uint8Array(array)], {
        type: "image/jpeg",
      });
      value.type = "RT";
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

type RichTextareaFieldModuleProps = {
  mapseedField: MapseedRichTextareaFieldModule;
  bounds: string;
} & FormikFieldProps &
  WithTranslation;

class RichTextareaField extends Component<RichTextareaFieldModuleProps> {
  quillEditor: React.RefObject<ReactQuill> = createRef();
  quillFileInput: React.RefObject<HTMLInputElement> = createRef();
  modules: any;
  snowTheme: any;

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
    const editor =
      this.quillEditor.current && this.quillEditor.current.getEditor();

    if (editor) {
      // NOTE: we create a whole new SnowTheme here so we can make use of a
      // tooltip box with custom click handler.
      // @ts-ignore
      this.snowTheme = new SnowTheme(editor, editor.options);
      // @ts-ignore
      this.snowTheme.extendToolbar(editor.theme.modules.toolbar);

      // We replace the ql-action element so we can attach our own click listener
      // below.
      const oldElt = this.snowTheme.tooltip.root.querySelector("a.ql-action");
      const newElt = oldElt.cloneNode(true);
      oldElt.parentNode.replaceChild(newElt, oldElt);

      this.snowTheme.tooltip.root
        .querySelector("a.ql-action")
        .addEventListener("click", evt => {
          evt.preventDefault();
          editor.focus();
          const url = this.snowTheme.tooltip.root.querySelector("input").value;
          editor.insertEmbed(
            // @ts-ignore
            editor.getSelection().index,
            "wrappedVideo",
            url,
            "user",
          );
          this.snowTheme.tooltip.root.className += " ql-hidden";
        });
    } else {
      // eslint-disable-next-line no-console
      console.error("RichTextareaField: could not get Quill editor ref");
    }
  }

  onClickEmbedImage() {
    this.quillFileInput.current && this.quillFileInput.current.click();
  }

  onClickEmbedVideo() {
    this.snowTheme.tooltip.edit("video");
  }

  onChange = value => {
    // "Blank" Quill editors actually contain the following markup; we replace
    // that here with an empty string.
    if (value === "<p><br></p>") value = "";

    this.props.field.onChange(value);
  };

  onAddImage(evt) {
    // TODO
    //  if (evt.target.files && evt.target.files.length) {
    //    const file = evt.target.files[0];
    //    Util.fileToCanvas(
    //      file,
    //      canvas => {
    //        const data = {
    //          file: canvas.toDataURL("image/jpeg"),
    //          type: "RT",
    //        };
    //        const editor = this.quillEditor.getEditor();
    //        editor.insertEmbed(
    //          editor.getSelection().index,
    //          "imageWithName",
    //          data,
    //          "user",
    //        );
    //      },
    //      {
    //        // TODO: make configurable
    //        maxWidth: 800,
    //        maxHeight: 800,
    //        canvas: true,
    //      },
    //    );
    //  }
    //  this.quillFileInput.current.value = "";
  }

  render() {
    return (
      <div>
        <ReactQuill
          ref={this.quillEditor}
          theme="snow"
          modules={this.modules}
          placeholder={this.props.t(
            `richTextareaFieldPlaceholder${this.props.mapseedField.id}`,
            this.props.mapseedField.placeholder || " ",
          )}
          bounds={this.props.bounds}
          value={this.props.field.value}
          onChange={this.onChange}
        />
        <input
          ref={this.quillFileInput}
          type="file"
          onChange={this.onAddImage}
          accept="image/png, image/jpeg"
        />
      </div>
    );
  }
}

export default withTranslation("RichTextareaField")(RichTextareaField);

//const RichTextareaField = ({
//  field: { name, value, onBlur, onChange },
//  mapseedField: { placeholder, id, prompt },
//  t,
//  setAttachments,
//}: RichTextareaFieldModuleProps) => {
//  const quillRef = React.useRef<HTMLElement>();
//  const quillFileInputRef = React.useRef();
//  const handleAddImage = React.useCallback(
//    evt => {
//      if (evt.target.files && evt.target.files.length) {
//        const file = evt.target.files[0];
//        Util.fileToCanvas(
//          file,
//          canvas => {
//            const data = {
//              file: canvas.toDataURL("image/jpeg"),
//              type: "RT",
//            };
//            const editor = quillRef.current.getEditor();
//
//            editor &&
//              editor.insertEmbed(
//                editor.getSelection().index,
//                "imageWithName",
//                data,
//                "user",
//              );
//          },
//          {
//            maxWidth: 800,
//            maxHeight: 800,
//            canvas: true,
//          },
//        );
//      }
//
//      if (quillFileInputRef && quillFileInputRef.current) {
//        quillFileInput.current.value = "";
//      }
//    },
//    [quillRef, quillFileInputRef],
//  );
//  const [snowTheme, setSnowTheme] = React.useState(null);
//  React.useEffect(() => {
//    const editor = quillRef.current && quillRef.current.getEditor();
//
//    if (editor) {
//      // NOTE: we create a whole new SnowTheme here so we can make use of a
//      // tooltip box with custom click handler.
//      // TODO: is there a lighter-weight way to accomplish this?
//      const newSnowTheme = new SnowTheme(editor, editor.options);
//      newSnowTheme.extendToolbar(editor.theme.modules.toolbar);
//
//      // We replace the ql-action element so we can attach our own click
//      // listener below.
//      const oldElt = newSnowTheme.tooltip.root.querySelector("a.ql-action");
//      const newElt = oldElt.cloneNode(true);
//      oldElt.parentNode.replaceChild(newElt, oldElt);
//
//      newSnowTheme.tooltip.root
//        .querySelector("a.ql-action")
//        .addEventListener("click", evt => {
//          evt.preventDefault();
//          editor.focus();
//          const url = newSnowTheme.tooltip.root.querySelector("input").value;
//          editor.insertEmbed(
//            editor.getSelection().index,
//            "wrappedVideo",
//            url,
//            "user",
//          );
//          newSnowTheme.tooltip.root.className += " ql-hidden";
//        });
//
//      setSnowTheme(newSnowTheme);
//    }
//  }, [quillRef]);
//  const onClickEmbedImage = () => {
//    // TODO: is there a way around using refs here?
//    this.quillFileInput.click();
//  };
//  const onClickEmbedVideo = React.useCallback(() => {
//    snowTheme.tooltip.edit("video");
//  }, [snowTheme]);
//  const QUILL_MODULES = {
//    toolbar: {
//      container: [
//        ["bold", "italic", "underline", "strike"],
//        [{ list: "ordered" }, { list: "bullet" }],
//        [{ header: [1, 2, 3, 4, 5, 6, false] }],
//        [{ color: [] }, { background: [] }],
//        ["link", "image", "video"],
//      ],
//      handlers: {
//        image: onClickEmbedImage,
//        video: onClickEmbedVideo,
//      },
//    },
//  };
//
//  return (
//    <React.Fragment>
//      {prompt && <FieldPrompt>{prompt}</FieldPrompt>}
//      <ReactQuill
//        ref={quillRef}
//        theme="snow"
//        modules={QUILL_MODULES}
//        placeholder={t(
//          `richTextareaFieldPlaceholder${id}`,
//          this.props.placeholder || " ",
//        )}
//        bounds="#content"
//        value={value}
//        onChange={onChange}
//      />
//      <input
//        ref={quillFileInputRef}
//        type="file"
//        onChange={handleAddImage}
//        accept="image/png, image/jpeg"
//      />
//    </React.Fragment>
//  );
//};
//
//export default withTranslation("RichTextareaField")(RichTextareaField);

//let onAddAttachment;

//class RichTextareaField extends Component {
//  constructor(props) {
//    super(props);

//    onAddAttachment = props.onAddAttachment;
//    this.onAddImage = this.onAddImage.bind(this);
//  }

//  onChange(value) {
//    // "Blank" Quill editors actually contain the following markup; we replace
//    // that here with an empty string.
//    if (value === "<p><br></p>") value = "";

//    this.props.onChange(this.props.name, value);
//  }
//}

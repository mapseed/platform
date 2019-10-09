/** @jsx jsx */
import * as React from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import { css, jsx } from "@emotion/core";
import Button from "@material-ui/core/Button";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import loadImage from "blueimp-load-image";

import { PlaceholderPicture } from "../../atoms/icons";
import { CloseButton } from "../../atoms/navigation";

type OwnProps = {
  moduleId: number;
  label: string;
  content: string;
};

type FileFieldProps = OwnProps & WithTranslation;

//const _fixImageOrientation = (canvas, orientation) => {
//  const rotated = document.createElement("canvas");
//  const ctx = rotated.getContext("2d");
//  const width = canvas.width;
//  const height = canvas.height;
//
//  switch (orientation) {
//    case 5:
//    case 6:
//    case 7:
//    case 8:
//      rotated.width = canvas.height;
//      rotated.height = canvas.width;
//      break;
//    default:
//      rotated.width = canvas.width;
//      rotated.height = canvas.height;
//  }
//
//  switch (orientation) {
//    case 1:
//      // nothing
//      break;
//    case 2:
//      // horizontal flip
//      ctx.translate(width, 0);
//      ctx.scale(-1, 1);
//      break;
//    case 3:
//      // 180 rotate left
//      ctx.translate(width, height);
//      ctx.rotate(Math.PI);
//      break;
//    case 4:
//      // vertical flip
//      ctx.translate(0, height);
//      ctx.scale(1, -1);
//      break;
//    case 5:
//      // vertical flip + 90 rotate right
//      ctx.rotate(0.5 * Math.PI);
//      ctx.scale(1, -1);
//      break;
//    case 6:
//      // 90 rotate right
//      ctx.rotate(0.5 * Math.PI);
//      ctx.translate(0, -height);
//      break;
//    case 7:
//      // horizontal flip + 90 rotate right
//      ctx.rotate(0.5 * Math.PI);
//      ctx.translate(width, -height);
//      ctx.scale(-1, 1);
//      break;
//    case 8:
//      // 90 rotate left
//      ctx.rotate(-0.5 * Math.PI);
//      ctx.translate(-width, 0);
//      break;
//    default:
//      break;
//  }
//
//  ctx.drawImage(canvas, 0, 0);
//
//  return rotated;
//};

const fileToCanvas = (file, callback) => {
  loadImage(
    file,
    canvas => {
      callback(canvas);
    },
    {
      maxWidth: 800,
      maxHeight: 800,
      orientation: true,
      canvas: true,
    },
  );

  //  //const fr = new FileReader();
  //
  //  //fr.onloadend = function() {
  //  EXIF.getData(file, function() {
  //    const orientation = EXIF.getTag(this, "Orientation");
  //  });
  //  //const exif = EXIF.readFromBinaryFile(new BinaryFile(this.result));
  //
  //  loadImage(
  //    file,
  //    function(canvas) {
  //      // rotate the image, if needed
  //      const rotated = _fixImageOrientation(canvas, orientation);
  //      callback(rotated);
  //    },
  //    options,
  //  );
  //  //};
  //
  //  //fr.readAsArrayBuffer(file); // read the file
};
const THUMBNAIL_WIDTH = 100;

const CanvasThumbnail = props => {
  const canvasThumbnailRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    if (!canvasThumbnailRef || !canvasThumbnailRef.current) {
      return;
    }

    const scale = THUMBNAIL_WIDTH / props.canvas.width;
    canvasThumbnailRef.current.width = THUMBNAIL_WIDTH;
    canvasThumbnailRef.current.height = props.canvas.height * scale;
    canvasThumbnailRef.current.getContext("2d").scale(scale, scale);
    canvasThumbnailRef.current.getContext("2d").drawImage(props.canvas, 0, 0);
  }, [canvasThumbnailRef]);

  return (
    <div
      css={css`
        position: relative;
        margin: 8px;
        box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.2),
          0px 2px 2px 0px rgba(0, 0, 0, 0.14),
          0px 3px 1px -2px rgba(0, 0, 0, 0.12);
      `}
    >
      <canvas
        css={css`
          border-radius: 4px;
        `}
        ref={canvasThumbnailRef}
      />
      <CloseButton
        css={css`
          position: absolute;
          right: 0;
        `}
        onClick={() => console.log("CLICK")}
      />
    </div>
  );
};

const FileField = (props: FileFieldProps) => {
  const fileFieldRef = React.useRef<HTMLElement>(null);
  const [thumbnails, setThumbnails] = React.useState([]);
  const handleFileChange = React.useCallback(evt => {
    //evt.persist();

    if (evt.target.files && evt.target.files.length > 0) {
      const file = evt.target.files[0];
      //this.setState({ displayFilename: file.name });

      fileToCanvas(file, canvas => {
        setThumbnails(thumbnails.concat(canvas));

        canvas.toBlob(blob => {
          const fileObj = {
            name: this.props.name,
            blob: blob,
            file: canvas.toDataURL("image/jpeg"),
            type: "CO", // cover image
          };

          // TODO: onchange here with file blob contents
        }, "image/jpeg");
      });
    }
  });

  return (
    <div>
      <input
        hidden={true}
        ref={fileFieldRef}
        multiple={true}
        type="file"
        onChange={handleFileChange}
      />
      <Button
        variant="contained"
        color="secondary"
        startIcon={<CloudUploadIcon />}
        onClick={() => {
          fileFieldRef && fileFieldRef.current && fileFieldRef.current.click();
        }}
      >
        {props.label}
      </Button>
      <div
        css={css`
          margin-top: 8px;
          border: 0.5px solid #eee;
          border-radius: 4px;
          display: flex;
          align-items: flex-start;
          flex-wrap: wrap;
        `}
      >
        {thumbnails.length === 0 ? (
          <PlaceholderPicture
            css={css`
              margin: 8px;
            `}
          />
        ) : (
          thumbnails.map(canvas => <CanvasThumbnail canvas={canvas} />)
        )}
      </div>
    </div>
  );
};

export default withTranslation("FileField")(FileField);

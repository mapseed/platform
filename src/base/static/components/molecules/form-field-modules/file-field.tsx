/** @jsx jsx */
import * as React from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import { css, jsx } from "@emotion/core";
import Button from "@material-ui/core/Button";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import loadImage from "blueimp-load-image";
import { FieldProps as FormikFieldProps } from "formik";

import { PlaceholderPicture } from "../../atoms/icons";
import { CloseButton } from "../../atoms/navigation";
import { MapseedFileFieldModule } from "../../../state/ducks/forms";

type FileFieldProps = {
  mapseedField: MapseedFileFieldModule;
} & FormikFieldProps &
  WithTranslation;

type ThumbnailInfo = {
  canvas: HTMLCanvasElement;
  filename: string;
  uploadedDatetime: number;
};

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
};
const THUMBNAIL_WIDTH = 100;

const CanvasThumbnail = ({ canvas, onClickRemoveThumbnail, idx }) => {
  const canvasThumbnailRef = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    if (!canvasThumbnailRef || !canvasThumbnailRef.current) {
      return;
    }

    // TOOD: fix crash on bad file types.
    const scale = THUMBNAIL_WIDTH / canvas.width;
    const height = canvas.height * scale;
    canvasThumbnailRef.current.width = THUMBNAIL_WIDTH;
    canvasThumbnailRef.current.height = height;

    const ctx = canvasThumbnailRef.current.getContext("2d");
    ctx && ctx.scale(scale, scale);
    ctx && ctx.drawImage(canvas, 0, 0);
  }, [canvasThumbnailRef, canvas]);

  return (
    <div
      css={css`
        height: ${canvas.height * (THUMBNAIL_WIDTH / canvas.width)}px;
        position: relative;
        border-radius: 4px;
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
        onClick={() => onClickRemoveThumbnail(idx)}
      />
    </div>
  );
};

const FileField = ({ mapseedField: { label }, t }: FileFieldProps) => {
  const fileFieldRef = React.useRef<HTMLInputElement>(null);
  const [thumbnails, setThumbnails] = React.useState<ThumbnailInfo[]>([]);
  const handleFileChange = React.useCallback(
    evt => {
      if (evt.target.files && evt.target.files.length > 0) {
        Promise.all(
          // NOTE: `evt.target.files` is a FileList object.
          // See: https://developer.mozilla.org/en-US/docs/Web/API/FileList
          [...evt.target.files].map(file => {
            return new Promise(resolve => {
              fileToCanvas(file, canvas => {
                resolve({
                  canvas,
                  filename: file.name,
                  uploadedDatetime: new Date().getTime(),
                } as ThumbnailInfo);

                //canvas.toBlob(blob => {
                //  const fileObj = {
                //    name: file.name,
                //    blob: blob,
                //    file: canvas.toDataURL("image/jpeg"),
                //    type: "CO", // cover image
                //  };

                //  // TODO: onchange here with file blob contents
                //}, "image/jpeg");
              });
            });
          }),
        ).then(newThumbnails => {
          setThumbnails(thumbnails.concat(newThumbnails as ThumbnailInfo[]));
        });
      }
    },
    [thumbnails],
  );
  const onClickRemoveThumbnail = React.useCallback(
    idx => {
      setThumbnails(thumbnails.filter((_, i) => i !== idx));
    },
    [thumbnails],
  );

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
        variant="outlined"
        color="secondary"
        startIcon={<CloudUploadIcon />}
        onClick={() => {
          fileFieldRef && fileFieldRef.current && fileFieldRef.current.click();
        }}
      >
        {label}
      </Button>
      <div
        css={css`
          margin-top: 8px;
          border: 1px dashed #ccc;
          border-radius: 4px;
          display: flex;
          align-items: flex-start;
          flex-wrap: wrap;
          min-height: 88px;
        `}
      >
        {thumbnails.length === 0 ? (
          <PlaceholderPicture
            css={css`
              margin: 8px;
            `}
          />
        ) : (
          thumbnails.map((thumbnail, idx) => (
            <CanvasThumbnail
              key={`${thumbnail.filename}${thumbnail.uploadedDatetime}`}
              idx={idx}
              onClickRemoveThumbnail={idx => onClickRemoveThumbnail(idx)}
              canvas={thumbnail.canvas}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default withTranslation("FileField")(FileField);

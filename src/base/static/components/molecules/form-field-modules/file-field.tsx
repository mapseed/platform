/** @jsx jsx */
import * as React from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import { css, jsx } from "@emotion/core";
import Button from "@material-ui/core/Button";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import loadImage from "blueimp-load-image";

import { PlaceholderPicture } from "../../atoms/icons";
import { CloseButton } from "../../atoms/navigation";
import {
  MapseedFileFieldModule,
  MapseedAttachment,
} from "../../../state/ducks/forms";

type FileFieldProps = {
  mapseedModule: MapseedFileFieldModule;
  setAttachments: (attachments: MapseedAttachment[]) => void;
  attachments: MapseedAttachment[];
} & WithTranslation;

const THUMBNAIL_WIDTH = 100;

const CanvasThumbnail = ({
  attachment: { canvas },
  onClickRemoveThumbnail,
  idx,
}) => {
  const canvasThumbnailRef = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    if (!canvasThumbnailRef || !canvasThumbnailRef.current) {
      return;
    }

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

const FileField = ({
  mapseedModule: { label, id },
  t,
  setAttachments,
  attachments,
}: FileFieldProps) => {
  const fileFieldRef = React.useRef<HTMLInputElement>(null);
  const handleFileChange = React.useCallback(
    evt => {
      if (evt.target.files && evt.target.files.length > 0) {
        Promise.all(
          // NOTE: `evt.target.files` is a FileList object.
          // See: https://developer.mozilla.org/en-US/docs/Web/API/FileList
          [...evt.target.files].map(
            (file): Promise<MapseedAttachment> => {
              return new Promise(resolve => {
                loadImage(
                  file,
                  canvas => {
                    resolve({
                      canvas,
                      blob: file,
                      name: file.name,
                      uploadedDatetime: new Date().getTime(),
                      type: "CO", // cover image
                    } as MapseedAttachment);
                  },
                  {
                    maxWidth: 800,
                    maxHeight: 800,
                    orientation: true,
                    canvas: true,
                  },
                );
              });
            },
          ),
        ).then(newAttachments => {
          setAttachments(newAttachments);
        });
      }
    },
    [setAttachments],
  );
  const onClickRemoveThumbnail = React.useCallback(
    idx => {
      setAttachments(attachments.filter((_, i) => i !== idx));
    },
    [attachments, setAttachments],
  );

  return (
    <div>
      <input
        hidden={true}
        ref={fileFieldRef}
        multiple={true}
        type="file"
        onChange={handleFileChange}
        accept="image/png, image/jpeg"
      />
      <Button
        variant="outlined"
        color="secondary"
        startIcon={<CloudUploadIcon />}
        onClick={() => {
          fileFieldRef && fileFieldRef.current && fileFieldRef.current.click();
        }}
      >
        {t(`fileFieldLabel${id}`, label)}
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
        {attachments.length === 0 ? (
          <PlaceholderPicture
            css={css`
              margin: 8px;
            `}
          />
        ) : (
          attachments.map((attachment, idx) => (
            <CanvasThumbnail
              key={`${attachment.name}${attachment.uploadedDatetime}`}
              idx={idx}
              onClickRemoveThumbnail={idx => onClickRemoveThumbnail(idx)}
              attachment={attachment}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default withTranslation("FileField")(FileField);

/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";
import { withTranslation, WithTranslation } from "react-i18next";

import mq from "../../../../media-queries";
import { EditorButton } from "../atoms/buttons";

type EditorBarProps = {
  isAdmin: boolean;
  isGeocodingBarEnabled: boolean;
  isPlaceDetailEditable: boolean;
  isTagBarEditable: boolean;
  onToggleEditMode: Function;
  isEditModeToggled: boolean;
};

type Props = WithTranslation & EditorBarProps;

const EditorBar: React.FunctionComponent<Props> = props => {
  return (
    <div
      css={css`
        margin-bottom: 25px;

        ${mq[1]} {
          position: absolute;
          top: 0;
          left: 10px;
          width: calc(100% - 20px);
          z-index: 100;
          background-color: #fff;
          padding-bottom: 15px;
          padding-top: 15px;
          border-bottom: 2px solid #ddd;
        }
      `}
    >
      <EditorButton
        className="place-detail-editor-bar__toggle-button"
        css={css`
          float: left;
        `}
        label={props.t("toggleBtn")}
        type="toggle"
        isEditModeToggled={props.isEditModeToggled}
        onClick={props.onToggleEditMode}
      />
      <div
        css={css`
          clear: both;
        `}
      />
    </div>
  );
};

export default withTranslation("EditorBar")(EditorBar);

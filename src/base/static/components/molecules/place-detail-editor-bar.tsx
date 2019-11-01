/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";
import { withTranslation, WithTranslation } from "react-i18next";

import mq from "../../../../media-queries";
import { EditorButton } from "../atoms/buttons";
import constants from "../../constants";

type EditorBarProps = {
  isAdmin: boolean;
  isGeocodingBarEnabled: boolean;
  isPlaceDetailEditable: boolean;
  isTagBarEditable: boolean;
  onToggleEditMode: Function;
  isEditModeToggled: boolean;
  isRightSidebarVisible: boolean;
  layout: string;
};

type Props = WithTranslation & EditorBarProps;

const getLeftOffset = (layout, isRightSidebarVisible) => {
  if (layout === "mobile") {
    return "8px";
  }

  return isRightSidebarVisible ? "calc(45% + 8px)" : "calc(60% + 8px)";
};

const EditorBar: React.FunctionComponent<Props> = props => {
  return (
    <div
      css={css`
        margin-bottom: 25px;

        ${mq[1]} {
          z-index: 100;
          background-color: #fff;
          position: fixed;
          padding-bottom: 15px;
          padding-top: 15px;
          border-bottom: 2px solid #ddd;
          width: calc(40% - 20px);
          left: ${getLeftOffset(props.layout, props.isRightSidebarVisible)};
          top: ${constants.HEADER_HEIGHT}px;
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

/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";

import mq from "../../../../media-queries";
import { EditorButton } from "../atoms/buttons";
import { translate } from "react-i18next";
import i18next, { TranslationFunction } from "i18next";
import constants from "../../constants";

// Types were added to react-i18next is a newer version.
// TODO: Use supplied types when we upgrade i18next deps.
// See: https://github.com/i18next/react-i18next/pull/557/files
type TransProps = {
  i18nKey?: string;
  count?: number;
  parent?: React.ReactNode;
  i18n?: i18next.i18n;
  t?: TranslationFunction;
  defaults?: string;
  values?: {};
  components?: React.ReactNode[];
};

type EditorBarProps = {
  isAdmin: boolean;
  isGeocodingBarEnabled: boolean;
  isPlaceDetailEditable: boolean;
  isTagBarEditable: boolean;
  onToggleEditMode: Function;
  onClickUpdatePlace: Function;
  onClickRemovePlace: Function;
  isEditModeToggled: boolean;
};

type Props = TransProps & EditorBarProps;

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
          right: 10px;
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
      {props.isEditModeToggled &&
        props.isPlaceDetailEditable &&
        props.isAdmin && (
          <EditorButton
            css={css`
              float: right;
            `}
            label={props.t("removeBtn")}
            type="remove"
            onClick={() => {
              if (confirm(props.t("confirmRemove"))) {
                props.onClickRemovePlace();
              }
            }}
          />
        )}
      {props.isEditModeToggled &&
        props.isPlaceDetailEditable && (
          <EditorButton
            css={css`
              float: right;
              margin-right: 8px;
            `}
            label={props.t("saveBtn")}
            type="save"
            onClick={props.onClickUpdatePlace}
          />
        )}
      <div
        css={css`
          clear: both;
        `}
      />
    </div>
  );
};

export default translate("EditorBar")(EditorBar);

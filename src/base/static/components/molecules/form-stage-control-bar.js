/** @jsx jsx */
import React from "react";
import PropTypes from "prop-types";
import { withTranslation, Trans } from "react-i18next";
import { css, jsx } from "@emotion/core";

import { Button } from "../atoms/buttons";
import { ProgressBar } from "../atoms/feedback";
import { RegularText } from "../atoms/typography";

const FormStageControlBar = props => {
  const { currentStage, numStages } = props;
  const advanceOpts = {};
  const retreatOpts = {};
  if (props.currentStage !== props.numStages) {
    advanceOpts.onClick = props.onClickAdvanceStage;
  }
  if (!(props.isSingleCategory && props.currentStage === 1)) {
    retreatOpts.onClick = props.onClickRetreatStage;
  }

  let leftPosition;
  if (props.layout === "desktop" && props.isRightSidebarVisible) {
    leftPosition = "45%";
  } else if (props.layout === "desktop" && !props.isRightSidebarVisible) {
    leftPosition = "60%";
  } else if (props.layout === "mobile") {
    leftPosition = 0;
  }

  return (
    <div
      css={css`
        margin-top: 30px;
        padding-left: 10px;
        padding-top: ${props.layout === "desktop" ? "20px" : "10px"};
        padding-right: 10px;
        padding-bottom: 10px;
        position: fixed;
        bottom: 0;
        box-sizing: border-box;
        width: ${props.layout === "desktop" ? "40%" : "100%"};
        background-color: #fff;
        left: ${leftPosition};
        box-shadow: 0px -3px 2px rgba(0, 0, 0, 0.1);
        height: ${props.layout === "desktop" ? "92px" : "unset"};
        min-height: ${props.layout === "desktop" ? "92px" : "unset"};
      `}
    >
      {props.layout === "desktop" && (
        <RegularText
          css={css`
            margin-left: 8px;
            margin-top: 0;
          `}
          weight="bold"
        >
          <Trans i18nKey="progressCounter">
            Page {{ currentStage }} of {{ numStages }}
          </Trans>
        </RegularText>
      )}
      <div
        css={css`
          display: flex;
          align-items: center;
        `}
      >
        <ProgressBar
          total={props.numStages}
          currentProgress={props.currentStage}
        />
        <Button
          style={{ marginLeft: "8px" }}
          disabled={props.isSingleCategory && props.currentStage === 1}
          variant="flat"
          color="primary"
          size="regular"
          {...retreatOpts}
        >
          <RegularText>{props.t("previousStageLinkLabel")}</RegularText>
        </Button>
        <Button
          style={{ marginLeft: "8px" }}
          disabled={props.currentStage === props.numStages}
          variant="flat"
          color="primary"
          size="regular"
          {...advanceOpts}
        >
          <RegularText>{props.t("nextStageLinkLabel")}</RegularText>
        </Button>
      </div>
    </div>
  );
};

FormStageControlBar.propTypes = {
  currentStage: PropTypes.number.isRequired,
  isRightSidebarVisible: PropTypes.bool.isRequired,
  isSingleCategory: PropTypes.bool.isRequired,
  layout: PropTypes.string.isRequired,
  numStages: PropTypes.number.isRequired,
  onClickAdvanceStage: PropTypes.func.isRequired,
  onClickRetreatStage: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation("FormStageControlBar")(FormStageControlBar);

/** @jsx jsx */
import React from "react";
import PropTypes from "prop-types";
import { withTranslation, Trans } from "react-i18next";
import { css, jsx } from "@emotion/core";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import Button from "@material-ui/core/Button";

import { ProgressBar } from "../atoms/imagery";
import { RegularText } from "../atoms/typography";

const FormStageControlBar = ({
  currentStage,
  numStages,
  isWithStageError,
  layout,
  isRightSidebarVisible,
  onClickAdvanceStage,
  onClickRetreatStage,
  t,
}) => {
  const adjustedStage = currentStage + 1;
  //const isRightSidebarVisible = useSelecto)

  // TODO
  let leftPosition;
  if (layout === "desktop" && isRightSidebarVisible) {
    leftPosition = "45%";
  } else if (layout === "desktop" && !isRightSidebarVisible) {
    leftPosition = "60%";
  } else if (layout === "mobile") {
    leftPosition = 0;
  }

  return (
    <div
      css={css`
        z-index: 100;
        margin-top: 30px;
        padding-left: 10px;
        padding-top: ${layout === "desktop" ? "20px" : "10px"};
        padding-right: 10px;
        padding-bottom: 10px;
        position: fixed;
        bottom: 0;
        box-sizing: border-box;
        width: ${layout === "desktop" ? "40%" : "100%"};
        background-color: #fff;
        left: ${leftPosition};
        box-shadow: 0px -3px 2px rgba(0, 0, 0, 0.1);
        height: ${layout === "desktop" ? "92px" : "unset"};
        min-height: ${layout === "desktop" ? "92px" : "unset"};
      `}
    >
      {layout === "desktop" && (
        <RegularText
          css={css`
            margin-left: 8px;
            margin-top: 0;
          `}
          weight="bold"
        >
          <Trans i18nKey="progressCounter">
            Page {{ adjustedStage }} of {{ numStages }}
          </Trans>
        </RegularText>
      )}
      <div
        css={css`
          display: flex;
          align-items: center;
        `}
      >
        <ProgressBar total={numStages} currentProgress={adjustedStage} />
        <Button
          style={{ marginLeft: "8px" }}
          disabled={adjustedStage === 1}
          variant="outlined"
          color="primary"
          size="medium"
          onClick={onClickRetreatStage}
        >
          <RegularText>{t("previousStageLinkLabel", "Back")}</RegularText>
        </Button>
        <Button
          style={{ marginLeft: "8px" }}
          disabled={adjustedStage === numStages || isWithStageError}
          variant="contained"
          color="primary"
          size="medium"
          endIcon={<ArrowForwardIcon />}
          onClick={onClickAdvanceStage}
        >
          <RegularText>{t("nextStageLinkLabel", "Next")}</RegularText>
        </Button>
      </div>
    </div>
  );
};

FormStageControlBar.propTypes = {
  currentStage: PropTypes.number.isRequired,
  layout: PropTypes.string.isRequired,
  numStages: PropTypes.number.isRequired,
  onClickAdvanceStage: PropTypes.func.isRequired,
  onClickRetreatStage: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation("FormStageControlBar")(FormStageControlBar);

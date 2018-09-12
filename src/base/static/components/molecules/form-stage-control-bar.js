import React from "react";
import PropTypes from "prop-types";
import { translate, Trans } from "react-i18next";

import { Button } from "../atoms/buttons";
import { ProgressBar } from "../atoms/feedback";

import "./form-stage-control-bar.scss";

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

  return (
    <div className="form-stage-control-bar">
      <span className="form-stage-control-bar__stage-counter">
        <Trans i18nKey="progressCounter">
          Page {{ currentStage }} of {{ numStages }}
        </Trans>
      </span>
      <div className="form-stage-control-bar__controls-container">
        <ProgressBar
          total={props.numStages}
          currentProgress={props.currentStage}
        />
        <Button
          style={{ marginLeft: "8px" }}
          disabled={props.isSingleCategory && props.currentStage === 1}
          variant="flat"
          primary
          size="regular"
          {...retreatOpts}
        >
          {props.t("previousStageLinkLabel")}
        </Button>
        <Button
          style={{ marginLeft: "8px" }}
          disabled={props.currentStage === props.numStages}
          variant="flat"
          primary
          size="regular"
          {...advanceOpts}
        >
          {props.t("nextStageLinkLabel")}
        </Button>
      </div>
    </div>
  );
};

FormStageControlBar.propTypes = {
  currentStage: PropTypes.number.isRequired,
  isSingleCategory: PropTypes.bool.isRequired,
  numStages: PropTypes.number.isRequired,
  onClickAdvanceStage: PropTypes.func.isRequired,
  onClickRetreatStage: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default translate("FormStageControlBar")(FormStageControlBar);

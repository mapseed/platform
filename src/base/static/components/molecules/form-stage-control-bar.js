import React from "react";
import PropTypes from "prop-types";
import { translate, Trans } from "react-i18next";

import { Link } from "../atoms/navigation";
import { ProgressBar } from "../atoms/feedback";

import "./form-stage-control-bar.scss";

const FormStageControlBar = props => {
  const { currentStage, numStages } = props;

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
        <Link
          classes="form-stage-control-bar__stage-nav-link"
          onClick={props.onClickRetreatStage}
          disabled={props.isSingleCategory && props.currentStage === 1}
        >
          {props.t("previousStageLinkLabel")}
        </Link>
        <Link
          classes="form-stage-control-bar__stage-nav-link"
          onClick={props.onClickAdvanceStage}
          disabled={props.currentStage === props.numStages}
        >
          {props.t("nextStageLinkLabel")}
        </Link>
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

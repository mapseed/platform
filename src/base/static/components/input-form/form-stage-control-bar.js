import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./form-stage-control-bar.scss";

const FormStageControlBar = props => {
  return (
    <div className="form-stage-control-bar">
      <span className="form-stage-control-bar__stage-counter">
        Page {props.currentStage} of {props.numStages}
      </span>
      <div className="form-stage-control-bar__controls-container">
        <div className="form-stage-control-bar__progress-bar">
          <div
            className="form-stage-control-bar__progress-bar-inner"
            style={{ width: props.currentStage / props.numStages * 100 + "%" }}
          />
        </div>
        <button
          className={classNames("form-stage-control-bar__retreat-stage-btn", {
            "form-stage-control-bar__retreat-stage-btn--disabled":
              props.isSingleCategory && props.currentStage === 1,
          })}
          onClick={props.onClickRetreatStage}
          disabled={props.isSingleCategory && props.currentStage === 1}
        >
          Back
        </button>
        <button
          className={classNames("form-stage-control-bar__advance-stage-btn", {
            "form-stage-control-bar__advance-stage-btn--disabled":
              props.currentStage === props.numStages,
          })}
          onClick={props.onClickAdvanceStage}
          disabled={props.currentStage === props.numStages}
        >
          Next
        </button>
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
};

export default FormStageControlBar;

import React from "react";
import PropTypes from "prop-types";

import "./form-stage-header-bar.scss";

const FormStageHeaderBar = props => {
  return (
    <div className="form-stage-header-bar">
      <h3 className="form-stage-header-bar__header">
        <img className="form-stage-header-bar__icon" src={props.stageConfig.icon_url} />
        {props.stageConfig.header}
      </h3>
      <p className="form-stage-header-bar__description">{props.stageConfig.description}</p>
    </div>
  );
};

FormStageHeaderBar.propTypes = {
  stageConfig: PropTypes.shape({
    header: PropTypes.string,
    description: PropTypes.string,
    icon_url: PropTypes.string,
  })
};

export default FormStageHeaderBar;

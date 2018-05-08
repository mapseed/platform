import React from "react";
import PropTypes from "prop-types";

import { InfoModalTrigger } from "../atoms/feedback";
import { Header3, Paragraph } from "../atoms/typography";

import "./form-stage-header-bar.scss";

const FormStageHeaderBar = props => {
  return (
    <div className="form-stage-header-bar">
      <Header3 classes="form-stage-header-bar__header">
        <img
          className="form-stage-header-bar__icon"
          src={props.stageConfig.icon_url}
        />
        {props.stageConfig.header}
        {props.stageConfig.modal && (
          <InfoModalTrigger
            classes="form-stage-header-bar__modal-trigger"
            modalContent={props.stageConfig.modal}
          />
        )}
      </Header3>
      <Paragraph className="form-stage-header-bar__description">
        {props.stageConfig.description}
      </Paragraph>
    </div>
  );
};

FormStageHeaderBar.propTypes = {
  stageConfig: PropTypes.shape({
    header: PropTypes.string,
    description: PropTypes.string,
    icon_url: PropTypes.string,
    modal: PropTypes.shape({
      headerImgSrc: PropTypes.string,
      header: PropTypes.string,
      body: PropTypes.arrayOf(PropTypes.string),
    }),
  }),
};

export default FormStageHeaderBar;

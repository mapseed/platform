import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import emitter from "../../utils/emitter";

import "./feedback.scss";

const ProgressBar = props => {
  return (
    <div className="mapseed__progress-bar">
      <div
        className="mapseed__progress-bar-inner"
        style={{ width: (props.currentProgress / props.total) * 100 + "%" }}
      />
    </div>
  );
};

ProgressBar.propTypes = {
  currentProgress: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};

const InfoModalTrigger = props => {
  return (
    <button
      type="button"
      className={classNames("mapseed__info-modal-trigger", props.classes)}
      onClick={() => emitter.emit("info-modal:open", props.modalContent)}
    />
  );
};

InfoModalTrigger.propTypes = {
  classes: PropTypes.string,
  modalContent: PropTypes.shape({
    header: PropTypes.string,
    body: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export { ProgressBar, InfoModalTrigger };

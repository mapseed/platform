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

// The source image for an Icon component can be either the name of a
// FontAwesome icon or the url of an image asset. We assume that if the icon
// reference ends with an image filetype, the identifier is an image url.
const Icon = props => {
  const icon = /\.(jpg|jpeg|png|gif|bmp|svg)$/.test(props.icon) ? (
    <img
      src={props.prefix ? `${props.prefix}${props.icon}` : props.icon}
      className={classNames("mapseed__icon", props.classes)}
    />
  ) : (
    <span
      className={classNames(
        `fas ${props.icon}`,
        "mapseed__icon",
        props.classes,
      )}
    />
  );

  return icon;
};

Icon.propTypes = {
  classes: PropTypes.string,
  icon: PropTypes.string.isRequired,
  prefix: PropTypes.string,
};

export { ProgressBar, InfoModalTrigger, Icon };

import React from "react";
import PropTypes from "prop-types";

import "./cover-image.scss";

const CoverImage = props => {
  return (
    <img className="cover-image" src={props.src} alt="Submission cover image" />
  );
};

CoverImage.propTypes = {
  src: PropTypes.string.isRequired,
};

export default CoverImage;

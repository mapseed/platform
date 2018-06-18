import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./imagery.scss";

const Image = ({ ...props }) => {
  return (
    <img
      className={classNames("mapseed__image", props.classes)}
      src={props.src}
      alt={props.alt}
    />
  );
};

Image.propTypes = {
  alt: PropTypes.string.isRequired,
  classes: PropTypes.string,
  src: PropTypes.string.isRequired,
};

Image.defaultProps = {
  alt: "Untitled image",
};

export { Image };

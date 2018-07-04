import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./misc.scss";

const HorizontalRule = props => {
  return <hr className={classNames("mapseed__hr", props.classes)} />;
};

HorizontalRule.propTypes = {
  classes: PropTypes.string,
};

export { HorizontalRule };

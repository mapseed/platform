import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import { place as placeConfig } from "config";

const SubmitterName = props => {
  return (
    <strong className={classNames("submitter-name", props.className)}>
      {props.submitterName || placeConfig.anonymous_name}
    </strong>
  );
};

SubmitterName.propTypes = {
  className: PropTypes.string,
  submitterName: PropTypes.string,
};

export default SubmitterName;

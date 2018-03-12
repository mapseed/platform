import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

const SubmitterName = props => {
  return (
    <strong className={classNames("submitter-name", props.className)}>
      {props.submitter.name || props.placeConfig.anonymous_name}
    </strong>
  );
};

SubmitterName.propTypes = {
  className: PropTypes.string,
  placeConfig: PropTypes.object.isRequired,
  submitter: PropTypes.object.isRequired,
};

export default SubmitterName;

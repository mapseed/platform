import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

const SubmitterName = props => {
  return (
    <strong className={classNames("submitter-name", props.className)}>
      {props.submitterName || props.anonymousName}
    </strong>
  );
};

SubmitterName.propTypes = {
  className: PropTypes.string,
  anonymousName: PropTypes.string.isRequired,
  submitterName: PropTypes.string,
};

export default SubmitterName;

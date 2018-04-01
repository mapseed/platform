import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

const SubmitterName = props => {
  return (
    <strong className={classNames("submitter-name", props.className)}>
      {props.submitter.name || props.anonymousName}
    </strong>
  );
};

SubmitterName.propTypes = {
  className: PropTypes.string,
  anonymousName: PropTypes.string.isRequired,
  submitter: PropTypes.object.isRequired,
};

export default SubmitterName;

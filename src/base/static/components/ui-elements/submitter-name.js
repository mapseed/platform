import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { connect } from "react-redux";

import { placeConfigSelector } from "../../state/ducks/place-config";

const SubmitterName = props => {
  return (
    <strong className={classNames("submitter-name", props.className)}>
      {props.submitterName || props.placeConfig.anonymous_name}
    </strong>
  );
};

SubmitterName.propTypes = {
  className: PropTypes.string,
  placeConfig: PropTypes.object.isRequired,
  submitterName: PropTypes.string,
};

const mapStateToProps = state => ({
  placeConfig: placeConfigSelector(state),
});

export default connect(mapStateToProps)(SubmitterName);

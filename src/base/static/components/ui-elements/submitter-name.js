import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTheme } from "emotion-theming";

import { RegularText } from "../atoms/typography";
import { placeConfigSelector } from "../../state/ducks/place-config";

const SubmitterName = props => {
  return (
    <RegularText>
      {props.submitterName || props.placeConfig.anonymous_name}
    </RegularText>
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

export default withTheme(connect(mapStateToProps)(SubmitterName));

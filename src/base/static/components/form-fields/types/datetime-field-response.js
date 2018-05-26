import React from "react";
import PropTypes from "prop-types";
import moment from "moment";

import constants from "../../../constants";

const DatetimeFieldResponse = props => {
  return (
    <p>
      {moment(props.value).format(
        props.fieldConfig.display_format ||
          constants.DEFAULT_DATE_DISPLAY_FORMAT,
      )}
    </p>
  );
};

DatetimeFieldResponse.propTypes = {
  fieldConfig: PropTypes.object.isRequired,
  value: PropTypes.string.isRequired,
};

export default DatetimeFieldResponse;

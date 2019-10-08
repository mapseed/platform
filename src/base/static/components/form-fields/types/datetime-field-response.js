/** @jsx jsx */
import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { css, jsx } from "@emotion/core";
import { withTheme } from "emotion-theming";

import constants from "../../../constants";

import { RegularText } from "../../atoms/typography";

const DatetimeFieldResponse = props => {
  return (
    <RegularText
      css={css`
        margin: 8px 0 16px 0;
      `}
    >
      {moment(props.value).format(
        props.fieldConfig.display_format ||
          constants.DEFAULT_DATE_DISPLAY_FORMAT,
      )}
    </RegularText>
  );
};

DatetimeFieldResponse.propTypes = {
  fieldConfig: PropTypes.object.isRequired,
  value: PropTypes.string.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withTheme(DatetimeFieldResponse);

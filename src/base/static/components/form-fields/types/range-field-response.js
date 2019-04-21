/** @jsx jsx */
import React from "react";
import PropTypes from "prop-types";
import { css, jsx } from "@emotion/core";
import { withTheme } from "emotion-theming";

import { RegularText } from "../../atoms/typography";

const RangeFieldResponse = props => {
  return (
    <RegularText
      css={css`
        margin: 8px 0 16px 0;
      `}
    >
      {props.value}
    </RegularText>
  );
};

RangeFieldResponse.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  theme: PropTypes.object.isRequired,
};

export default withTheme(RangeFieldResponse);

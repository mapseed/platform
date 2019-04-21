/** @jsx jsx */
import React from "react";
import PropTypes from "prop-types";
import { css, jsx } from "@emotion/core";
import { withTheme } from "emotion-theming";

import { RegularText } from "../../atoms/typography";

const TextFieldResponse = props => {
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

TextFieldResponse.propTypes = {
  value: PropTypes.string.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withTheme(TextFieldResponse);

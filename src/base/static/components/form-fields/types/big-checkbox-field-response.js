/** @jsx jsx */
import React from "react";
import PropTypes from "prop-types";
import { css, jsx } from "@emotion/core";
import { withTheme } from "emotion-theming";

import { RegularText } from "../../atoms/typography";

const BigCheckboxFieldResponse = props => {
  return (
    <ul
      css={css`
        margin: 8px 0 16px 0;
      `}
    >
      {props.labels.map((label, i) => (
        <li key={i}>
          <RegularText>{label}</RegularText>
        </li>
      ))}
    </ul>
  );
};

BigCheckboxFieldResponse.propTypes = {
  labels: PropTypes.array.isRequired,
};

export default withTheme(BigCheckboxFieldResponse);

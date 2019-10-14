/** @jsx jsx */
import React from "react";
import PropTypes from "prop-types";
import { css, jsx } from "@emotion/core";
import { withTheme } from "emotion-theming";

import { RegularText } from "../../atoms/typography";

const TextareaFieldResponse = props => {
  const value = props.value && props.value.split("\n");

  return (
    <React.Fragment>
      {value &&
        value.map((p, idx) => (
          <RegularText
            css={css`
              display: block;
              margin-top: ${idx === 0 ? "16px" : 0};
              margin-bottom: ${idx === value.length - 1 ? "16px" : "8px"};
            `}
            key={idx}
          >
            {p}
          </RegularText>
        ))}
    </React.Fragment>
  );
};

TextareaFieldResponse.propTypes = {
  value: PropTypes.string.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withTheme(TextareaFieldResponse);

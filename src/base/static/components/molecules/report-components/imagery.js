/** @jsx jsx */
import React from "react";
import { css, jsx } from "@emotion/core";
import PropTypes from "prop-types";

import { Image } from "../../atoms/imagery";

const Logo = props => (
  <Image
    src={props.src}
    alt={props.alt}
    css={css`
      height: 48px;
      width: auto;
      margin: 0 16px 0 16px;
    `}
  />
);

Logo.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
};

export { Logo };

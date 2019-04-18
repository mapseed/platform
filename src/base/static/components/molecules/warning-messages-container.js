/** @jsx jsx */
import React from "react";
import PropTypes from "prop-types";
import { css, jsx } from "@emotion/core";
import { translate } from "react-i18next";

import { RegularText, TinyTitle } from "../atoms/typography";

const WarningMessagesContainer = props => {
  return (
    <section
      css={css`
        background-color: #d9534f;
        padding: 8px;
        border: 2px dotted #fff;
        border-radius: 8px;
        color: #fff;
      `}
    >
      <TinyTitle
        css={css`
          margin: 0 0 16px 0;
        `}
      >
        {props.headerMsg}
      </TinyTitle>
      {Array.from(props.errors).map(errorMsg => (
        <RegularText
          css={css`
            color: #fff;
            font-style: italic;
            padding-left: 16px;

            &:before {
              font-family: FontAwesome;
              content: "\\f005"; /* solid star */
              padding-right: 5px;
              font-style: normal;
            }
          `}
          key={errorMsg}
        >
          {props.t(errorMsg)}
        </RegularText>
      ))}
    </section>
  );
};

WarningMessagesContainer.propTypes = {
  errors: PropTypes.instanceOf(Set),
  headerMsg: PropTypes.string,
  t: PropTypes.func.isRequired,
};

export default translate("WarningMessagesContainer")(WarningMessagesContainer);

/** @jsx jsx */
import React from "react";
import { css, jsx } from "@emotion/core";
import PropTypes from "prop-types";

import { SmallTitle, LargeTitle, LargeText } from "../../atoms/typography";

const ReportLargeTitle = props => (
  <LargeTitle
    className={props.className} // TODO - is this needed?
    css={css`
      text-transform: uppercase;
      margin: 0;
    `}
  >
    {props.children}
  </LargeTitle>
);

ReportLargeTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string.isRequired,
};

const ReportSmallTitle = props => (
  <SmallTitle
    className={props.className} // TODO - is this needed?
    css={css`
      margin: 0;
    `}
  >
    {props.children}
  </SmallTitle>
);

ReportSmallTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string.isRequired,
};

const BigStat = props => (
  <LargeTitle
    className={props.className}
    css={css`
      flex: 1;
      font-size: 3rem;
      text-align: center;
    `}
  >
    {props.children}
  </LargeTitle>
);

BigStat.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

const ReportBodyText = props => (
  <LargeText
    css={css`
      display: block;
      margin: 0 0 16px 40px;
    `}
  >
    {props.children}
  </LargeText>
);

ReportBodyText.propTypes = {
  children: PropTypes.node.isRequired,
};

export { ReportLargeTitle, ReportSmallTitle, BigStat, ReportBodyText };

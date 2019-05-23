/** @jsx jsx */
import React from "react";
import { css, jsx } from "@emotion/core";
import PropTypes from "prop-types";

import { Image } from "../../atoms/imagery";

const Page = props => (
  <div
    css={css`
      width: 1063px;
      height: 1375px;
      margin: 0 auto;
      color: #444;
    `}
  >
    {props.children}
  </div>
);

Page.propTypes = {
  children: PropTypes.node.isRequired,
};

const PageBody = props => (
  <section
    css={css`
      position: relative;
      height: 1311px;
      padding: 20px 20px 20px 0;
      box-sizing: border-box;
    `}
  >
    {props.children}
  </section>
);

PageBody.propTypes = {
  children: PropTypes.node.isRequired,
};

const PageHeader = props => (
  <header
    css={css`
      height: 64px;
      max-height: 64px;
      display: flex;
      align-items: center;
      background-color: ${props.backgroundColor || "#fff"};
      border-top: 3px solid #ef5f46;
    `}
  >
    <Image
      css={css`
        height: 48px;
        margin-left: 8px;
      `}
      src={props.logoSrc}
      alt="Logo"
    />
    {props.children}
  </header>
);

PageHeader.propTypes = {
  backgroundColor: PropTypes.string,
  children: PropTypes.node.isRequired,
  logoSrc: PropTypes.string.isRequired,
};

const PageFooter = props => (
  <footer
    css={css`
      display: flex;
      align-items: center;
      justify-content: center;
      height: 48px;
    `}
  >
    {props.children}
  </footer>
);

PageFooter.propTypes = {
  children: PropTypes.node.isRequired,
};

export { Page, PageHeader, PageBody, PageFooter };

/** @jsx jsx */
import React from "react";
import { css, jsx } from "@emotion/core";
import PropTypes from "prop-types";

import { FontAwesomeIcon } from "../../atoms/imagery";

const FloatedRight = props => (
  <div
    className={props.className}
    css={css`
      width: ${props.width};
      float: right;
      margin-left: auto;
    `}
  >
    {props.children}
  </div>
);

FloatedRight.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  width: PropTypes.string,
};

const FlexCentered = props => (
  <div
    className={props.className}
    css={css`
      display: flex;
      align-items: center;
    `}
  >
    {props.children}
  </div>
);

FlexCentered.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const FlexItem = props => (
  <div
    className={props.className}
    css={css`
      flex: ${props.flex};
      margin-bottom: 8px;
    `}
  >
    {props.children}
  </div>
);

FlexItem.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  flex: PropTypes.string.isRequired,
};

const ContentWithFontAwesomeIcon = props => (
  <FlexCentered
    css={css`
      margin-bottom: 16px;
    `}
  >
    <FlexItem flex="1">
      <FontAwesomeIcon
        fontSize="1.4rem"
        color={props.color}
        faClassname={props.faClassname}
      />
    </FlexItem>
    <FlexItem flex="8">{props.children}</FlexItem>
  </FlexCentered>
);

ContentWithFontAwesomeIcon.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.string,
  faClassname: PropTypes.string.isRequired,
};

const MainPanel = props => (
  <section
    css={css`
      width: 640px;
      height: calc(100% - 48px);
    `}
  >
    {props.children}
  </section>
);

MainPanel.propTypes = {
  children: PropTypes.node.isRequired,
};

const MainPanelSection = props => (
  <div
    css={css`
      margin-bottom: 36px;
    `}
  >
    {props.children}
  </div>
);

MainPanelSection.propTypes = {
  children: PropTypes.node.isRequired,
};

const RightSidebar = props => (
  <section
    css={css`
      float: right;
      height: calc(100% - 32px);
      padding: 16px;
      width: 350px;
      background-image: url(/static/css/images/topography-background.svg);
      background-color: rgba(229, 207, 207, 0.4);
      border-top: 3px solid #ef5f46;
    `}
  >
    {props.children}
  </section>
);

RightSidebar.propTypes = {
  children: PropTypes.node.isRequired,
};

const SidebarSection = props => (
  <div
    css={css`
      margin-top: 16px;
    `}
  >
    {props.children}
  </div>
);

SidebarSection.propTypes = {
  children: PropTypes.node.isRequired,
};

const SidebarResourceList = props => (
  <div
    css={css`
      padding: 16px 0 0 16px;
    `}
  >
    {props.children}
  </div>
);

SidebarResourceList.propTypes = {
  children: PropTypes.node.isRequired,
};

export {
  ContentWithFontAwesomeIcon,
  FloatedRight,
  FlexCentered,
  FlexItem,
  MainPanel,
  MainPanelSection,
  RightSidebar,
  SidebarSection,
  SidebarResourceList,
};

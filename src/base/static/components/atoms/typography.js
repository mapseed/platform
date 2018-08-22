import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styled from "react-emotion";

import "./typography.scss";

const WarningMessage = ({ children, ...props }) => {
  return (
    <p className="mapseed__warning-msg" {...props}>
      {children}
    </p>
  );
};

WarningMessage.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
};

const Paragraph = ({ children, ...props }) => {
  return (
    <p className={classNames("mapseed__paragraph", props.classes)} {...props}>
      {children}
    </p>
  );
};

Paragraph.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.string,
};

const Header1 = ({ children, ...props }) => {
  return (
    <h1 className={classNames("mapseed__header1", props.classes)} {...props}>
      {children}
    </h1>
  );
};

Header1.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.string,
};

const Header2 = ({ children, ...props }) => {
  return (
    <h2 className={classNames("mapseed__header2", props.classes)} {...props}>
      {children}
    </h2>
  );
};

Header2.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.string,
};

const Header3 = ({ children, ...props }) => {
  return (
    <h3 className={classNames("mapseed__header3", props.classes)} {...props}>
      {children}
    </h3>
  );
};

Header3.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.string,
};

const Header4 = ({ children, ...props }) => {
  return (
    <h4 className={classNames("mapseed__header4", props.classes)} {...props}>
      {children}
    </h4>
  );
};

Header4.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.string,
};

const Header5 = ({ children, ...props }) => {
  return (
    <h5 className={classNames("mapseed__header5", props.classes)} {...props}>
      {children}
    </h5>
  );
};

Header5.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.string,
};

const Header6 = ({ children, ...props }) => {
  return (
    <h6 className={classNames("mapseed__header6", props.classes)} {...props}>
      {children}
    </h6>
  );
};

Header6.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.string,
};

const SmallText = styled("span")(props => ({
  fontWeight: "normal",
  fontSize: "0.875em",
}));

const Link = styled("a")(props => ({
  cursor: "pointer",
  textDecoration: "none",
  color: props.theme.brand.primary,
  textTransform: props.theme.text.textTransform,
  fontFamily: props.theme.text.fontFamily,

  "&:hover": {
    textDecoration: "none",
    color: props.theme.bg.light,
  },
}));

Link.propTypes = {
  href: PropTypes.string.isRequired,
};

export {
  SmallText,
  Link,
  WarningMessage,
  Paragraph,
  Header1,
  Header2,
  Header3,
  Header4,
  Header5,
  Header6,
};

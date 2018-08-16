import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

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

const Link = ({ children, ...props }) => {
  return (
    <a
      className={classNames("mapseed__link", props.classes, {
        "mapseed__link--unstyled": props.variant.includes("unstyled"),
        "mapseed__link--rounded": props.variant.includes("rounded"),
        "mapseed__link--raised": props.variant.includes("raised"),
        "mapseed__link--depressable": props.variant.includes("depressable"),
        "mapseed__link--color-primary": props.color === "primary",
        "mapseed__link--color-secondary": props.color === "secondary",
        "mapseed__link--color-accent": props.color === "accent",
        "mapseed__link--size-large": props.size === "large",
        "mapseed__link--size-regular": props.size === "regular",
        "mapseed__link--disabled": !!props.disabled,
      })}
      href={props.href}
      {...props}
    >
      {children}
    </a>
  );
};

Link.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.string,
  disabled: PropTypes.bool,
  variant: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.string,
  href: PropTypes.string.isRequired,
};

Link.defaultProps = {
  variant: "unstyled",
};

export {
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

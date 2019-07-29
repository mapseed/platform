import PropTypes from "prop-types";
import React from "react";
import classNames from "classnames";
import styled from "@emotion/styled";
import moment from "moment";
import { Link } from "react-router-dom";
import { darken } from "@material-ui/core/styles/colorManipulator";

import "./typography.scss";

// Legacy Text:
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

// Legacy Titles:
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

// Title atoms:
const LargeTitle = styled("h1")(props => ({
  fontSize: "2rem",
  fontFamily: props.theme.text.titleFontFamily,
  margin: "16px 0 8px 0",
}));

const RegularTitle = styled("h2")(props => ({
  fontSize: "1.8rem",
  fontFamily: props.theme.text.titleFontFamily,
  margin: "16px 0 8px 0",
}));
const SmallTitle = styled("h3")(props => ({
  fontSize: "1.5rem",
  fontFamily: props.theme.text.titleFontFamily,
  margin: "16px 0 8px 0",
}));
const TinyTitle = styled("h4")(props => ({
  fontSize: "1.1rem",
  fontFamily: props.theme.text.titleFontFamily,
  margin: "16px 0 8px 0",
}));

// TODO: Other label types.
const ExtraLargeLabel = styled("label")(props => ({
  fontSize: "2rem",
  fontFamily: props.theme.text.bodyFontFamily,
}));

const LargeLabel = styled("label")(props => ({
  fontSize: "1.5rem",
  fontFamily: props.theme.text.bodyFontFamily,
}));

const RegularLabel = styled("label")(props => ({
  fontSize: "1rem",
  lineHeight: "1.2rem",
  fontFamily: props.theme.text.bodyFontFamily,
}));

const SmallLabel = styled("label")(props => ({
  fontSize: "0.7rem",
  fontFamily: props.theme.text.bodyFontFamily,
}));

RegularLabel.propTypes = {
  styles: PropTypes.object,
};

// Text atoms:
const textHandler = (props, styles) => {
  styles.fontFamily = props.fontFamily || props.theme.text.bodyFontFamily;
  styles.fontWeight = 200;
  styles.display = props.display || "inline";
  styles.textAlign = props.textAlign || "left";

  switch (props.weight) {
    case "bold":
      styles.fontWeight = 800;
      break;
    case "black":
      styles.fontWeight = 900;
      break;
  }

  if (props.noWrap) {
    styles.whiteSpace = "nowrap";
  }

  if (props.textTransform === "uppercase") {
    styles.textTransform = "uppercase";
  }

  if (props.color === "tertiary") {
    styles.color = props.theme.text.tertiary;
  }

  return styles;
};
const LargeText = styled("span")(props => {
  const styles = {
    fontSize: "1.5rem",
    lineHeight: "1.7rem",
    fontWeight: "normal",
  };
  return textHandler(props, styles);
});

const RegularText = styled("span")(props => {
  const styles = {
    fontSize: "1rem",
    lineHeight: "1.3rem",
    fontWeight: "normal",
  };
  return textHandler(props, styles);
});

const SmallText = styled("span")(props => {
  const styles = {
    fontSize: "0.75rem",
    lineHeight: "1.0rem",
    fontWeight: "normal",
  };

  return textHandler(props, styles);
});

const MicroText = styled("span")(props => {
  const styles = {
    fontSize: "0.6rem",
    lineHeight: "0.8rem",
    fontWeight: "normal",
  };

  return textHandler(props, styles);
});

const DashboardText = styled("p")(props => ({
  margin: 0,
  padding: 0,
  textAlign: props.textAlign,
  fontFamily: props.weight === "bold" ? "PTSansBold" : "PTSans",
  fontSize: props.fontSize,
  color: props.color,
  textTransform: props.textTransform,
  marginTop: "4px",
  marginBottom: "4px",
  textOverflow: "ellipsis",
  overflow: "hidden",
}));

DashboardText.defaultProps = {
  color: "#222",
  textAlign: "center",
  weight: "regular",
  textTransform: "none",
  fontSize: "1rem",
};

const ExternalLink = styled("a")({
  textDecoration: "none",
  wordBreak: "break-all",

  "&:hover": {
    cursor: "pointer",
  },
});

const InternalLink = styled(props => {
  return (
    <Link to={props.href} className={props.className} {...props}>
      {props.children}
    </Link>
  );
})(props => ({
  cursor: "pointer",
  textDecoration: "none",
  color: props.theme.brand.primary,
  textTransform: props.theme.text.textTransform,
  fontFamily: props.theme.text.bodyFontFamily,

  "&:hover": {
    textDecoration: "none",
  },
}));

Link.propTypes = {
  href: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

const Time = props => <time>{moment(props.time).fromNow()}</time>;

Time.propTypes = {
  time: PropTypes.string.isRequired,
};

// TODO: Dynamic badge border radius and padding to match content.
const Badge = styled("span")(props => ({
  backgroundColor: props.color,
  color: darken(props.color, 0.8),
  padding: "2px 12px 2px 12px",
  borderRadius: "14px",
}));

Badge.defaultProps = {
  color: "#bbb",
};

Badge.propTypes = {
  color: PropTypes.string.isRequired,
};

export {
  ExternalLink,
  InternalLink,
  Paragraph,
  Header1,
  Header2,
  Header3,
  Header4,
  Header5,
  Header6,
  ExtraLargeLabel,
  LargeLabel,
  RegularLabel,
  SmallLabel,
  LargeTitle,
  RegularTitle,
  SmallTitle,
  TinyTitle,
  LargeText,
  RegularText,
  SmallText,
  MicroText,
  DashboardText,
  Time,
  Badge,
};

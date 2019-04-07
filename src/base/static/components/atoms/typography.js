import PropTypes from "prop-types";
import React from "react";
import classNames from "classnames";
import styled from "@emotion/styled";
import moment from "moment";
import { Link } from "react-router-dom";

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
  fontFamily: props.theme.text.headerFontFamily,
  margin: "16px 0",
}));

const RegularTitle = styled("h2")(props => ({
  fontSize: "1.8rem",
  fontFamily: props.theme.text.headerFontFamily,
  margin: "16px 0",
}));
const SmallTitle = styled("h3")(props => ({
  fontSize: "1.5rem",
  fontFamily: props.theme.text.headerFontFamily,
  margin: "16px 0",
}));
const TinyTitle = styled("h4")(props => ({
  fontSize: "1.1rem",
  fontFamily: props.theme.text.headerFontFamily,
  margin: "16px 0",
}));

// TODO: Other label types.
const ExtraLargeLabel = styled("label")(props => ({
  fontSize: "2rem",
  fontFamily: props.theme.text.headerFontFamily,
}));

const LargeLabel = styled("label")(props => ({
  fontSize: "1.5rem",
  fontFamily: props.theme.text.headerFontFamily,
}));

const RegularLabel = styled("label")(props => ({
  fontSize: "1rem",
  lineHeight: "1.2rem",
  fontFamily: props.theme.text.headerFontFamily,
}));

const SmallLabel = styled("label")(props => ({
  fontSize: "0.7rem",
  fontFamily: props.theme.text.headerFontFamily,
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
      styles.fontWeight = 600;
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
  };
  return textHandler(props, styles);
});

const RegularText = styled("span")(props => {
  const styles = {
    fontSize: "1rem",
  };
  return textHandler(props, styles);
});

const SmallText = styled("span")(props => {
  const styles = {
    fontSize: "0.75rem",
    fontWeight: "normal",
  };

  return textHandler(props, styles);
});

const MicroText = styled("span")(props => {
  const styles = {
    fontSize: "0.6rem",
    fontWeight: "normal",
  };

  return textHandler(props, styles);
});

const ExternalLink = styled("a")({
  textDecoration: "none",

  "&:hover": {
    cursor: "pointer"
  }
})

const InternalLink = styled(props => {
  return (
    <Link
      to={props.href}
      rel={props.rel}
      className={props.className}
      {...props}
    >
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
    color: props.theme.bg.light,
  },
}));

Link.propTypes = {
  href: PropTypes.string.isRequired,
  rel: PropTypes.string,
};

const Time = props => <time>{moment(props.time).fromNow()}</time>;

Time.propTypes = {
  time: PropTypes.string.isRequired,
};

export {
  ExternalLink,
  InternalLink,
  WarningMessage,
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
  Time,
};

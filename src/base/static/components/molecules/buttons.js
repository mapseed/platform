import React from "react";
import styled from "react-emotion";
import { Button } from "../atoms/buttons";
import { Link } from "../atoms/typography";
import mq from "../../../../media-queries";

const NavButton = styled(props => {
  return (
    <Button
      className={props.className}
      color={props.color}
      variant={props.variant}
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  );
})(props => ({
  fontFamily: props.theme.text.navBarFontFamily,
  fontWeight: 600,
  marginLeft: "4px",
  marginRight: "4px",
  fontSize: "0.9rem",

  [mq[0]]: {
    width: "100%",
  },
}));

const CloseButton = styled(props => (
  <Link className={props.className} onClick={props.onClick}>
    {"✕"}
  </Link>
))({
  color: "red",
  fontSize: "1.5em",
});

export { NavButton, CloseButton };

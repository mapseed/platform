import React from "react";
import styled from "@emotion/styled";
import { Button } from "../atoms/buttons";
import mq from "../../../../media-queries";

const NavButton = styled(props => {
  return (
    <Button
      className={props.className}
      color={props.color}
      ariaLabel={props.ariaLabel}
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

export { NavButton };

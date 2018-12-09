import React from "react";
import styled from "react-emotion";
import { Link } from "../atoms/typography";
import mq from "../../../../media-queries";

const NavLink = styled(props => (
  <Link href={props.href} rel="internal" className={props.className}>
    {props.children}
  </Link>
))(props => ({
  display: "flex",
  alignItems: "center",
  textDecoration: "none",

  [mq[1]]: {
    height: props.height,
    borderLeft:
      props.position > 0 ? `solid 1px ${props.theme.text.tertiary}` : "none",
  },
}));

export { NavLink };

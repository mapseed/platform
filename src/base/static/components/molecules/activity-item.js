import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";

import { UserAvatar } from "../atoms/imagery";
import { SmallText, Link } from "../atoms/typography";

const ActivityLink = styled("a")(props => ({
  textDecoration: "none",
  fontFamily: props.theme.text.bodyFontFamily,
  lineHeight: "1.1em",
}));

const BasicActivityItem = props => (
  <ActivityLink href={props.url} rel="internal">
    <li className={props.className}>
      <div style={{ position: "absolute", top: "13px", left: "10px" }}>
        <UserAvatar />
      </div>
      <div style={{ paddingLeft: "40px", paddingTop: "10px" }}>
        <div>
          <SmallText weight="black">{props.submitterName} </SmallText>
          <SmallText> {props.actionText}: </SmallText>
        </div>
        <div>
          <SmallText>{props.title}</SmallText>
        </div>
      </div>
    </li>
  </ActivityLink>
);

BasicActivityItem.propTypes = {
  actionText: PropTypes.string.isRequired,
  className: PropTypes.string,
  submitterName: PropTypes.string.isRequired,
  title: PropTypes.string,
  url: PropTypes.string.isRequired,
};

const ActivityItem = styled(BasicActivityItem)(props => ({
  position: "relative",
  listStyle: "none",
  borderBottom: "1px solid #888",
  "&:hover": {
    color: "#fff",
    backgroundColor: props.theme.brand.accent,
  },
}));

export default ActivityItem;

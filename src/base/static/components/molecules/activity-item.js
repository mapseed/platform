import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";

import { UserAvatar } from "../atoms/imagery";
import { SmallText, Link } from "../atoms/typography";

const ActivityItemContainer = styled("div")(props => ({
  position: "relative",
  listStyle: "none",
  borderBottom: "1px solid #888",
  paddingRight: "10px",
  "&:hover": {
    color: "#fff",
    backgroundColor: props.theme.brand.accent,
  },
}));

const UserAvatarContainer = styled("div")(props => ({
  position: "absolute",
  top: "13px",
  left: "10px",
}));

const ActionTextContainer = styled("div")(props => ({
  paddingLeft: "40px",
  paddingTop: "10px",
}));

const ActivityItem = props => (
  <ActivityItemContainer>
    <Link href={props.url} rel="internal">
      <li className={props.className}>
        <UserAvatarContainer>
          <UserAvatar />
        </UserAvatarContainer>
        <ActionTextContainer>
          <SmallText weight="black">{props.submitterName} </SmallText>
          <SmallText> {props.actionText}: </SmallText>
          <SmallText>{props.title}</SmallText>
        </ActionTextContainer>
      </li>
    </Link>
  </ActivityItemContainer>
);

ActivityItem.propTypes = {
  actionText: PropTypes.string.isRequired,
  className: PropTypes.string,
  submitterName: PropTypes.string.isRequired,
  title: PropTypes.string,
  url: PropTypes.string.isRequired,
};

export default ActivityItem;

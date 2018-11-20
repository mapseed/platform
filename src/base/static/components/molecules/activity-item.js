import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";

import { UserAvatar } from "../atoms/imagery";
import { RegularText, Link } from "../atoms/typography";

const ActivityItemContainer = styled("div")(props => ({
  position: "relative",
  listStyle: "none",
  borderBottom: "1px solid #888",
  paddingRight: "10px",
}));

const ActivityLink = styled(props => {
  return (
    <Link className={props.className} href={props.href} rel="internal">
      {props.children}
    </Link>
  );
})(props => ({
  display: "block",
  textTransform: "none",
  "&:hover": {
    backgroundColor: props.theme.brand.accent,
    color: "#fff",
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
    <ActivityLink href={props.url}>
      <li className={props.className}>
        <UserAvatarContainer>
          <UserAvatar />
        </UserAvatarContainer>
        <ActionTextContainer>
          <RegularText weight="black">{props.submitterName} </RegularText>
          <RegularText> {props.actionText}: </RegularText>
          <RegularText>{props.title}</RegularText>
        </ActionTextContainer>
      </li>
    </ActivityLink>
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

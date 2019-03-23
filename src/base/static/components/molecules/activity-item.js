import React from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";

import { UserAvatar } from "../atoms/imagery";
import { RegularText, Link } from "../atoms/typography";

const ActivityItemContainer = styled("div")({
  position: "relative",
  listStyle: "none",
  borderBottom: "1px solid #888",
});

const ActivityLink = styled(props => {
  return (
    <Link
      className={props.className}
      href={props.href}
      rel="internal"
      router={props.router}
    >
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

const UserAvatarContainer = styled("div")({
  position: "absolute",
  top: "13px",
  left: "10px",
});

const ActionTextContainer = styled("div")({
  padding: "10px 8px 10px 40px",
});

const ActivityItem = props => (
  <ActivityItemContainer>
    <ActivityLink href={props.url} router={props.router}>
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
  router: PropTypes.instanceOf(Backbone.Router).isRequired,
  submitterName: PropTypes.string.isRequired,
  title: PropTypes.string,
  url: PropTypes.string.isRequired,
};

export default ActivityItem;

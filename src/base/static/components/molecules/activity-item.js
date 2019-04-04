/** @jsx jsx */
import * as React from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import { jsx } from "@emotion/core";

import { UserAvatar } from "../atoms/imagery";
import { RegularText, Link } from "../atoms/typography";

const UserAvatarContainer = styled("div")({
  position: "absolute",
  top: "13px",
  left: "10px",
});

const ActionTextContainer = styled("div")({
  padding: "10px 8px 10px 40px",
});

const ActivityItem = props => (
  <li
    css={{
      position: "relative",
      listStyle: "none",
      borderBottom: "1px solid #888",
    }}
  >
    <Link
      css={theme => ({
        display: "block",
        textTransform: "none",
        "&:hover": {
          backgroundColor: theme.brand.accent,
          color: "#fff",
        },
      })}
      href={props.url}
      rel="internal"
    >
      <UserAvatarContainer>
        <UserAvatar />
      </UserAvatarContainer>
      <ActionTextContainer>
        <RegularText weight="black">{props.submitterName} </RegularText>
        <RegularText> {props.actionText}: </RegularText>
        <RegularText>{props.title}</RegularText>
      </ActionTextContainer>
    </Link>
  </li>
);

ActivityItem.propTypes = {
  actionText: PropTypes.string.isRequired,
  //router: PropTypes.instanceOf(Backbone.Router).isRequired,
  submitterName: PropTypes.string.isRequired,
  title: PropTypes.string,
  url: PropTypes.string.isRequired,
};

export default ActivityItem;

import React from "react";
import PropTypes from "prop-types";

import { UserAvatar } from "../atoms/imagery";
import { SmallText } from "../atoms/typography";

const ActivityItem = props => (
  <li
    style={{
      position: "relative",
      listStyle: "none",
      borderBottom: "1px solid #888",
    }}
  >
    <a href={props.url} rel="internal">
      <div style={{ position: "absolute", top: "10px", left: "10px" }}>
        <UserAvatar />
      </div>
      <div style={{ paddingLeft: "40px", paddingTop: "10px" }}>
        {props.title}
      </div>
    </a>
  </li>
);

ActivityItem.propTypes = {};

export default ActivityItem;

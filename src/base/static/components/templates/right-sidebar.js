import React from "react";
import PropTypes from "prop-types";

import StoryNavigator from "../organisms/story-navigator";

const RightSidebar = props => {
  let component;
  // TODO: Support multiple simultaneous right sidebar components.
  if (props.component === "StorySidebar") {
    component = <StoryNavigator {...props} />;
  }

  return <div className="right-sidebar">{component}</div>;
};

RightSidebar.propTypes = {
  component: PropTypes.string.isRequired,
};

RightSidebar.defaultProps = {
  component: "StorySidebar",
};

export default RightSidebar;

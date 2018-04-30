import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./story-chapter.scss";

const StoryChapter = props => {
  return (
    <a
      className={classNames("story-chapter", {
        "story-chapter--selected": props.isSelected,
      })}
      href={"/" + props.placeUrl}
      rel="internal"
    >
      <img className="story-chapter__icon" src={props.iconUrl} />
      <span
        className={classNames("story-chapter__title", {
          "story-chapter__title--selected": props.isSelected,
        })}
      >
        {props.title}
      </span>
    </a>
  );
};

StoryChapter.propTypes = {
  placeUrl: PropTypes.string.isRequired,
  iconUrl: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
};

export default StoryChapter;

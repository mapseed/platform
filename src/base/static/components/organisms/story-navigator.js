import React, { useState, useEffect } from "react";

import PropTypes from "prop-types";
import { connect } from "react-redux";
import styled from "@emotion/styled";
import { withRouter } from "react-router-dom";

import {
  storyConfigSelector,
  storyConfigPropType,
} from "../../state/ducks/story-config";
import { placeConfigSelector } from "../../state/ducks/place-config";
import { placesPropType } from "../../state/ducks/places";
import { uiVisibilitySelector, updateUIVisibility } from "../../state/ducks/ui";

import StoryChapter from "../molecules/story-chapter";
import { TinyTitle, Paragraph } from "../atoms/typography";

import "./story-navigator.scss";

const StoryTitle = styled(TinyTitle)({
  margin: "0 0 8px 0",
  paddingLeft: "10px",
});

const StoryNavigator = props => {
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  useEffect(() => {
    const placeId = parseInt(props.history.location.pathname.split("/")[2]);
    if (placeId) {
      setCurrentPlaceId(placeId);
    }
    const unlisten = props.history.listen(location => {
      const placeId = parseInt(location.pathname.split("/")[2]);
      if (placeId) {
        setCurrentPlaceId(placeId);
      }
    });

    return unlisten;
  });

  // The currentStory is defined as the first story corresponding to the place
  // in the detail view, OR it's the first story in the storyConfig
  const currentStory =
    props.storyConfig.find(story => {
      return story.chapters.find(chapter => chapter.placeId === currentPlaceId);
    }) || props.storyConfig[0];

  return (
    <div className="story-navigator">
      {currentStory &&
        currentStory.header && <StoryTitle>{currentStory.header}</StoryTitle>}
      {currentStory &&
        currentStory.description && (
          <Paragraph className="story-navigator__description">
            {currentStory.description}
          </Paragraph>
        )}
      <hr />
      {currentStory &&
        currentStory.chapters.map(chapter => {
          const place = props.places.find(
            place => place.id === chapter.placeId,
          );
          return (
            <StoryChapter
              key={chapter.placeId}
              title={place.title}
              iconUrl={
                chapter.iconUrl ||
                props.placeConfig.place_detail.find(
                  config => config.category === place.location_type,
                ).icon_url
              }
              isSelected={currentPlaceId === chapter.placeId}
              placeUrl={`${place.clientSlug}/${chapter.placeId}`}
            />
          );
        })}
    </div>
  );
};

StoryNavigator.propTypes = {
  history: PropTypes.object.isRequired,
  isRightSidebarVisible: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired,
  storyConfig: storyConfigPropType,
  placeConfig: PropTypes.shape({
    place_detail: PropTypes.array.isRequired,
  }).isRequired,
  places: placesPropType.isRequired,
  updateUIVisibility: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isRightSidebarVisible: uiVisibilitySelector("rightSidebar", state),
  storyConfig: storyConfigSelector(state),
  placeConfig: placeConfigSelector(state),
});

const mapDispatchToProps = dispatch => ({
  updateUIVisibility: (componentName, isVisible) =>
    dispatch(updateUIVisibility(componentName, isVisible)),
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(StoryNavigator),
);

import React, { Component } from "react";
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

import { translate } from "react-i18next";

import "./story-navigator.scss";

const StoryTitle = styled(TinyTitle)({
  margin: "0 0 8px 0",
  paddingLeft: "10px",
});

class StoryNavigator extends Component {
  state = {
    currentPlaceId: null, // number
  };

  componentDidMount() {
    const placeId = parseInt(
      this.props.history.location.pathname.split("/")[2],
    );
    if (placeId) {
      this.setState({
        currentPlaceId: placeId,
      });
    }
    // TODO: instead of parsing and listening to the url, we should be reading
    // the "currentPlaceId" from redux
    this.unlisten = this.props.history.listen(location => {
      const placeId = parseInt(location.pathname.split("/")[2]);
      if (placeId) {
        this.setState({
          currentPlaceId: placeId,
        });
      }
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  render() {
    // The currentStory is defined as the first story corresponding to the place
    // in the detail view, OR it's the first story in the storyConfig
    const currentStory =
      this.props.storyConfig.find(story => {
        return story.chapters.find(
          chapter => chapter.placeId === this.state.currentPlaceId,
        );
      }) || this.props.storyConfig[0];

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
            const place = this.props.places.find(
              place => place.id === chapter.placeId,
            );
            return (
              <StoryChapter
                key={chapter.placeId}
                title={place.title}
                iconUrl={
                  chapter.iconUrl ||
                  this.props.placeConfig.place_detail.find(
                    config => config.category === place.location_type,
                  ).icon_url
                }
                isSelected={this.state.currentPlaceId === chapter.placeId}
                placeUrl={`${place.clientSlug}/${chapter.placeId}`}
              />
            );
          })}
      </div>
    );
  }
}

StoryNavigator.propTypes = {
  history: PropTypes.object.isRequired,
  isRightSidebarVisible: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired,
  storyConfig: storyConfigPropType,
  placeConfig: PropTypes.shape({
    place_detail: PropTypes.array.isRequired,
  }).isRequired,
  places: placesPropType.isRequired,
  t: PropTypes.func.isRequired,
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
  )(translate("StoryNavigator")(StoryNavigator)),
);

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import styled from "@emotion/styled";
import { withRouter } from "react-router-dom";

import { storyConfigSelector } from "../../state/ducks/story-config";
import { placeConfigSelector } from "../../state/ducks/place-config";
import {
  placesPropType,
  placesLoadStatusSelector,
} from "../../state/ducks/places";
import { uiVisibilitySelector, updateUIVisibility } from "../../state/ducks/ui";

import { hydrateStoriesFromConfig } from "../../utils/story-utils";
import Immutable from "immutable";
import Spinner from "react-spinner";

import StoryChapter from "../molecules/story-chapter";
import { TinyTitle, Paragraph } from "../atoms/typography";
import constants from "../../constants";

import { translate } from "react-i18next";

import "./story-navigator.scss";

const StoryTitle = styled(TinyTitle)({
  margin: "0 0 8px 0",
  paddingLeft: "10px",
});

class StoryNavigator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentStory: Immutable.Map(),
      currentPlaceId: null,
      isStoryDataReady: false,
      isWithError: false,
    };

    this.stories = [];
  }

  componentDidMount() {
    this.checkForStoryChapter(this.props.history.location.pathname);
    this.routeListener = this.props.history.listen(location => {
      this.checkForStoryChapter(location.pathname);
    });
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.placesLoadStatus !== "loaded" &&
      this.props.placesLoadStatus === "loaded"
    ) {
      // TODO(luke): implement hydrateStoriesFromConfig here
      this.stories = hydrateStoriesFromConfig({
        places: this.props.places,
        storyConfig: this.props.storyConfig,
      });

      const placeId = parseInt(this.props.location.pathname.split("/")[2]);
      placeId && this.props.updateUIVisibility("rightSidebar", true);
      this.setState(this.getCurrentStoryState(placeId, false));
    }
  }

  componentWillUnmount() {
    this.routeListener.unlisten();
  }

  checkForStoryChapter(pathname) {
    const currentStoryState = this.getCurrentStoryState(pathname.split("/")[2]);

    if (currentStoryState) {
      this.setState(currentStoryState);
      currentStoryState.currentStory &&
        this.props.updateUIVisibility("rightSidebar", true);
    }
  }

  getCurrentStoryState(placeId, isInitialized = true) {
    placeId = parseInt(placeId);

    const currentStory = this.stories.find(story => {
      return story.get("chapters").get(placeId);
    });

    if (currentStory) {
      return {
        currentStory: currentStory,
        currentPlaceId: placeId,
        isStoryDataReady: true,
      };
    } else if (!isInitialized) {
      return {
        currentStory: this.stories.valueSeq().first(),
        isStoryDataReady: true,
      };
    } else {
      return {
        currentPlaceId: placeId,
        isStoryDataReady: true,
      };
    }
  }

  getIconUrl(chapter) {
    // If the story chapter has an icon url defined, use that.
    if (chapter.get("sidebarIconUrl")) {
      return chapter.get("sidebarIconUrl");
    }

    // If the story chapter has a style object with an icon url defined, use
    // that.
    if (
      chapter.get(constants.GEOMETRY_STYLE_PROPERTY_NAME) &&
      chapter
        .get(constants.GEOMETRY_STYLE_PROPERTY_NAME)
        .get(constants.ICON_URL_PROPERTY_NAME)
    ) {
      return chapter
        .get(constants.GEOMETRY_STYLE_PROPERTY_NAME)
        .get(constants.ICON_URL_PROPERTY_NAME);
    }

    // Otherwise, use the icon url defined in the category config.
    return this.props.placeConfig.place_detail.find(
      config =>
        config.category === chapter.get(constants.LOCATION_TYPE_PROPERTY_NAME),
    ).icon_url;
  }

  getTitle(chapter) {
    // This is an unfortunate series of checks, but needed at the moment.
    // TODO: We should revisit why this is necessary in the first place and see
    // if we can refactor.
    return (
      chapter.get(constants.FULL_TITLE_PROPERTY_NAME) ||
      chapter.get(constants.TITLE_PROPERTY_NAME) ||
      chapter.get(constants.NAME_PROPERTY_NAME) ||
      ""
    );
  }

  render() {
    return (
      <div className="story-navigator">
        {this.state.currentStory.get("header") && (
          <StoryTitle>{this.state.currentStory.get("header")}</StoryTitle>
        )}
        {this.state.currentStory.get("description") && (
          <Paragraph className="story-navigator__description">
            {this.state.currentStory.get("description")}
          </Paragraph>
        )}
        <hr />
        {this.state.currentStory.get("chapters") &&
          this.state.currentStory
            .get("chapters")
            .map((chapter, route) => {
              return (
                <StoryChapter
                  key={route}
                  title={this.getTitle(chapter)}
                  iconUrl={this.getIconUrl(chapter, route)}
                  isSelected={this.state.currentPlaceId === chapter.get("id")}
                  placeUrl={`${chapter.get("clientSlug")}/${chapter.get("id")}`}
                />
              );
            })
            .toArray()}
        {!this.state.isStoryDataReady &&
          !this.state.isWithError &&
          this.props.isRightSidebarVisible && <Spinner />}
        {this.state.isWithError && (
          <Paragraph className="story-navigator__error-msg">
            {this.props.t("errorMsg")}
          </Paragraph>
        )}
      </div>
    );
  }
}

StoryNavigator.propTypes = {
  history: PropTypes.object.isRequired,
  isRightSidebarVisible: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired,
  storyConfig: PropTypes.object.isRequired,
  placeConfig: PropTypes.shape({
    place_detail: PropTypes.array.isRequired,
  }).isRequired,
  places: placesPropType.isRequired,
  placesLoadStatus: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  updateUIVisibility: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isRightSidebarVisible: uiVisibilitySelector("rightSidebar", state),
  placesLoadStatus: placesLoadStatusSelector(state),
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

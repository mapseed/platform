import React, { Component } from "react";
import PropTypes from "prop-types";
import { Map, OrderedMap, fromJS } from "immutable";
import Spinner from "react-spinner";

import StoryChapter from "../molecules/story-chapter";
import constants from "../../constants";

import { translate } from "react-i18next";

import { getModelFromUrl } from "../../utils/collection-utils";

import "./index.scss";

import { story as storyConfig, place as placeConfig } from "config";

class StorySidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentStoryHeader: "",
      currentStoryDescription: "",
      currentStoryName: "",
      currentStoryChapters: OrderedMap(),
      currentStoryRoute: "",
      currentChapter: Map(),
      isStoryDataReady: false,
      isWithError: false,
    };
  }

  componentDidMount() {
    Promise.all(this.props.placeCollectionPromises)
      .then(() => {
        this.stories = Object.keys(storyConfig).reduce((stories, storyName) => {
          return stories.set(
            storyName,
            Object.keys(storyConfig[storyName].order).reduce(
              (chapters, chapterUrl) => {
                return chapters.set(
                  chapterUrl,
                  fromJS(
                    getModelFromUrl(this.props.places, chapterUrl).attributes,
                  ),
                );
              },
              OrderedMap(),
            ),
          );
        }, OrderedMap());

        const currentStoryState = this.getCurrentStoryState(
          Backbone.history.getFragment().split("/"),
          false,
        );

        currentStoryState.isStoryDataReady = true;
        this.setState(currentStoryState);

        this.props.router.on("route", (fn, route) => {
          this.setState(this.getCurrentStoryState(route));
        });
      })
      .catch(() => {
        console.log("ERROR!");
        this.setState({
          isWithError: true,
        });
      });
  }

  getCurrentStoryState(route, isInitialized = true) {
    const joinedRoute = route.join("/");
    const [foundStoryName, foundStory] =
      this.stories.findEntry(story => {
        return story.get(joinedRoute);
      }) || [];

    if (foundStory) {
      return {
        currentStoryHeader: storyConfig[foundStoryName].header,
        currentStoryDescription: storyConfig[foundStoryName].description,
        currentStoryName: foundStoryName,
        currentStoryChapters: foundStory,
        currentStoryRoute: joinedRoute,
        currentChapter: foundStory.get(joinedRoute),
      };
    } else {
      return {
        currentStoryHeader: !isInitialized
          ? storyConfig[this.stories.keySeq().first()].header
          : this.state.currentStoryHeader,
        currentStoryDescription: !isInitialized
          ? storyConfig[this.stories.keySeq().first()].description
          : this.state.currentStoryDescription,
        currentStoryName: !isInitialized
          ? this.stories.keySeq().first()
          : this.state.currentStoryName,
        currentStoryChapters: !isInitialized
          ? this.stories.first()
          : this.state.currentStoryChapters,
        currentStoryRoute: "",
        currentChapter: Map(),
      };
    }
  }

  getIconUrl(chapter, storyUrl) {
    // If the story config for this place declares an explicit sidebar icon url,
    // use that icon.
    if (
      storyConfig[this.state.currentStoryName].order[storyUrl].sidebarIconUrl
    ) {
      return storyConfig[this.state.currentStoryName].order[storyUrl]
        .sidebarIconUrl;
    }

    // If the story chapter has an icon url defined, use that.
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
    return placeConfig.place_detail.find(
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
      <div className="story-sidebar">
        <a href="#" className="story-sidebar__collapse-btn" />
        {this.state.currentStoryHeader && (
          <h5 className="story-sidebar__header">
            {this.state.currentStoryHeader}
          </h5>
        )}
        {this.state.currentStoryDescription && (
          <p className="story-sidebar__description">
            {this.state.currentStoryDescription}
          </p>
        )}
        <hr />
        {this.state.currentStoryChapters
          .map((chapter, placeUrl) => {
            return (
              <StoryChapter
                key={placeUrl}
                title={this.getTitle(chapter)}
                iconUrl={this.getIconUrl(chapter, placeUrl)}
                isSelected={this.state.currentStoryRoute === placeUrl}
                placeUrl={placeUrl}
              />
            );
          })
          .toArray()}
        {!this.state.isStoryDataReady && !this.state.isWithError && <Spinner />}
        {this.state.isWithError && (
          <p className="story-sidebar__error-msg">{this.props.t("errorMsg")}</p>
        )}
      </div>
    );
  }
}

StorySidebar.propTypes = {
  places: PropTypes.object.isRequired,
  placeCollectionPromises: PropTypes.arrayOf(PropTypes.object).isRequired,
  router: PropTypes.instanceOf(Backbone.Router),
  t: PropTypes.func.isRequired,
};

export default translate("StorySidebar")(StorySidebar);

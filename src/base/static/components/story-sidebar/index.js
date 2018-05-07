import React, { Component } from "react";
import PropTypes from "prop-types";
import { Map, OrderedMap, fromJS } from "immutable";
import Spinner from "react-spinner";

import StoryChapter from "../molecules/story-chapter";
import { Header5, Paragraph } from "../atoms/typography";
import { Link } from "../atoms/navigation";
import constants from "../../constants";

import { translate } from "react-i18next";

import { getModelFromUrl } from "../../utils/collection-utils";
import { prepStoryContent } from "../../utils/story-utils";

import "./index.scss";

import { story as storyConfig, place as placeConfig } from "config";

class StorySidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentStory: Map(),
      currentRoute: "",
      isStoryDataReady: false,
      isWithError: false,
    };
  }

  componentDidMount() {
    this.props.storiesPromise
      .then(stories => {
        this.stories = stories;

        this.props.router.on("route", (fn, route) => {
          const currentStoryState = this.getCurrentStoryState(route.join("/"));
          currentStoryState && this.setState(currentStoryState);
        });
        this.setState(
          this.getCurrentStoryState(Backbone.history.getFragment(), false),
        );
      })
      .catch(e => {
        console.log("ERROR", e);
        this.setState({
          isWithError: true,
        });
      });
  }

  getCurrentStoryState(route, isInitialized = true) {
    const currentStory = this.stories.find(story => {
      return story.get("chapters").get(route);
    });

    if (currentStory) {
      return {
        currentStory: currentStory,
        currentRoute: route,
        isStoryDataReady: true,
      };
    } else if (!isInitialized) {
      return {
        currentStory: this.stories.valueSeq().first(),
        isStoryDataReady: true,
      };
    } else {
      return {
        currentRoute: route,
        isStoryDataReady: true,
      };
    }
  }

  getIconUrl(chapter, storyUrl) {
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
        <Link href="#" className="story-sidebar__collapse-btn" />
        {this.state.currentStory.get("header") && (
          <Header5 className="story-sidebar__header">
            {this.state.currentStory.get("header")}
          </Header5>
        )}
        {this.state.currentStory.get("description") && (
          <Paragraph className="story-sidebar__description">
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
                  isSelected={this.state.currentRoute === route}
                  placeUrl={route}
                />
              );
            })
            .toArray()}
        {!this.state.isStoryDataReady && !this.state.isWithError && <Spinner />}
        {this.state.isWithError && (
          <Paragraph className="story-sidebar__error-msg">
            {this.props.t("errorMsg")}
          </Paragraph>
        )}
      </div>
    );
  }
}

StorySidebar.propTypes = {
  places: PropTypes.object.isRequired,
  storiesPromise: PropTypes.object.isRequired,
  router: PropTypes.instanceOf(Backbone.Router),
  t: PropTypes.func.isRequired,
};

export default translate("StorySidebar")(StorySidebar);

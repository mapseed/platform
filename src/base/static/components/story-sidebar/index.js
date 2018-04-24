import React, { Component } from "react";
import PropTypes from "prop-types";
import { Map, OrderedMap, fromJS } from "immutable";

import StoryChapter from "./story-chapter";
import constants from "../../constants";

import { story as storyConfig, place as placeConfig } from "config";

class StorySidebar extends Component {
  constructor(props) {
    super(props);

    // Collect stories into a Map whose values are Lists of serialized attribute
    // data from Place models in the story.
    this.stories = Object.keys(storyConfig).reduce((memo, storyName) => {
      return memo.set(
        storyName,
        // TODO: The order property on the storyConfig object below gets
        // transformed from its array structure in the config. This is
        // confusing because this section of the config isn't declarative, and
        // should probably be refactored when we port the app view.
        Object.keys(storyConfig[storyName].order).reduce((memo, chapterUrl) => {
          return memo.set(
            chapterUrl,
            fromJS(this.getModelFromUrl(chapterUrl).attributes),
          );
        }, OrderedMap()),
      );
    }, OrderedMap());

    this.state = {
      currentStoryName: null,
      currentStoryChapters: OrderedMap(),
      currentStoryRoute: null,
      currentChapter: Map(),
    };
  }

  componentWillMount() {
    this.isInitialized = false;
    this.loadAndSetStoryChapter(Backbone.history.getFragment().split("/"));
    this.isInitialized = true;

    this.props.router.on("route", (fn, route) => {
      this.loadAndSetStoryChapter(route);
    });
  }

  loadAndSetStoryChapter(route) {
    let isRouteFound = false;
    const joinedRoute = route.join("/");
    this.stories.forEach((story, storyName) => {
      if (story.get(joinedRoute)) {
        // If the current route exists in this story, load the story and set
        // the current chapter and name.
        isRouteFound = true;
        this.setState({
          currentStoryName: storyName,
          currentStoryChapters: story,
          currentStoryRoute: joinedRoute,
          currentChapter: story.get(joinedRoute),
        });
      }
    });

    // If we can't find a match for the current route and we haven't
    // initialized the story sidebar, load content from the first story
    // provided in the config so the sidebar is never without content.
    if (!isRouteFound) {
      this.setState({
        currentStoryName: !this.isInitialized
          ? this.stories.keySeq().first()
          : this.state.currentStoryName,
        currentStoryChapters: !this.isInitialized
          ? this.stories.first()
          : this.state.currentStoryChapters,
        currentStoryRoute: null,
        currentChapter: null,
      });
    }
  }

  getModelFromUrl(url) {
    const splitUrl = url.split("/");

    // If the url has a slash in it with text on either side, we assume we have
    // a place model url and can look up the model directly.
    if (splitUrl.length === 2) {
      return (
        this.props.places[
          this.props.layers.find(layer => layer.slug === splitUrl[0]).id
        ].get(splitUrl[1]) || {}
      );
    } else {
      // Otherwise, we have a "landmark-style" url, and have to search all place
      // collections.
      let foundModel;
      Object.keys(this.props.places).forEach(collectionName => {
        let model = this.props.places[collectionName].findWhere({
          [constants.CUSTOM_URL_PROPERTY_NAME]: splitUrl[0],
        });
        if (model) {
          foundModel = model;
        }
      });

      return foundModel || {};
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
    if (chapter.get("style") && chapter.get("style").get("iconUrl")) {
      return chapter.get("style").get("iconUrl");
    }

    // Otherwise, use the icon url defined in the category config.
    return placeConfig.place_detail.find(
      config => config.category === chapter.get("location_type"),
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
      </div>
    );
  }
}

StorySidebar.propTypes = {
  layers: PropTypes.array.isRequired,
  places: PropTypes.object.isRequired,
  router: PropTypes.instanceOf(Backbone.Router),
};

export default StorySidebar;

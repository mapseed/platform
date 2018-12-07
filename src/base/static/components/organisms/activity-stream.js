import React, { Component } from "react";
import styled from "react-emotion";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { List, fromJS } from "immutable";

import ActionCollection from "../../js/models/action-collection.js";
import mapseedApiClient from "../../client/mapseed-api-client";

import ActivityItem from "../molecules/activity-item";

import { mapPlaceLayersSelector } from "../../state/ducks/map-config";
import {
  commentsSurveyConfigPropType,
  commentsSurveyConfigSelector,
} from "../../state/ducks/survey-config";
import { placeConfigSelector } from "../../state/ducks/place-config";

import constants from "../../constants";

class ActivityStream extends Component {
  state = {
    activityModels: List(),
  };
  slugProperty = "__slug";
  collectionIdProperty = "__collectionId";
  placeIdProperty = "__placeId";
  activities = this.props.placeLayers.map(placeLayer => ({
    slug: placeLayer.slug,
    collectionId: placeLayer.id,
    collection: new ActionCollection([], {
      url: `${placeLayer.url}/actions`,
    }),
  }));

  componentDidMount() {
    this.activities.forEach(activity => {
      activity.collection.on(
        "add",
        model => {
          this.onAddAction({
            model: model,
            slug: activity.slug,
            collectionId: activity.collectionId,
          });
        },
        this,
      );
    });

    // TODO: Refactor polling for websockets.
    // In the meantime, we've hard-coded a generous polling interval of 45
    // seconds.
    this.fetchActivity();
    this.pollingIntervalId = setInterval(() => {
      this.fetchActivity();
    }, 45000);
  }

  componentWillUnmount() {
    clearInterval(this.pollingIntervalId);
    this.activities.forEach(activity => {
      activity.collection.off("add", null, this);
    });
  }

  successCallback(model) {
    // When the collection has fetched successfully, sort activities in reverse
    // chronological order.
    this.setState({
      activityModels: this.state.activityModels.sort((a, b) => {
        return (
          new Date(b.get(constants.CREATED_DATETIME_PROPERTY_NAME)) -
          new Date(a.get(constants.CREATED_DATETIME_PROPERTY_NAME))
        );
      }),
    });
  }

  fetchActivity() {
    mapseedApiClient.activity.get(
      this.activities.map(activity => [
        activity.collection,
        this.successCallback.bind(this),
      ]),
    );
  }

  onAddAction({ model, slug, collectionId }) {
    // Get the id of the place related to this action.
    model.attributes[this.placeIdProperty] = model.get(
      constants.TARGET_PROPERTY_NAME,
    ).place
      ? model
          .get(constants.TARGET_PROPERTY_NAME)
          .place.split("/")
          .slice(-1)[0]
      : model.get(constants.TARGET_PROPERTY_NAME).id;
    model.attributes[this.slugProperty] = slug;
    model.attributes[this.collectionIdProperty] = collectionId;

    // When we get a new activity model, just unshift it to the front of the
    // List of serialized models.
    this.setState({
      activityModels: this.state.activityModels.unshift(
        fromJS(model.attributes),
      ),
    });
  }

  render() {
    return (
      <ul style={{ paddingLeft: 0, marginTop: 0 }}>
        {this.state.activityModels.map((activityModel, i) => {
          const submitterName = activityModel
            .get(constants.TARGET_PROPERTY_NAME)
            .get(constants.SUBMITTER_NAME);
          const target = activityModel.get(constants.TARGET_PROPERTY_NAME);
          const collectionId = activityModel.get(this.collectionIdProperty);
          const placeId = activityModel.get(this.placeIdProperty);
          const slug = activityModel.get(this.slugProperty);
          let title;
          let anonymousName;
          let url;
          let actionText;

          // We support activity for place and comment creation.
          switch (activityModel.get("target_type")) {
            case "place":
              // To derive the title for place activity, we assume there is
              // always a model attribute called "title".
              title = activityModel
                .get(constants.TARGET_PROPERTY_NAME)
                .get(constants.TITLE_PROPERTY_NAME);
              anonymousName = this.props.placeConfig.anonymous_name;
              actionText = this.props.placeConfig.action_text;
              url = `/${slug}/${placeId}`;
              break;
            case "comments":
              // To derive the title for comment activity, we look up the
              // corresponding place model and assume there is a field on
              // that model called "title".
              title =
                this.props.places[collectionId].get(placeId) &&
                this.props.places[collectionId]
                  .get(placeId)
                  .get(constants.TITLE_PROPERTY_NAME);
              anonymousName = this.props.commentsSurveyConfig.anonymous_name;
              actionText = this.props.commentsSurveyConfig.action_text;
              url = `/${slug}/${placeId}/response/${target.get(
                constants.MODEL_ID_PROPERTY_NAME,
              )}`;
              break;
            default:
              // If there are other action types in the collection (like
              // supports), return null.
              return null;
          }

          return (
            <ActivityItem
              key={i}
              title={title}
              actionText={actionText}
              submitterName={submitterName || anonymousName}
              url={url}
            />
          );
        })}
      </ul>
    );
  }
}

ActivityStream.propTypes = {
  placeConfig: PropTypes.shape({
    action_text: PropTypes.string.isRequired,
    anonymous_name: PropTypes.string.isRequired,
  }).isRequired,
  placeLayers: PropTypes.array.isRequired,
  places: PropTypes.objectOf(PropTypes.instanceOf(Backbone.Collection)),
  commentsSurveyConfig: commentsSurveyConfigPropType.isRequired,
};

const mapStateToProps = state => ({
  placeConfig: placeConfigSelector(state),
  placeLayers: mapPlaceLayersSelector(state),
  commentsSurveyConfig: commentsSurveyConfigSelector(state),
});

export default connect(mapStateToProps)(ActivityStream);

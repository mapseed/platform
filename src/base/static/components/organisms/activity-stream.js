import React, { Component } from "react";
import styled from "react-emotion";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { List, fromJS } from "immutable";

import ActionCollection from "../../js/models/action-collection.js";
import mapseedApiClient from "../../client/mapseed-api-client";

import ActivityItem from "../molecules/activity-item";

import { mapPlaceLayersSelector } from "../../state/ducks/map-config";
import { surveyConfigSelector } from "../../state/ducks/survey-config";
import { placeConfigSelector } from "../../state/ducks/place-config";

class ActivityStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activityModels: List(),
    };
  }

  componentDidMount() {
    this.activities = this.props.placeLayers.map(placeLayer => ({
      slug: placeLayer.slug,
      collection: new ActionCollection([], {
        url: `${placeLayer.url}/actions`,
      }),
    }));

    this.activities.forEach(activity => {
      activity.collection.on("add", model => {
        this.onAddAction(model, activity.slug);
      });
    });

    // TODO: Refactor polling for websockets.
    // In the meantime, we've hard-coded a generous polling interval of 45
    // seconds.
    this.fetchActivity();
    setInterval(() => {
      this.fetchActivity();
    }, 45000);
  }

  fetchActivity() {
    mapseedApiClient.activity.get(
      this.activities.map(activity => activity.collection),
    );
  }

  onAddAction(model, slug) {
    // Get the id of the place related to this action.
    model.attributes.__placeId = model.get("target").place
      ? model
          .get("target")
          .place.split("/")
          .slice(-1)[0]
      : model.get("target").id;
    model.attributes.__slug = slug;

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
      <ul style={{ paddingLeft: 0 }}>
        {this.state.activityModels.map((activityModel, i) => {
          const target = activityModel.get("target");
          const activityConfig = {};

          // We support activity for place and comment creation.
          switch (activityModel.get("target_type")) {
            case "place":
              activityConfig.anonymousName = this.props.placeConfig.anonymous_name;
              activityConfig.actionText = this.props.placeConfig.action_text;
              activityConfig.url = `/${activityModel.get(
                "__slug",
              )}/${activityModel.get("__placeId")}`;
              break;
            case "comments":
              activityConfig.anonymousName = this.props.surveyConfig.anonymous_name;
              activityConfig.actionText = this.props.surveyConfig.action_text;
              activityConfig.url = `/${activityModel.get(
                "__slug",
              )}/${activityModel.get("__placeId")}/response/${target.get(
                "id",
              )}`;
              break;
          }

          const submitter = activityModel.get("target").get("submitter") || {};

          return (
            <ActivityItem
              key={i}
              title={activityModel.get("target").get("title")}
              url={activityConfig.url}
              avatarurl={submitter.avatar_url}
            />
          );
        })}
      </ul>
    );
  }
}

ActivityStream.propTypes = {
  placeLayers: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
  placeConfig: placeConfigSelector(state),
  placeLayers: mapPlaceLayersSelector(state),
  surveyConfig: surveyConfigSelector(state),
});

export default connect(mapStateToProps)(ActivityStream);

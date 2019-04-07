import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import mapseedApiClient from "../../client/mapseed-api-client";

import ActivityItem from "../molecules/activity-item";

import {
  commentFormConfigPropType,
  commentFormConfigSelector,
} from "../../state/ducks/forms-config";
import { placeConfigSelector } from "../../state/ducks/place-config";
import { loadActivity, activitySelector } from "../../state/ducks/activity";
import {
  datasetsConfigSelector,
  datasetsConfigPropType,
} from "../../state/ducks/datasets-config";
import { placeSelector } from "../../state/ducks/places";

class ActivityStream extends Component {
  fetchActivity = async () => {
    const activityPromises = await Promise.all(
      this.props.datasetsConfig.map(config =>
        mapseedApiClient.activity.get(config.url, config.clientSlug),
      ),
    );
    const activityData = await Promise.all(
      activityPromises.reduce((flat, toFlatten) => flat.concat(toFlatten), []),
    );

    this.props.loadActivity(activityData);
  };

  async componentDidMount() {
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
  }

  render() {
    return (
      <ul style={{ paddingLeft: 0, marginTop: 0 }}>
        {this.props.activity.map((activity, i) => {
          const target = activity.target;
          const submitterName =
            (target.submitter && target.submitter.name) ||
            target.submitter_name;
          let title;
          let anonymousName;
          let url;
          let actionText;
          let place;

          // We support activity for place and comment creation.
          switch (activity.target_type) {
            case "place":
              // To derive the title for place activity, we assume there is
              // always a model attribute called "title".
              title = target.title;
              anonymousName = this.props.placeConfig.anonymous_name;
              actionText = this.props.placeConfig.action_text;
              url = `/${activity._clientSlug}/${target.id}`;
              place = true;
              break;
            case "comments":
              // To derive the title for comment activity, we look up the
              // corresponding place model and assume there is a field on
              // that model called "title".
              place = this.props.placeSelector(
                target.place.split("/").slice(-1)[0],
              );
              title = place && place.title;
              anonymousName = this.props.commentFormConfig.anonymous_name;
              actionText = this.props.commentFormConfig.action_text;
              url =
                place &&
                `/${activity._clientSlug}/${place.id}/response/${target.id}`;
              break;
            default:
              // If there are other action types in the collection (like
              // supports), do not render them.
              return null;
          }

          // Only return an ActivityItem if we've found a Place for it.
          // Activity is returned for private Places even for users who lack
          // can_access_protected permissions, but rendering such activity
          // results in a dead link to a Place that doesn't exist. Ideally the
          // API shouldn't return activity for private Places without the
          // proper permissions.
          // See: https://github.com/jalMogo/mgmt/issues/253
          return place ? (
            <ActivityItem
              key={i}
              title={title}
              actionText={actionText}
              submitterName={submitterName || anonymousName}
              url={url}
            />
          ) : null;
        })}
      </ul>
    );
  }
}

ActivityStream.propTypes = {
  activity: PropTypes.array.isRequired, // TODO
  datasetsConfig: datasetsConfigPropType,
  loadActivity: PropTypes.func.isRequired,
  placeConfig: PropTypes.shape({
    action_text: PropTypes.string.isRequired,
    anonymous_name: PropTypes.string.isRequired,
  }).isRequired,
  placeSelector: PropTypes.func.isRequired,
  commentFormConfig: commentFormConfigPropType.isRequired,
};

const mapStateToProps = state => ({
  activity: activitySelector(state),
  datasetsConfig: datasetsConfigSelector(state),
  placeConfig: placeConfigSelector(state),
  commentFormConfig: commentFormConfigSelector(state),
  placeSelector: placeId => placeSelector(state, placeId),
});

const mapDispatchToProps = dispatch => ({
  loadActivity: activity => dispatch(loadActivity(activity)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ActivityStream);

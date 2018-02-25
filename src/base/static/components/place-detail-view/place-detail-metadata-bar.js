// TODO: replace moment global.
// TODO: JSX localization in this component.

import React, { Component } from "react";
import PropTypes from "prop-types";

import Avatar from "../ui-elements/avatar";
import ActionTime from "../ui-elements/action-time";
import SubmitterName from "../ui-elements/submitter-name";

import "./place-detail-metadata-bar.scss";

class PlaceDetailMetadataBar extends Component {
  componentWillMount() {
    this.collection = this.props.model.submissionSets[
      this.props.surveyConfig.submission_type
    ];

    this.collection.on("add", this.onCollectionChange, this);
    this.collection.on("reset", this.onCollectionChange, this);
  }

  onCollectionChange() {
    this.forceUpdate();
  }

  render() {
    const isWithSubmissions =
      this.props.model.submissionSets &&
      this.props.model.submissionSets[this.props.surveyConfig.submission_type];
    const numSubmissions = isWithSubmissions
      ? this.props.model.submissionSets[this.props.surveyConfig.submission_type]
          .length
      : 0;

    return (
      <section className="place-detail-metadata-bar">
        <Avatar
          src={this.props.submitter.avatar_url}
          className="place-detail-metadata-bar__avatar"
        />
        <section className="place-detail-metadata-bar__details-container">
          <p className="place-detail-metadata-bar__action-text">
            <SubmitterName
              submitter={this.props.submitter}
              placeConfig={this.props.placeConfig}
            />{" "}
            {this.props.placeConfig.action_text || "created"} this{" "}
            {this.props.placeTypes[this.props.model.get("location_type")].label}
          </p>
          <a
            href={
              "/" +
              this.props.model.get("datasetSlug") +
              "/" +
              this.props.model.get("id")
            }
            className="place-detail-metadata-bar__created-datetime"
          >
            <ActionTime time={this.props.model.get("created_datetime")} />
          </a>
          <p className="place-detail-metadata-bar__survey-count">
            {numSubmissions}{" "}
            {numSubmissions === 1
              ? this.props.surveyConfig.response_name
              : this.props.surveyConfig.response_plural_name}
          </p>
        </section>
      </section>
    );
  }
}

PlaceDetailMetadataBar.propTypes = {
  avatarSrc: PropTypes.string,
  model: PropTypes.object.isRequired,
  placeConfig: PropTypes.object.isRequired,
  placeTypes: PropTypes.object.isRequired,
  submitter: PropTypes.object.isRequired,
  surveyConfig: PropTypes.object.isRequired,
};

export default PlaceDetailMetadataBar;

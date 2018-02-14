import React from "react";
import PropTypes from "prop-types";

import UserAvatar from "../ui-elements/user-avatar";

import "./submission-metadata-bar.scss";

// TODO: replace moment global.
// TODO: JSX localization in this component.

const SubmissionMetadataBar = props => {
  const isWithSubmissions =
    props.model.submissionSets &&
    props.model.submissionSets[props.surveyConfig.submission_type];
  const numSubmissions = isWithSubmissions
    ? props.model.submissionSets[props.surveyConfig.submission_type].length
    : 0;

  return (
    <section className="submission-metadata-bar">
      <UserAvatar
        src={props.avatarSrc}
        className="submission-metadata-bar__avatar"
      />
      <section className="submission-metadata-bar__details-container">
        <p className="submission-metadata-bar__action-text">
          <strong>
            {props.model.get("submitter_name") ||
              props.placeConfig.anonymous_name}
          </strong>{" "}
          {props.placeConfig.action_text || "created"} this{" "}
          {props.placeTypes[props.model.get("location_type")].label || "Post"}
        </p>
        <a
          href={
            "/" + props.model.get("datasetSlug") + "/" + props.model.get("id")
          }
          className="submission-metadata-bar__created-datetime"
        >
          <time>{moment(props.model.get("created_datetime")).fromNow()}</time>
        </a>
        <p className="submission-metadata-bar__survey-count">
          {numSubmissions}{" "}
          {numSubmissions === 1
            ? props.surveyConfig.response_name
            : props.surveyConfig.response_plural_name}
        </p>
      </section>
    </section>
  );
};

SubmissionMetadataBar.propTypes = {
  avatarSrc: PropTypes.string,
  model: PropTypes.object.isRequired,
  placeConfig: PropTypes.object.isRequired,
  placeTypes: PropTypes.object.isRequired,
  surveyConfig: PropTypes.object.isRequired,
};

export default SubmissionMetadataBar;

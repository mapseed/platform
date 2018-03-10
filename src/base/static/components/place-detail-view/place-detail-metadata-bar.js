// TODO: replace moment global.
// TODO: JSX localization in this component.

import React from "react";
import PropTypes from "prop-types";

import Avatar from "../ui-elements/avatar";
import ActionTime from "../ui-elements/action-time";
import SubmitterName from "../ui-elements/submitter-name";

import "./place-detail-metadata-bar.scss";

const PlaceDetailMetadataBar = props => {
  return (
    <section className="place-detail-metadata-bar">
      <Avatar
        src={props.submitter.avatar_url}
        className="place-detail-metadata-bar__avatar"
      />
      <section className="place-detail-metadata-bar__details-container">
        <p className="place-detail-metadata-bar__action-text">
          <SubmitterName
            submitter={props.submitter}
            placeConfig={props.placeConfig}
          />{" "}
          {props.placeConfig.action_text || "created"} this{" "}
          {
            props.placeTypes[
              props.backbonePlaceModelAttributes.get("location_type")
            ].label
          }
        </p>
        <a
          href={
            "/" +
            props.backbonePlaceModelAttributes.get("datasetSlug") +
            "/" +
            props.backbonePlaceModelAttributes.get("id")
          }
          className="place-detail-metadata-bar__created-datetime"
        >
          <ActionTime
            time={props.backbonePlaceModelAttributes.get("created_datetime")}
          />
        </a>
        <p className="place-detail-metadata-bar__survey-count">
          {props.backboneSurveyModelsAttributes.size}{" "}
          {props.backboneSurveyModelsAttributes.size === 1
            ? props.surveyConfig.response_name
            : props.surveyConfig.response_plural_name}
        </p>
      </section>
    </section>
  );
};

PlaceDetailMetadataBar.propTypes = {
  avatarSrc: PropTypes.string,
  backbonePlaceModelAttributes: PropTypes.object.isRequired,
  backboneSurveyModelsAttributes: PropTypes.object.isRequired,
  placeConfig: PropTypes.object.isRequired,
  placeTypes: PropTypes.object.isRequired,
  submitter: PropTypes.object.isRequired,
  surveyConfig: PropTypes.object.isRequired,
};

export default PlaceDetailMetadataBar;

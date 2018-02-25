import React from "react";
import PropTypes from "prop-types";

import Avatar from "../ui-elements/avatar";
import ActionTime from "../ui-elements/action-time";
import SubmitterName from "../ui-elements/submitter-name";
import constants from "../constants";

import "./place-detail-survey-response.scss";

const PlaceDetailSurveyResponse = props => {
  return (
    <article className="place-detail-survey-response">
      <div className="place-detail-survey-response__body">
        {props.surveyConfig.items
          .filter(
            field =>
              field.type !== constants.SUBMIT_FIELD_TYPENAME &&
              field.name !== constants.SUBMITTER_FIELDNAME
          )
          .map(field => (
            <p
              key={field.name}
              className="place-detail-survey-response__paragraph"
            >
              {props.model.get(field.name)}
            </p>
          ))}
      </div>
      <section className="place-detail-survey-response__metadata-bar">
        <Avatar
          className="place-detail-survey-response__avatar"
          src={props.submitter.avatar_url}
        />
        <section className="place-detail-survey-response__details-container">
          <SubmitterName
            className="place-detail-survey-response__submitter-name"
            submitter={props.submitter}
            placeConfig={props.placeConfig}
          />
          <ActionTime time={props.model.get("created_datetime")} />
        </section>
      </section>
    </article>
  );
};

PlaceDetailSurveyResponse.propTypes = {
  model: PropTypes.object.isRequired,
  submitter: PropTypes.object.isRequired,
  placeConfig: PropTypes.object.isRequired,
  surveyConfig: PropTypes.object.isRequired,
};

export default PlaceDetailSurveyResponse;

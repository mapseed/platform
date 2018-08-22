import React, { Component } from "react";
import PropTypes from "prop-types";

import Avatar from "../ui-elements/avatar";
import ActionTime from "../ui-elements/action-time";
import SubmitterName from "../ui-elements/submitter-name";
import constants from "../../constants";

import { survey as surveyConfig, place as placeConfig } from "config";
import "./survey-response.scss";

class SurveyResponse extends Component {
  componentDidMount() {
    if (this.props.modelId === parseInt(this.props.scrollToResponseId)) {
      this.props.onMountTargetResponse(this.responseRef);
    }
  }

  render() {
    return (
      <article
        className="place-detail-survey-response"
        ref={response => (this.responseRef = response)}
      >
        <div className="place-detail-survey-response__body">
          {surveyConfig.items
            .filter(
              field =>
                field.type !== constants.SUBMIT_FIELD_TYPENAME &&
                field.name !== constants.SUBMITTER_NAME,
            )
            .map(field => (
              <p
                key={field.name}
                className="place-detail-survey-response__paragraph"
              >
                {this.props.attributes.get(field.name)}
              </p>
            ))}
        </div>
        <div className="place-detail-survey-response__metadata-bar">
          <Avatar
            className="place-detail-survey-response__avatar"
            src={this.props.submitter.avatar_url}
          />
          <div className="place-detail-survey-response__details-container">
            <SubmitterName
              className="place-detail-survey-response__submitter-name"
              submitterName={
                this.props.attributes.get(constants.SUBMITTER_NAME) ||
                this.props.attributes.getIn([
                  constants.SUBMITTER,
                  constants.NAME_PROPERTY_NAME,
                ])
              }
              anonymousName={placeConfig.anonymous_name}
            />
            <ActionTime time={this.props.attributes.get("updated_datetime")} />
          </div>
        </div>
      </article>
    );
  }
}

SurveyResponse.propTypes = {
  attributes: PropTypes.object.isRequired,
  modelId: PropTypes.number.isRequired,
  onMountTargetResponse: PropTypes.func.isRequired,
  scrollToResponseId: PropTypes.string,
  submitter: PropTypes.object.isRequired,
};

export default SurveyResponse;

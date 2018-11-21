import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import Avatar from "../ui-elements/avatar";
import SubmitterName from "../ui-elements/submitter-name";
import constants from "../../constants";
import { Time, SmallText } from "../atoms/typography";

import { surveyConfigSelector } from "../../state/ducks/survey-config";
import { placeConfigSelector } from "../../state/ducks/place-config";
import { appConfigSelector } from "../../state/ducks/app-config";

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
          {this.props.surveyConfig.items
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
              anonymousName={this.props.placeConfig.anonymous_name}
            />
            {this.props.appConfig.show_timestamps !== false && (
              <SmallText display="block" textTransform="uppercase">
                <Time
                  time={this.props.attributes.get(
                    constants.CREATED_DATETIME_PROPERTY_NAME,
                  )}
                />
              </SmallText>
            )}
          </div>
        </div>
      </article>
    );
  }
}

SurveyResponse.propTypes = {
  appConfig: PropTypes.object.isRequired,
  attributes: PropTypes.object.isRequired,
  modelId: PropTypes.number.isRequired,
  onMountTargetResponse: PropTypes.func.isRequired,
  placeConfig: PropTypes.object.isRequired,
  scrollToResponseId: PropTypes.string,
  submitter: PropTypes.object.isRequired,
  surveyConfig: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  appConfig: appConfigSelector(state),
  surveyConfig: surveyConfigSelector(state),
  placeConfig: placeConfigSelector(state),
});

export default connect(mapStateToProps)(SurveyResponse);

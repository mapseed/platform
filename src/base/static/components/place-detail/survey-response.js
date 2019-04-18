import React, { Component, createRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { UserAvatar } from "../atoms/imagery";
import SubmitterName from "../ui-elements/submitter-name";
import constants from "../../constants";
import { Time, SmallText, RegularText } from "../atoms/typography";

import {
  commentFormConfigPropType,
  commentFormConfigSelector,
} from "../../state/ducks/forms-config";
import { placeConfigSelector } from "../../state/ducks/place-config";
import {
  appConfigSelector,
  appConfigPropType,
} from "../../state/ducks/app-config";
import { scrollToResponseIdSelector } from "../../state/ducks/places";

import "./survey-response.scss";

class SurveyResponse extends Component {
  responseRef = createRef();

  componentDidMount() {
    if (this.props.comment.id === this.props.scrollToResponseId) {
      this.props.onMountTargetResponse(this.responseRef);
    }
  }

  render() {
    return (
      <article className="place-detail-survey-response" ref={this.responseRef}>
        <div className="place-detail-survey-response__body">
          {this.props.commentFormConfig.items
            .filter(
              field =>
                field.type !== constants.SUBMIT_FIELD_TYPENAME &&
                field.name !== constants.SUBMITTER_NAME,
            )
            .map(field => (
              <RegularText key={field.name}>
                {this.props.comment[field.name]}
              </RegularText>
            ))}
        </div>
        <div className="place-detail-survey-response__metadata-bar">
          <UserAvatar
            className="place-detail-survey-response__avatar"
            size="large"
            src={
              this.props.comment.submitter
                ? this.props.comment.submitter.avatar_url
                : undefined
            }
          />
          <div className="place-detail-survey-response__details-container">
            <SubmitterName
              className="place-detail-survey-response__submitter-name"
              submitterName={
                this.props.comment.submitter &&
                this.props.comment.submitter.name
              }
              anonymousName={this.props.placeConfig.anonymous_name}
            />
            {this.props.appConfig.show_timestamps && (
              <SmallText display="block" textTransform="uppercase">
                <Time time={this.props.comment.created_datetime} />
              </SmallText>
            )}
          </div>
        </div>
      </article>
    );
  }
}

SurveyResponse.propTypes = {
  appConfig: appConfigPropType.isRequired,
  comment: PropTypes.object.isRequired,
  onMountTargetResponse: PropTypes.func.isRequired,
  placeConfig: PropTypes.object.isRequired,
  scrollToResponseId: PropTypes.number,
  commentFormConfig: commentFormConfigPropType.isRequired,
};

const mapStateToProps = state => ({
  appConfig: appConfigSelector(state),
  commentFormConfig: commentFormConfigSelector(state),
  placeConfig: placeConfigSelector(state),
  scrollToResponseId: scrollToResponseIdSelector(state),
});

export default connect(mapStateToProps)(SurveyResponse);

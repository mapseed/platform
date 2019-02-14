import React, { Component } from "react";
import PropTypes from "prop-types";
import { Map, OrderedMap } from "immutable";
import emitter from "../../utils/emitter";
import { connect } from "react-redux";

import FormField from "../form-fields/form-field";
import SurveyResponse from "./survey-response";
import WarningMessagesContainer from "../ui-elements/warning-messages-container";
import Avatar from "../ui-elements/avatar";
import SurveyResponseEditor from "./survey-response-editor";

import mapseedApiClient from "../../client/mapseed-api-client";

import {
  commentFormConfigPropType,
  commentFormConfigSelector,
} from "../../state/ducks/forms-config";
import {
  appConfigSelector,
  appConfigPropType,
} from "../../state/ducks/app-config";
import { hasAnonAbilitiesInDataset } from "../../state/ducks/datasets-config";
import { createPlaceComment } from "../../state/ducks/places";

import constants from "../../constants";
import { translate } from "react-i18next";

import "./survey.scss";

const Util = require("../../js/utils.js");

class Survey extends Component {
  state = {
    fields: this.initializeFields(),
    isFormSubmitting: false,
    formValidationErrors: new Set(),
    showValidityStatus: false,
    canComment: this.props.hasAnonAbilitiesInDataset({
      abilities: ["create"],
      submissionSet: "comments",
      datasetSlug: this.props.datasetSlug,
    }),
  };

  componentDidMount() {
    emitter.addListener("place-detail-survey:save", () => {
      this.setState({
        fields: this.initializeFields(),
        isFormSubmitting: false,
        formValidationErrors: new Set(),
        showValidityStatus: false,
      });
    });
  }

  componentWillUnmount() {
    emitter.removeAllListeners("place-detail-survey:save");
  }

  initializeFields() {
    return this.props.commentFormConfig.items.reduce((fields, field) => {
      fields = fields.set(
        field.name,
        Map()
          .set(constants.FIELD_RENDER_KEY, Math.random())
          .set(constants.FIELD_VALUE_KEY, ""),
      );
      return fields;
    }, OrderedMap());
  }

  onFieldChange({ fieldName, fieldStatus, isInitializing }) {
    fieldStatus = fieldStatus.set(
      constants.FIELD_RENDER_KEY,
      this.state.fields.get(fieldName).get(constants.FIELD_RENDER_KEY),
    );
    this.setState(({ fields }) => ({
      fields: fields.set(fieldName, fieldStatus),
      updatingField: fieldName,
      isInitializing: isInitializing,
    }));
  }

  async onSubmit() {
    const newValidationErrors = this.state.fields
      .filter(value => !value.get(constants.FIELD_VALIDITY_KEY))
      .reduce((newValidationErrors, invalidField) => {
        return newValidationErrors.add(
          invalidField.get(constants.FIELD_VALIDITY_MESSAGE_KEY),
        );
      }, new Set());

    if (newValidationErrors.size === 0) {
      const attrs = this.state.fields
        .filter(state => !!state.get(constants.FIELD_VALUE_KEY))
        .map(val => val.get(constants.FIELD_VALUE_KEY))
        .toJS();
      Util.log("USER", "place", "submit-comment-btn-click");
      attrs[constants.USER_TOKEN_PROPERTY_NAME] = this.props.userToken;

      const response = await mapseedApiClient.comments.create(
        this.props.placeUrl,
        attrs,
      );

      if (response) {
        this.props.createPlaceComment(this.props.placeId, response);
      } else {
        alert("Oh dear. It looks like that didn't save. Please try again.");
        Util.log("USER", "place", "fail-to-submit-comment");
      }
    } else {
      this.setState({
        formValidationErrors: newValidationErrors,
        showValidityStatus: true,
      });
    }
  }

  render() {
    const numComments = this.props.comments.size;

    return (
      <div className="place-detail-survey">
        <div className="place-detail-survey__header-bar">
          <h4 className="place-detail-survey__num-comments-header">
            {numComments}{" "}
            {numComments === 1
              ? this.props.commentFormConfig.response_name
              : this.props.commentFormConfig.response_plural_name}
          </h4>
          <hr className="place-detail-survey__horizontal-rule" />
        </div>
        <div className="place-detail-survey-responses">
          {this.props.comments.map(comment => {
            {
              return this.props.isEditModeToggled && this.props.isEditable ? (
                <SurveyResponseEditor
                  key={comment.id}
                  isSubmitting={this.props.isSubmitting}
                  placeId={this.props.placeId}
                  placeUrl={this.props.placeUrl}
                  comment={comment}
                  submitter={this.props.submitter}
                />
              ) : (
                <SurveyResponse
                  key={comment.id}
                  comment={comment}
                  onMountTargetResponse={this.props.onMountTargetResponse}
                  scrollToResponseId={this.props.scrollToResponseId}
                  submitter={this.props.submitter}
                />
              );
            }
          })}
        </div>
        <WarningMessagesContainer
          errors={Array.from(this.state.formValidationErrors)}
          headerMsg={this.props.t("validationErrorHeaderMsg")}
        />
        {this.state.canComment && (
          <form
            className="place-detail-survey__form"
            onSubmit={evt => evt.preventDefault()}
          >
            {this.state.fields
              .map((fieldState, fieldName) => (
                <FormField
                  key={fieldState.get(constants.FIELD_RENDER_KEY)}
                  isInitializing={this.state.isInitializing}
                  fieldConfig={this.props.commentFormConfig.items.find(
                    field => field.name === fieldName,
                  )}
                  updatingField={this.state.updatingField}
                  showValidityStatus={this.state.showValidityStatus}
                  disabled={this.state.isFormSubmitting}
                  onFieldChange={this.onFieldChange.bind(this)}
                  fieldState={fieldState}
                  onClickSubmit={this.onSubmit.bind(this)}
                />
              ))
              .toArray()}
          </form>
        )}
        {this.props.currentUser && this.state.canComment ? (
          <span className="place-detail-survey__submit-user-info">
            <Avatar size="small" src={this.props.currentUser.avatar_url} />
            <span className="place-detail-survey__username">
              {this.props.currentUser.name}
            </span>
            <a
              className="place-detail-survey__logout-button"
              href={this.props.appConfig.api_root + "users/logout/"}
            >
              {this.props.t("logOut")}
            </a>
          </span>
        ) : null}
      </div>
    );
  }
}

Survey.propTypes = {
  appConfig: appConfigPropType.isRequired,
  comments: PropTypes.array,
  createPlaceComment: PropTypes.func.isRequired,
  datasetSlug: PropTypes.string.isRequired,
  hasAnonAbilitiesInDataset: PropTypes.func.isRequired,
  isEditable: PropTypes.bool.isRequired,
  isEditModeToggled: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onMountTargetResponse: PropTypes.func.isRequired,
  placeId: PropTypes.number.isRequired,
  placeUrl: PropTypes.string.isRequired,
  scrollToResponseId: PropTypes.number,
  commentFormConfig: commentFormConfigPropType.isRequired,
  currentUser: PropTypes.object,
  submitter: PropTypes.object,
  t: PropTypes.func.isRequired,
  userToken: PropTypes.string,
};

const mapStateToProps = state => ({
  appConfig: appConfigSelector(state),
  hasAnonAbilitiesInDataset: ({ abilities, submissionSet, datasetSlug }) =>
    hasAnonAbilitiesInDataset({ state, abilities, submissionSet, datasetSlug }),
  commentFormConfig: commentFormConfigSelector(state),
});

const mapDispatchToProps = dispatch => ({
  createPlaceComment: (placeId, commentData) =>
    dispatch(createPlaceComment(placeId, commentData)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(translate("Survey")(Survey));

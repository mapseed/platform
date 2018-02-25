// TODO: localization in this component.

import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Map as ImmutableMap,
  OrderedMap as ImmutableOrderedMap,
} from "immutable";

import FormField from "../form-field";
import SecondaryButton from "../ui-elements/secondary-button";
import PlaceDetailSurveyResponse from "./place-detail-survey-response";
import WarningMessagesContainer from "../ui-elements/warning-messages-container";
import Avatar from "../ui-elements/avatar";

import constants from "../constants";
import { placeDetailSurvey as messages } from "../messages";

import "./place-detail-survey.scss";

const Util = require("../../js/utils.js");

class PlaceDetailSurvey extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: ImmutableOrderedMap(),
      isFormSubmitting: false,
      formValidationErrors: new Set(),
      showValidityStatus: false,
    };
  }

  componentWillMount() {
    this.collection = this.props.model.submissionSets[
      this.props.surveyConfig.submission_type
    ];

    this.resetState();
  }

  resetState() {
    let fields = ImmutableOrderedMap();
    this.props.surveyConfig.items.forEach(field => {
      fields = fields.set(
        field.name,
        ImmutableMap()
          .set(constants.FIELD_STATE_RENDER_KEY, Math.random())
          .set(constants.FIELD_STATE_VALUE_KEY, "")
      );
    });

    this.setState({
      fields: fields,
      isFormSubmitting: false,
      formValidationErrors: new Set(),
      showValidityStatus: false,
    });
  }

  onFieldChange(fieldName, fieldStatus, isInitializing) {
    fieldStatus = fieldStatus.set(
      constants.FIELD_STATE_RENDER_KEY,
      this.state.fields.get(fieldName).get(constants.FIELD_STATE_RENDER_KEY)
    );
    this.setState(({ fields }) => ({
      fields: fields.set(fieldName, fieldStatus),
      updatingField: fieldName,
      isInitializing: isInitializing,
    }));
  }

  onSubmit(evt) {
    evt.preventDefault();
    Util.log(
      "USER",
      "place",
      "submit-reply-btn-click",
      this.collection.options.placeModel.getLoggingDetails(),
      this.collection.size()
    );

    // Validate the form.
    const newValidationErrors = new Set();
    let isValid = true;
    this.state.fields.forEach(value => {
      if (!value.get(constants.FIELD_STATE_VALIDITY_KEY)) {
        newValidationErrors.add(
          value.get(constants.FIELD_STATE_VALIDITY_MESSAGE_KEY)
        );
        isValid = false;
      }
    });

    if (isValid) {
      this.saveModel();
    } else {
      this.setState({
        formValidationErrors: newValidationErrors,
        showValidityStatus: true,
      });
    }
  }

  saveModel() {
    const attrs = this.state.fields
      .filter(
        val =>
          val.get(constants.FIELD_STATE_FIELD_TYPE_KEY) !==
          constants.SUBMIT_FIELD_TYPENAME
      )
      .map(val => val.get(constants.FIELD_STATE_VALUE_KEY))
      .toJS();

    this.collection.create(attrs, {
      wait: true,
      success: () => {
        Util.log(
          "USER",
          "place",
          "successfully-reply",
          this.collection.options.placeModel.getLoggingDetails()
        );

        this.resetState();
      },
      error: () => {
        Util.log(
          "USER",
          "place",
          "fail-to-reply",
          this.collection.options.placeModel.getLoggingDetails()
        );
      },
    });
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
      <section className="place-detail-survey">
        <section className="place-detail-survey__header-bar">
          <h4 className="place-detail-survey__num-comments-header">
            {numSubmissions}{" "}
            {numSubmissions === 1
              ? this.props.surveyConfig.response_name
              : this.props.surveyConfig.response_plural_name}
          </h4>
          <SecondaryButton className="place-detail-survey__leave-comment-button">
            Leave a comment
          </SecondaryButton>
          <hr className="place-detail-survey__horizontal-rule" />
        </section>
        <section className="place-detail-survey-responses">
          {this.collection.models.map((model, i) => (
            <PlaceDetailSurveyResponse
              key={i}
              surveyConfig={this.props.surveyConfig}
              model={model}
              placeConfig={this.props.placeConfig}
              submitter={this.props.submitter}
            />
          ))}
        </section>
        <WarningMessagesContainer
          errors={Array.from(this.state.formValidationErrors)}
          headerMsg={messages.validationErrorHeaderMsg}
        />
        <form
          className="place-detail-survey__form"
          onSubmit={this.onSubmit.bind(this)}
        >
          {this.state.fields
            .map((fieldState, fieldName) => (
              <FormField
                key={fieldState.get(constants.FIELD_STATE_RENDER_KEY)}
                isInitializing={this.state.isInitializing}
                fieldConfig={this.props.surveyConfig.items.find(
                  field => field.name === fieldName
                )}
                updatingField={this.state.updatingField}
                showValidityStatus={this.state.showValidityStatus}
                disabled={this.state.isFormSubmitting}
                onFieldChange={this.onFieldChange.bind(this)}
                fieldState={fieldState}
              />
            ))
            .toArray()}
        </form>
        {this.props.currentUser ? (
          <span className="place-detail-survey__submit-user-info">
            <Avatar size="small" src={this.props.currentUser.avatar_url} />
            <span className="place-detail-survey__username">
              {this.props.currentUser.name}
            </span>
            <a
              className="place-detail-survey__logout-button"
              href={this.props.apiRoot + "users/logout/"}
            >
              {messages.logOut}
            </a>
          </span>
        ) : null}
      </section>
    );
  }
}

PlaceDetailSurvey.propTypes = {
  apiRoot: PropTypes.string.isRequired,
  currentUser: PropTypes.object,
  model: PropTypes.object.isRequired,
  placeConfig: PropTypes.object.isRequired,
  submitter: PropTypes.object.isRequired,
  surveyConfig: PropTypes.object.isRequired,
};

export default PlaceDetailSurvey;

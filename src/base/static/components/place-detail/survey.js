import React, { Component } from "react";
import PropTypes from "prop-types";
import { Map, OrderedMap } from "immutable";
import emitter from "../../utils/emitter";

import FormField from "../form-fields/form-field";
import SecondaryButton from "../ui-elements/secondary-button";
import SurveyResponse from "./survey-response";
import WarningMessagesContainer from "../ui-elements/warning-messages-container";
import Avatar from "../ui-elements/avatar";
import SurveyResponseEditor from "./survey-response-editor";

import { survey as surveyConfig, app as appConfig } from "config";
import constants from "../../constants";
import { translate } from "react-i18next";

import "./survey.scss";

const Util = require("../../js/utils.js");

class Survey extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: this.initializeFields(),
      isFormSubmitting: false,
      formValidationErrors: new Set(),
      showValidityStatus: false,
    };
  }

  componentWillMount() {
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
    return surveyConfig.items.reduce((fields, field) => {
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

  onSubmit() {
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
      Util.log("USER", "place", "submit-reply-btn-click");
      attrs[constants.USER_TOKEN_PROPERTY_NAME] = this.props.userToken;

      this.props.onSurveyCollectionCreate(attrs, {
        wait: true,
        beforeSend: (xhr, options) => {
          options.xhrFields = {
            withCredentials: true,
          };
        },
        success: () => {
          Util.log(
            "USER",
            "place",
            "successfully-reply",
            this.props.getLoggingDetails(),
          );
          this.props.onModelIO(constants.SURVEY_MODEL_IO_END_SUCCESS_ACTION);
          emitter.emit("place-detail-survey:save");
        },
        error: () => {
          // TODO: User error feedback.
          Util.log(
            "USER",
            "place",
            "fail-to-reply",
            this.props.getLoggingDetails(),
          );
        },
      });
    } else {
      this.setState({
        formValidationErrors: newValidationErrors,
        showValidityStatus: true,
      });
    }
  }

  render() {
    const { t } = this.props;
    const numSubmissions = this.props.surveyModels.size;

    return (
      <div className="place-detail-survey">
        <div className="place-detail-survey__header-bar">
          <h4 className="place-detail-survey__num-comments-header">
            {numSubmissions}{" "}
            {numSubmissions === 1
              ? surveyConfig.response_name
              : surveyConfig.response_plural_name}
          </h4>
          <SecondaryButton className="place-detail-survey__leave-comment-button">
            {surveyConfig.form_link_text}
          </SecondaryButton>
          <hr className="place-detail-survey__horizontal-rule" />
        </div>
        <div className="place-detail-survey-responses">
          {this.props.surveyModels.map(attributes => {
            {
              return this.props.isEditModeToggled ? (
                <SurveyResponseEditor
                  key={attributes.get(constants.MODEL_ID_PROPERTY_NAME)}
                  isSubmitting={this.props.isSubmitting}
                  modelId={attributes.get(constants.MODEL_ID_PROPERTY_NAME)}
                  onSurveyModelRemove={this.props.onSurveyModelRemove}
                  onSurveyModelSave={this.props.onSurveyModelSave}
                  attributes={attributes}
                  submitter={this.props.submitter}
                />
              ) : (
                <SurveyResponse
                  key={attributes.get(constants.MODEL_ID_PROPERTY_NAME)}
                  modelId={attributes.get(constants.MODEL_ID_PROPERTY_NAME)}
                  onMountTargetResponse={this.props.onMountTargetResponse}
                  scrollToResponseId={this.props.scrollToResponseId}
                  attributes={attributes}
                  submitter={this.props.submitter}
                />
              );
            }
          })}
        </div>
        <WarningMessagesContainer
          errors={Array.from(this.state.formValidationErrors)}
          headerMsg={t("validationErrorHeaderMsg")}
        />
        <form
          className="place-detail-survey__form"
          onSubmit={evt => evt.preventDefault()}
        >
          {this.state.fields
            .map((fieldState, fieldName) => (
              <FormField
                key={fieldState.get(constants.FIELD_RENDER_KEY)}
                isInitializing={this.state.isInitializing}
                fieldConfig={surveyConfig.items.find(
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
        {this.props.currentUser ? (
          <span className="place-detail-survey__submit-user-info">
            <Avatar size="small" src={this.props.currentUser.avatar_url} />
            <span className="place-detail-survey__username">
              {this.props.currentUser.name}
            </span>
            <a
              className="place-detail-survey__logout-button"
              href={appConfig.apiRoot + "users/logout/"}
            >
              {t("logOut")}
            </a>
          </span>
        ) : null}
      </div>
    );
  }
}

Survey.propTypes = {
  getLoggingDetails: PropTypes.func.isRequired,
  isEditModeToggled: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onModelIO: PropTypes.func.isRequired,
  onMountTargetResponse: PropTypes.func.isRequired,
  scrollToResponseId: PropTypes.string,
  surveyModels: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
  onSurveyCollectionCreate: PropTypes.func.isRequired,
  onSurveyModelRemove: PropTypes.func.isRequired,
  onSurveyModelSave: PropTypes.func.isRequired,
  submitter: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  userToken: PropTypes.string,
};

export default translate("Survey")(Survey);

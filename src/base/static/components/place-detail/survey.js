/** @jsx jsx */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Map, OrderedMap } from "immutable";
import { css, jsx } from "@emotion/core";
import emitter from "../../utils/event-emitter";
import { connect } from "react-redux";
import { withTheme } from "emotion-theming";
import { withTranslation } from "react-i18next";

import FormField from "../form-fields/form-field";
import SurveyResponse from "../molecules/survey-response";
import WarningMessagesContainer from "../molecules/warning-messages-container";
import { UserAvatar } from "../atoms/imagery";
import SurveyResponseEditor from "./survey-response-editor";
import { SmallTitle, RegularText, ExternalLink } from "../atoms/typography";

import mapseedApiClient from "../../client/mapseed-api-client";
import LoginModal from "../molecules/login-modal";

import {
  commentFormConfigPropType,
  commentFormConfigSelector,
} from "../../state/ducks/forms-config";
import { datasetsSelector } from "../../state/ducks/datasets";
import {
  appConfigSelector,
  appConfigPropType,
} from "../../state/ducks/app-config";
import { hasAnonAbilitiesInDataset } from "../../state/ducks/datasets-config";
import { createPlaceComment } from "../../state/ducks/places";

import constants from "../../constants";

import "./survey.scss";

import Util from "../../js/utils.js";

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

  savePlaceDetailSurvey() {
    this.setState({
      fields: this.initializeFields(),
      isFormSubmitting: false,
      formValidationErrors: new Set(),
      showValidityStatus: false,
    });
  }

  componentDidMount() {
    emitter.on("place-detail-survey:save", this.savePlaceDetailSurvey);
  }

  componentWillUnmount() {
    emitter.removeEventListener(
      "place-detail-survey:save",
      this.savePlaceDetailSurvey,
    );
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
      attrs[constants.USER_TOKEN_PROPERTY_NAME] = this.props.currentUser.token;

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
    const numComments = this.props.comments.length;

    return (
      <div>
        <div
          css={css`
            overflow: auto;
          `}
        >
          <SmallTitle
            css={css`
              margin-bottom: 8px;
            `}
          >
            {numComments}{" "}
            {numComments === 1
              ? this.props.commentFormConfig.response_name
              : this.props.commentFormConfig.response_plural_name}
          </SmallTitle>
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
                />
              ) : (
                <SurveyResponse
                  key={comment.id}
                  comment={comment}
                  onMountTargetResponse={this.props.onMountTargetResponse}
                />
              );
            }
          })}
        </div>
        {this.state.formValidationErrors.size > 0 && (
          <WarningMessagesContainer
            errors={this.state.formValidationErrors}
            headerMsg={this.props.t(
              "validationErrorHeaderMsg",
              "We're sorry, but we need some more information before we can share your comment.",
            )}
          />
        )}
        {this.state.canComment && (
          <LoginModal
            appConfig={this.props.appConfig}
            disableRestoreFocus={true}
            render={openModal => (
              <form
                css={css`
                  margin-top: 16px;
                `}
                onSubmit={evt => evt.preventDefault()}
                onFocus={() => {
                  if (
                    !this.props.currentUser.isAuthenticated &&
                    this.props.datasets.some(dataset => dataset.auth_required)
                  ) {
                    openModal();
                  }
                }}
              >
                {this.state.fields
                  .map((fieldState, fieldName) => (
                    <FormField
                      formId="commentForm"
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
          />
        )}
        {this.props.currentUser.isAuthenticated && this.state.canComment ? (
          <span className="place-detail-survey__submit-user-info">
            <UserAvatar size="small" src={this.props.currentUser.avatar_url} />
            <RegularText
              css={css`
                margin-left: 8px;
                font-weight: 800;
              `}
            >
              {this.props.currentUser.name}
            </RegularText>
            <ExternalLink
              css={css`
                font-family: ${this.props.theme.text.bodyFontFamily};
              `}
              className="place-detail-survey__logout-button"
              href={this.props.appConfig.api_root + "users/logout/"}
            >
              {this.props.t("logOut", "Log out")}
            </ExternalLink>
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
  commentFormConfig: commentFormConfigPropType.isRequired,
  currentUser: PropTypes.object,
  submitter: PropTypes.object,
  t: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  appConfig: appConfigSelector(state),
  datasets: datasetsSelector(state),
  hasAnonAbilitiesInDataset: ({ abilities, submissionSet, datasetSlug }) =>
    hasAnonAbilitiesInDataset({ state, abilities, submissionSet, datasetSlug }),
  commentFormConfig: commentFormConfigSelector(state),
});

const mapDispatchToProps = dispatch => ({
  createPlaceComment: (placeId, commentData) =>
    dispatch(createPlaceComment(placeId, commentData)),
});

export default withTheme(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(withTranslation("Survey")(Survey)),
);

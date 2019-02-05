import React, { Component } from "react";
import { Map, OrderedMap } from "immutable";
import PropTypes from "prop-types";
import classNames from "classnames";
import { connect } from "react-redux";

import FormField from "../form-fields/form-field";
import Avatar from "../ui-elements/avatar";
import SubmitterName from "../ui-elements/submitter-name";
import { EditorButton } from "../atoms/buttons";
import { SmallText, Time } from "../atoms/typography";

import { translate } from "react-i18next";
import constants from "../../constants";

const Util = require("../../js/utils.js");

import {
  commentFormConfigPropType,
  commentFormConfigSelector,
} from "../../state/ducks/forms-config";
import { placeConfigSelector } from "../../state/ducks/place-config";
import {
  appConfigSelector,
  appConfigPropType,
} from "../../state/ducks/app-config";
import {
  updatePlaceComment,
  removePlaceComment,
} from "../../state/ducks/places";

import mapseedApiClient from "../../client/mapseed-api-client";

import "./survey-response-editor.scss";

class SurveyResponseEditor extends Component {
  constructor(props) {
    super(props);

    const fields = this.props.commentFormConfig.items
      // NOTE: In the editor, we have to strip out the submit field here,
      // otherwise, since we don't render it at all, it will always be invalid.
      .filter(field => field.type !== constants.SUBMIT_FIELD_TYPENAME)
      .reduce((memo, field) => {
        return memo.set(
          field.name,
          Map({
            [constants.FIELD_VALUE_KEY]: this.props.comment.get(field.name),
          }),
        );
      }, OrderedMap());

    this.state = {
      fields: fields,
      formValidationErrors: new Set(),
      showValidityStatus: false,
      isModified: false,
    };
  }

  onFieldChange({ fieldName, fieldStatus, isInitializing }) {
    this.setState(({ fields }) => ({
      fields: fields.set(fieldName, fieldStatus),
      updatingField: fieldName,
      isInitializing: isInitializing,
      isModified: !isInitializing,
    }));
  }

  getCommentData() {
    return this.state.fields
      .filter(field => !!field.get(constants.FIELD_VALUE_KEY))
      .map(field => field.get(constants.FIELD_VALUE_KEY))
      .toJS();
  }

  async onClickSave() {
    const response = await mapseedApiClient.comments.update({
      placeUrl: this.props.placeUrl,
      commentId: this.props.comment.get("id"),
      commentData: this.getCommentData(),
    });

    if (response) {
      this.props.updatePlaceComment(this.props.placeId, response);
      this.setState({
        isModified: false,
      });
    } else {
      alert("Oh dear. It looks like that didn't save. Please try again.");
      Util.log("USER", "comments", "fail-to-update-comment");
    }
  }

  onClickRemove = async () => {
    const response = await mapseedApiClient.comments.update({
      placeUrl: this.props.placeUrl,
      commentId: this.props.comment.get("id"),
      commentData: {
        ...this.getCommentData(),
        visible: false,
      },
    });

    if (response) {
      this.setState({
        isModified: false,
      });
      this.props.removePlaceComment(
        this.props.placeId,
        this.props.comment.get("id"),
      );
    } else {
      alert("Oh dear. It looks like that didn't save. Please try again.");
      Util.log("USER", "comments", "fail-to-remove-comment");
    }
  };

  render() {
    return (
      <form className="place-detail-survey-editor">
        <div className="place-detail-survey-editor__body">
          <EditorButton
            className="place-detail-survey-editor__remove-button"
            isSubmitting={this.props.isSubmitting}
            type="remove"
            label=""
            onClick={() => {
              if (confirm(this.props.t("confirmCommentRemove"))) {
                this.onClickRemove();
              }
            }}
          />
          <EditorButton
            className="place-detail-survey-editor__save-button"
            isSubmitting={this.props.isSubmitting}
            type="save"
            label=""
            onClick={this.onClickSave}
          />
          <em
            className={classNames("place-detail-survey-editor__save-status", {
              "place-detail-survey-editor__save-status--unsaved": this.state
                .isModified,
            })}
          >
            {this.state.isModified
              ? this.props.t("notSaved")
              : this.props.t("saved")}
          </em>
          {this.props.commentFormConfig.items
            .filter(field => field.type !== constants.SUBMIT_FIELD_TYPENAME)
            .map(fieldConfig => (
              <FormField
                fieldConfig={fieldConfig}
                categoryConfig={this.categoryConfig}
                disabled={this.state.isSubmitting}
                fieldState={this.state.fields.get(fieldConfig.name)}
                isInitializing={this.state.isInitializing}
                key={fieldConfig.name}
                modelId={this.props.comment.get(
                  constants.MODEL_ID_PROPERTY_NAME,
                )}
                onFieldChange={this.onFieldChange.bind(this)}
                showValidityStatus={this.state.showValidityStatus}
                updatingField={this.state.updatingField}
              />
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
              submitter={this.props.submitter}
              anonymousName={this.props.placeConfig.anonymous_name}
            />
            {this.props.appConfig.show_timestamps && (
              <SmallText display="block" textTransform="uppercase">
                <Time
                  time={this.props.comment.get(
                    constants.CREATED_DATETIME_PROPERTY_NAME,
                  )}
                />
              </SmallText>
            )}
          </div>
        </div>
      </form>
    );
  }
}

SurveyResponseEditor.propTypes = {
  appConfig: appConfigPropType.isRequired,
  comment: PropTypes.instanceOf(Map),
  isSubmitting: PropTypes.bool.isRequired,
  placeId: PropTypes.number.isRequired,
  placeUrl: PropTypes.string.isRequired,
  placeConfig: PropTypes.object.isRequired,
  submitter: PropTypes.shape({
    avatar_url: PropTypes.string,
  }),
  updatePlaceComment: PropTypes.func.isRequired,
  removePlaceComment: PropTypes.func.isRequired,
  commentFormConfig: commentFormConfigPropType.isRequired,
  t: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  appConfig: appConfigSelector(state),
  placeConfig: placeConfigSelector(state),
  commentFormConfig: commentFormConfigSelector(state),
});

const mapDispatchToProps = dispatch => ({
  updatePlaceComment: (placeId, commentData) =>
    dispatch(updatePlaceComment(placeId, commentData)),
  removePlaceComment: (placeId, commentId) =>
    dispatch(removePlaceComment(placeId, commentId)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(translate("SurveyResponseEditor")(SurveyResponseEditor));

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

import { surveyConfigSelector } from "../../state/ducks/survey-config";
import { placeConfigSelector } from "../../state/ducks/place-config";
import { appConfigSelector } from "../../state/ducks/app-config";

import "./survey-response-editor.scss";

class SurveyResponseEditor extends Component {
  constructor(props) {
    super(props);

    const fields = this.props.surveyConfig.items
      // NOTE: In the editor, we have to strip out the submit field here,
      // otherwise, since we don't render it at all, it will always be invalid.
      .filter(field => field.type !== constants.SUBMIT_FIELD_TYPENAME)
      .reduce((memo, field) => {
        return memo.set(
          field.name,
          Map({
            [constants.FIELD_VALUE_KEY]: this.props.attributes.get(field.name),
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

  successCallback() {
    this.setState({
      isModified: false,
    });
  }

  onClickSave(evt) {
    evt.preventDefault();
    this.props.onSurveyModelSave(
      this.state.fields
        .filter(field => !!field.get(constants.FIELD_VALUE_KEY))
        .map(field => field.get(constants.FIELD_VALUE_KEY))
        .toJS(),
      this.props.modelId,
      this.successCallback.bind(this),
    );
  }

  onClickRemove(evt) {
    evt.preventDefault();
    this.props.onSurveyModelRemove(this.props.modelId);
  }

  render() {
    return (
      <form className="place-detail-survey-editor">
        <div className="place-detail-survey-editor__body">
          <EditorButton
            className="place-detail-survey-editor__remove-button"
            isSubmitting={this.props.isSubmitting}
            type="remove"
            label=""
            onClick={this.onClickRemove.bind(this)}
          />
          <EditorButton
            className="place-detail-survey-editor__save-button"
            isSubmitting={this.props.isSubmitting}
            type="save"
            label=""
            onClick={this.onClickSave.bind(this)}
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
          {this.props.surveyConfig.items
            .filter(field => field.type !== constants.SUBMIT_FIELD_TYPENAME)
            .map(fieldConfig => (
              <FormField
                fieldConfig={fieldConfig}
                categoryConfig={this.categoryConfig}
                disabled={this.state.isSubmitting}
                fieldState={this.state.fields.get(fieldConfig.name)}
                isInitializing={this.state.isInitializing}
                key={fieldConfig.name}
                modelId={this.props.attributes.get(
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
      </form>
    );
  }
}

SurveyResponseEditor.propTypes = {
  appConfig: PropTypes.object.isRequired,
  attributes: PropTypes.object,
  isSubmitting: PropTypes.bool.isRequired,
  modelId: PropTypes.number.isRequired,
  onSurveyModelRemove: PropTypes.func.isRequired,
  onSurveyModelSave: PropTypes.func.isRequired,
  placeConfig: PropTypes.object.isRequired,
  submitter: PropTypes.shape({
    avatar_url: PropTypes.string,
  }),
  surveyConfig: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  appConfig: appConfigSelector(state),
  placeConfig: placeConfigSelector(state),
  surveyConfig: surveyConfigSelector(state),
});

export default connect(mapStateToProps)(
  translate("SurveyResponseEditor")(SurveyResponseEditor),
);

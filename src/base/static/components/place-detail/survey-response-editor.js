import React, { Component } from "react";
import { Map, OrderedMap } from "immutable";
import PropTypes from "prop-types";
import classNames from "classnames";

import FormField from "../form-fields/form-field";
import Avatar from "../ui-elements/avatar";
import ActionTime from "../ui-elements/action-time";
import SubmitterName from "../ui-elements/submitter-name";
import EditorButton from "../ui-elements/editor-button";

import constants from "../../constants";

import "./survey-response-editor.scss";

class SurveyResponseEditor extends Component {
  constructor(props) {
    super(props);

    const fields = this.props.surveyItems
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
            {this.state.isModified ? "Not saved" : "Saved"}
          </em>
          {this.props.surveyItems
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
              anonymousName={this.props.anonymousName}
            />
            <ActionTime time={this.props.attributes.get("updated_datetime")} />
          </div>
        </div>
      </form>
    );
  }
}

SurveyResponseEditor.propTypes = {
  attributes: PropTypes.object,
  anonymousName: PropTypes.string.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  modelId: PropTypes.number.isRequired,
  onSurveyModelRemove: PropTypes.func.isRequired,
  onSurveyModelSave: PropTypes.func.isRequired,
  submitter: PropTypes.shape({
    avatar_url: PropTypes.string,
  }),
  surveyItems: PropTypes.arrayOf(
    PropTypes.shape({
      prompt: PropTypes.string,
      label: PropTypes.string,
      type: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default SurveyResponseEditor;

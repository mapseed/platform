import React, { Component } from "react";
import PropTypes from "prop-types";
import emitter from "../utils/emitter";
import classNames from "classnames";
import {
  Map as ImmutableMap,
  OrderedMap as ImmutableOrderedMap,
} from "immutable";

import FormField from "../form-fields/form-field";
import WarningMessagesContainer from "../ui-elements/warning-messages-container";
import { scrollTo } from "../utils/scroll-helpers";

import { placeDetailEditor as messages } from "../messages";
import constants from "../constants";

import "./place-detail-editor.scss";

class PlaceDetailEditor extends Component {
  constructor(props) {
    super(props);

    let fields = ImmutableOrderedMap();
    this.props.categoryConfig.fields
      // NOTE: In the editor, we have to strip out the submit field here,
      // otherwise, since we don't render it at all, it will always be invalid.
      .filter(field => field.type !== constants.SUBMIT_FIELD_TYPENAME)
      .forEach(field => {
        fields = fields.set(
          field.name,
          ImmutableMap().set(
            constants.FIELD_STATE_VALUE_KEY,
            this.props.placeModel.get(field.name)
          )
        );
      });

    this.state = {
      fields: fields,
      formValidationErrors: new Set(),
      showValidityStatus: false,
    };
  }

  componentWillMount() {
    emitter.addListener("place-model:update", () => {
      // Validate the form.
      const newValidationErrors = this.state.fields
        .filter(value => !value.get(constants.FIELD_STATE_VALIDITY_KEY))
        .reduce((newValidationErrors, invalidField) => {
          return newValidationErrors.add(
            invalidField.get(constants.FIELD_STATE_VALIDITY_MESSAGE_KEY)
          );
        }, new Set());

      if (newValidationErrors.size === 0) {
        this.props.onUpdate(this.state.fields);
      } else {
        this.setState({
          formValidationErrors: newValidationErrors,
          showValidityStatus: true,
        });
        scrollTo(this.props.container, 0, 300);
      }
    });
    emitter.addListener("place-model:remove", () => {
      this.props.onRemove();
    });

    // Set the initial geometry style.
    if (this.props.placeModel.get(constants.GEOMETRY_STYLE_PROPERTY_NAME)) {
      this.props.onGeometryStyleChange(
        this.props.placeModel.get(constants.GEOMETRY_STYLE_PROPERTY_NAME)
      );
    }
  }

  getMapDrawingToolbarState(fieldConfig) {
    return fieldConfig.type === constants.MAP_DRAWING_TOOLBAR_TYPENAME
      ? {
          layerView: this.props.layerView,
          initialPanel:
            constants.GEOMETRY_EDITOR_TOOL_MAPPINGS[
              this.props.placeModel
                .get(constants.GEOMETRY_PROPERTY_NAME)
                .get(constants.GEOMETRY_TYPE_PROPERTY_NAME)
            ],
          initialGeometryType:
            constants.GEOMETRY_TYPE_MAPPINGS[
              this.props.placeModel
                .get(constants.GEOMETRY_PROPERTY_NAME)
                .get(constants.GEOMETRY_TYPE_PROPERTY_NAME)
            ],
          existingLayer: this.props.layerView.layer,
          existingColor: this.props.placeModel
            .get(constants.GEOMETRY_STYLE_PROPERTY_NAME)
            .get("color"),
          existingOpacity: this.props.placeModel
            .get(constants.GEOMETRY_STYLE_PROPERTY_NAME)
            .get("opacity"),
          existingFillColor: this.props.placeModel
            .get(constants.GEOMETRY_STYLE_PROPERTY_NAME)
            .get("fillColor"),
          existingFillOpacity: this.props.placeModel
            .get(constants.GEOMETRY_STYLE_PROPERTY_NAME)
            .get("fillOpacity"),
          selectedMarkerIndex:
            fieldConfig.content &&
            fieldConfig.content.findIndex(
              marker =>
                marker.url ===
                this.props.placeModel
                  .get(constants.GEOMETRY_STYLE_PROPERTY_NAME)
                  .get(constants.ICON_URL_PROPERTY_NAME)
            ),
        }
      : {};
  }

  componentDidMount() {
    // TODO: Replace this.
    new Spinner(Shareabouts.smallSpinnerOptions).spin(
      document.getElementsByClassName("place-detail-editor__spinner")[0]
    );
  }

  componentWillUnmount() {
    emitter.removeAllListeners("place-model:update");
    emitter.removeAllListeners("place-model:remove");
  }

  onFieldChange(fieldName, fieldStatus, isInitializing) {
    this.setState(({ fields }) => ({
      fields: fields.set(fieldName, fieldStatus),
      updatingField: fieldName,
      isInitializing: isInitializing,
    }));
  }

  render() {
    return (
      <div
        className={classNames("place-detail-editor", {
          "place-detail-editor--faded": this.props.isSubmitting,
        })}
      >
        <WarningMessagesContainer
          errors={Array.from(this.state.formValidationErrors)}
          headerMsg={messages.validationErrorHeaderMsg}
        />
        <form className="place-detail-editor__form">
          {this.state.fields
            .filter(
              (fieldState, fieldName) =>
                this.props.categoryConfig.fields.find(
                  field => field.name === fieldName
                ).type !== constants.SUBMIT_FIELD_TYPENAME
            )
            .map((fieldState, fieldName) => {
              const fieldConfig = this.props.categoryConfig.fields.find(
                field => field.name === fieldName
              );

              return (
                <FormField
                  {...this.getMapDrawingToolbarState(fieldConfig)}
                  fieldConfig={fieldConfig}
                  attachmentModels={this.props.attachmentModels}
                  categoryConfig={this.categoryConfig}
                  disabled={this.state.isSubmitting}
                  fieldState={fieldState}
                  onGeometryStyleChange={this.props.onGeometryStyleChange}
                  onAdditionalData={this.props.onAdditionalData}
                  isInitializing={this.state.isInitializing}
                  key={fieldName}
                  map={this.props.map}
                  mapConfig={this.props.mapConfig}
                  modelId={this.props.placeModel.get(
                    constants.MODEL_ID_PROPERTY_NAME
                  )}
                  onFieldChange={this.onFieldChange.bind(this)}
                  places={this.props.places}
                  router={this.props.router}
                  showValidityStatus={this.state.showValidityStatus}
                  updatingField={this.state.updatingField}
                />
              );
            })
            .toArray()}
          <div
            className={classNames("place-detail-editor__spinner", {
              "place-detail-editor__spinner--visible": this.props.isSubmitting,
            })}
          />
        </form>
      </div>
    );
  }
}

PlaceDetailEditor.propTypes = {
  attachmentModels: PropTypes.object,
  categoryConfig: PropTypes.object.isRequired,
  container: PropTypes.object.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  layerView: PropTypes.object,
  map: PropTypes.object,
  mapConfig: PropTypes.object,
  onAdditionalData: PropTypes.func,
  onGeometryStyleChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  placeModel: PropTypes.object.isRequired,
  places: PropTypes.object,
  router: PropTypes.object,
};

export default PlaceDetailEditor;

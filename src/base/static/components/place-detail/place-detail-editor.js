import React, { Component } from "react";
import PropTypes from "prop-types";
import emitter from "../../utils/emitter";
import classNames from "classnames";
import {
  Map as ImmutableMap,
  OrderedMap as ImmutableOrderedMap,
} from "immutable";
import Spinner from "react-spinner";
import "react-spinner/react-spinner.css";

import FormField from "../form-fields/form-field";
import WarningMessagesContainer from "../ui-elements/warning-messages-container";
import { scrollTo } from "../../utils/scroll-helpers";
import { extractEmbeddedImages } from "../../utils/embedded-images";
const Util = require("../../js/utils.js");

import { placeDetailEditor as messages } from "../../messages";
import constants from "../../constants";

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
        this.props.onModelIO(constants.PLACE_MODEL_IO_START_ACTION);

        const attrs = this.state.fields
          .filter(state => state.get(constants.FIELD_STATE_VALUE_KEY) !== null)
          .map(state => state.get(constants.FIELD_STATE_VALUE_KEY))
          .toJS();

        if (this.state.fields.get(constants.GEOMETRY_PROPERTY_NAME)) {
          attrs.style = this.geometryStyle;
        }

        // Replace image data in rich text fields with placeholders built from each
        // image's name.
        // TODO: This logic is better suited for the FormField component,
        // perhaps in an onSave hook.
        this.props.categoryConfig.fields
          .filter(
            field => field.type === constants.RICH_TEXTAREA_FIELD_TYPENAME
          )
          .forEach(field => {
            attrs[field.name] = extractEmbeddedImages(attrs[field.name]);
          });

        this.props.onPlaceModelSave(attrs, {
          success: model => {
            this.props.onModelIO(
              constants.PLACE_MODEL_IO_END_SUCCESS_ACTION,
              model
            );
          },
          error: () => {
            this.props.onModelIO(constants.PLACE_MODEL_IO_END_ERROR_ACTION);
            Util.log("USER", "place-editor", "fail-to-edit-place");
          },
        });
      } else {
        this.setState({
          formValidationErrors: newValidationErrors,
          showValidityStatus: true,
        });
        scrollTo(this.props.container, 0, 300);
      }
    });

    emitter.addListener("place-model:remove", () => {
      this.props.onModelIO(constants.PLACE_MODEL_IO_START_ACTION);
      if (confirm(messages.confirmRemove)) {
        this.props.onPlaceModelSave(
          {
            visible: false,
          },
          {
            success: model => {
              model.trigger("userHideModel", model);
            },
            error: () => {
              this.props.onModelIO(constants.PLACE_MODEL_IO_END_ERROR_ACTION);
              Util.log("USER", "place-editor", "fail-to-remove-place");
            },
          }
        );
      }
    });
  }

  componentWillUnmount() {
    emitter.removeAllListeners("place-model:update");
    emitter.removeAllListeners("place-model:remove");
  }

  onFieldChange({ fieldName, fieldStatus, isInitializing }) {
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
                  existingGeometry={this.props.placeModel.get(
                    constants.GEOMETRY_PROPERTY_NAME
                  )}
                  existingGeometryStyle={this.props.placeModel.get(
                    constants.GEOMETRY_STYLE_PROPERTY_NAME
                  )}
                  existingLayerView={this.props.layerView}
                  fieldConfig={fieldConfig}
                  attachmentModels={this.props.attachmentModels}
                  categoryConfig={this.categoryConfig}
                  disabled={this.state.isSubmitting}
                  fieldState={fieldState}
                  onGeometryStyleChange={this.props.onGeometryStyleChange}
                  onAddAttachment={this.props.onAddAttachment}
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
          {this.props.isSubmitting && <Spinner />}
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
  onAddAttachment: PropTypes.func,
  onGeometryStyleChange: PropTypes.func.isRequired,
  onModelIO: PropTypes.func.isRequired,
  onPlaceModelSave: PropTypes.func.isRequired,
  placeModel: PropTypes.object.isRequired,
  places: PropTypes.object,
  router: PropTypes.object,
};

export default PlaceDetailEditor;

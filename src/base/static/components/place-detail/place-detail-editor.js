import React, { Component } from "react";
import PropTypes from "prop-types";
import emitter from "../../utils/emitter";
import { connect } from "react-redux";
import classNames from "classnames";
import { Map, OrderedMap, fromJS } from "immutable";
import Spinner from "react-spinner";
import "react-spinner/react-spinner.css";

import FormField from "../form-fields/form-field";
import WarningMessagesContainer from "../ui-elements/warning-messages-container";
import CoverImage from "../molecules/cover-image";

import { scrollTo } from "../../utils/scroll-helpers";
import { extractEmbeddedImages } from "../../utils/embedded-images";
const Util = require("../../js/utils.js");

import { translate } from "react-i18next";
import constants from "../../constants";

import {
  activeMarkerSelector,
  geometryStyleSelector,
} from "../../state/ducks/map-drawing-toolbar";

import { getCategoryConfig } from "../../utils/config-utils";

import "./place-detail-editor.scss";

class PlaceDetailEditor extends Component {
  constructor(props) {
    super(props);

    this.categoryConfig = getCategoryConfig(
      this.props.placeModel.get(constants.LOCATION_TYPE_PROPERTY_NAME),
    );

    let fields = OrderedMap();
    this.categoryConfig.fields
      // NOTE: In the editor, we have to strip out the submit field here,
      // otherwise, since we don't render it at all, it will always be invalid.
      .filter(field => field.type !== constants.SUBMIT_FIELD_TYPENAME)
      .forEach(field => {
        fields = fields.set(
          field.name,
          Map()
            .set(
              constants.FIELD_VALUE_KEY,
              this.props.placeModel.get(field.name),
            )
            .set(
              constants.FIELD_VISIBILITY_KEY,
              field.hidden_default ? false : true,
            )
            .set(
              constants.FIELD_TRIGGER_VALUE_KEY,
              field.trigger && field.trigger.trigger_value,
            )
            .set(
              constants.FIELD_TRIGGER_TARGETS_KEY,
              field.trigger && fromJS(field.trigger.targets),
            ),
        );
      });

    this.state = {
      fields: fields,
      formValidationErrors: new Set(),
      showValidityStatus: false,
    };
  }

  componentDidMount() {
    emitter.addListener("place-model:update", () => {
      // Validate the form.
      const newValidationErrors = this.state.fields
        .filter(field => field.get(constants.FIELD_VISIBILITY_KEY))
        .filter(field => !field.get(constants.FIELD_VALIDITY_KEY))
        .reduce((newValidationErrors, invalidField) => {
          return newValidationErrors.add(
            invalidField.get(constants.FIELD_VALIDITY_MESSAGE_KEY),
          );
        }, new Set());

      if (newValidationErrors.size === 0) {
        this.props.onModelIO(constants.PLACE_MODEL_IO_START_ACTION);

        const attrs = this.state.fields
          .filter(state => state.get(constants.FIELD_VALUE_KEY) !== null)
          .map(state => state.get(constants.FIELD_VALUE_KEY))
          .toJS();

        if (this.state.fields.get(constants.GEOMETRY_PROPERTY_NAME)) {
          attrs[constants.GEOMETRY_STYLE_PROPERTY_NAME] =
            this.state.fields
              .get(constants.GEOMETRY_PROPERTY_NAME)
              .get(constants.FIELD_VALUE_KEY)[
              constants.GEOMETRY_TYPE_PROPERTY_NAME
            ] === "Point"
              ? {
                  [constants.MARKER_ICON_PROPERTY_NAME]: this.props
                    .activeMarker,
                }
              : this.props.geometryStyle;
        }

        // Replace image data in rich text fields with placeholders built from each
        // image's name.
        // TODO: This logic is better suited for the FormField component,
        // perhaps in an onSave hook.
        this.categoryConfig.fields
          .filter(
            field => field.type === constants.RICH_TEXTAREA_FIELD_TYPENAME,
          )
          .forEach(field => {
            attrs[field.name] = extractEmbeddedImages(attrs[field.name]);
          });

        this.props.onPlaceModelSave(attrs, {
          success: this.onPlaceModelSaveSuccess.bind(this),
          error: this.onPlaceModelSaveError.bind(this),
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
      // TODO: Replace this confirm, as it won't respond to client-side i18n
      // changes, plus it's a bad UX pattern.
      if (confirm(this.props.t("confirmRemove"))) {
        this.props.onModelIO(constants.PLACE_MODEL_IO_START_ACTION);
        this.props.onPlaceModelSave(
          {
            visible: false,
          },
          {
            success: this.onPlaceModelRemoveSuccess.bind(this),
            error: this.onPlaceModelRemoveError.bind(this),
          },
        );
      }
    });
  }

  componentWillUnmount() {
    emitter.removeAllListeners("place-model:update");
    emitter.removeAllListeners("place-model:remove");
  }

  onPlaceModelSaveSuccess(model) {
    emitter.emit(constants.DRAW_DELETE_GEOMETRY_EVENT);
    emitter.emit("place-collection:add-place", this.props.collectionId);
    this.props.onModelIO(constants.PLACE_MODEL_IO_END_SUCCESS_ACTION, model);
  }

  onPlaceModelSaveError() {
    this.props.onModelIO(constants.PLACE_MODEL_IO_END_ERROR_ACTION);
    Util.log("USER", "place-editor", "fail-to-edit-place");
  }

  onPlaceModelRemoveSuccess(model) {
    model.collection.remove(model.id);
  }

  onPlaceModelRemoveError() {
    this.props.onModelIO(constants.PLACE_MODEL_IO_END_ERROR_ACTION);
    Util.log("USER", "place-editor", "fail-to-remove-place");
  }

  triggerFieldVisibility(targets, isVisible) {
    targets.forEach(target => {
      const fieldStatus = this.state.fields
        .get(target)
        .set(constants.FIELD_VISIBILITY_KEY, isVisible);

      this.setState(({ fields }) => ({
        fields: fields.set(target, fieldStatus),
      }));
    });
  }

  onFieldChange({ fieldName, fieldStatus, isInitializing }) {
    // Check if this field triggers the visibility of other fields(s)
    if (fieldStatus.get(constants.FIELD_TRIGGER_VALUE_KEY)) {
      const isVisible =
        fieldStatus.get(constants.FIELD_TRIGGER_VALUE_KEY) ===
        fieldStatus.get(constants.FIELD_VALUE_KEY);
      this.triggerFieldVisibility(
        fieldStatus.get(constants.FIELD_TRIGGER_TARGETS_KEY),
        isVisible,
      );
    }

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
          headerMsg={this.props.t("validationErrorHeaderMsg")}
        />
        {this.props.attachmentModels
          .filter(
            attachment =>
              attachment.get(constants.ATTACHMENT_TYPE_PROPERTY_NAME) ===
              constants.COVER_IMAGE_CODE,
          )
          .map((attachmentModel, i) => (
            <CoverImage
              key={i}
              isShowingDeleteButton={true}
              imageUrl={attachmentModel.get(
                constants.ATTACHMENT_FILE_PROPERTY_NAME,
              )}
              onClickRemove={() =>
                this.props.onAttachmentModelRemove(
                  attachmentModel.get(constants.MODEL_ID_PROPERTY_NAME),
                )
              }
            />
          ))}
        <form className="place-detail-editor__form">
          {this.state.fields
            .filter(
              (fieldState, fieldName) =>
                this.categoryConfig.fields.find(
                  field => field.name === fieldName,
                ).type !== constants.SUBMIT_FIELD_TYPENAME,
            )
            .filter(field => {
              return field.get(constants.FIELD_VISIBILITY_KEY);
            })
            .map((fieldState, fieldName) => {
              const fieldConfig = this.categoryConfig.fields.find(
                field => field.name === fieldName,
              );

              return (
                <FormField
                  existingGeometry={this.props.placeModel.get(
                    constants.GEOMETRY_PROPERTY_NAME,
                  )}
                  existingGeometryStyle={this.props.placeModel.get(
                    constants.GEOMETRY_STYLE_PROPERTY_NAME,
                  )}
                  existingModelId={this.props.placeModel.get(
                    constants.MODEL_ID_PROPERTY_NAME,
                  )}
                  existingCollectionId={this.props.collectionId}
                  fieldConfig={fieldConfig}
                  attachmentModels={this.props.attachmentModels}
                  categoryConfig={this.categoryConfig}
                  disabled={this.state.isSubmitting}
                  fieldState={fieldState}
                  onAddAttachment={this.props.onAddAttachment}
                  isInitializing={this.state.isInitializing}
                  key={fieldName}
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
  activeMarker: PropTypes.string,
  attachmentModels: PropTypes.object,
  collectionId: PropTypes.string.isRequired,
  container: PropTypes.object.isRequired,
  geometryStyle: PropTypes.shape({
    [constants.LINE_COLOR_PROPERTY_NAME]: PropTypes.string.isRequired,
    [constants.LINE_OPACITY_PROPERTY_NAME]: PropTypes.number.isRequired,
    [constants.FILL_COLOR_PROPERTY_NAME]: PropTypes.string.isRequired,
    [constants.FILL_OPACITY_PROPERTY_NAME]: PropTypes.number.isRequired,
  }).isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onAddAttachment: PropTypes.func,
  onAttachmentModelRemove: PropTypes.func.isRequired,
  onModelIO: PropTypes.func.isRequired,
  onPlaceModelSave: PropTypes.func.isRequired,
  placeModel: PropTypes.object.isRequired,
  places: PropTypes.object,
  router: PropTypes.object,
  t: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  activeMarker: activeMarkerSelector(state),
  geometryStyle: geometryStyleSelector(state),
});

export default connect(mapStateToProps)(
  translate("PlaceDetailEditor")(PlaceDetailEditor),
);

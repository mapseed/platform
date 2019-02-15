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
  geometryStyleProps,
} from "../../state/ducks/map-drawing-toolbar";
import { placeConfigSelector } from "../../state/ducks/place-config";
import {
  updatePlace,
  removePlace,
  removePlaceAttachment,
  placePropType,
} from "../../state/ducks/places";
import { updateEditModeToggled } from "../../state/ducks/ui";

import { getCategoryConfig } from "../../utils/config-utils";

import mapseedApiClient from "../../client/mapseed-api-client";

import "./place-detail-editor.scss";

class PlaceDetailEditor extends Component {
  constructor(props) {
    super(props);

    this.categoryConfig = getCategoryConfig(
      this.props.placeConfig,
      this.props.place.location_type,
    );

    this.attachments = [];
    let fields = OrderedMap();
    this.categoryConfig.fields
      // NOTE: In the editor, we have to strip out the submit field here,
      // otherwise, since we don't render it at all, it will always be invalid.
      .filter(field => field.type !== constants.SUBMIT_FIELD_TYPENAME)
      .filter(field => field.isVisible)
      .forEach(field => {
        fields = fields.set(
          field.name,
          Map()
            .set(constants.FIELD_VALUE_KEY, this.props.place[field.name])
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
      isNetworkRequestInFlight: false,
    };
  }

  async updatePlace() {
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
      const attrs = this.state.fields
        .filter(state => state.get(constants.FIELD_VALUE_KEY) !== null)
        .map(state => state.get(constants.FIELD_VALUE_KEY))
        .toJS();

      // A form field with name "private" should use the value "yes" to indicate
      // that a place should be private.
      // TODO: Make a special form field to encapsulate this.
      attrs.private = attrs.private === "yes" ? true : false;

      if (this.state.fields.get("geometry")) {
        attrs.style =
          this.state.fields.getIn(["geometry", "value"]).type === "Point"
            ? {
                "marker-symbol": this.props.activeMarker,
              }
            : this.props.geometryStyle;
      }

      // Replace image data in rich text fields with placeholders built from each
      // image's name.
      // TODO: This logic is better suited for the FormField component,
      // perhaps in an onSave hook.
      this.categoryConfig.fields
        .filter(field => field.type === constants.RICH_TEXTAREA_FIELD_TYPENAME)
        .forEach(field => {
          attrs[field.name] = extractEmbeddedImages(attrs[field.name]);
        });

      const placeResponse = await mapseedApiClient.place.update({
        placeUrl: this.props.place.url,
        placeData: {
          ...this.props.place,
          ...attrs,
        },
        datasetSlug: this.props.place._datasetSlug,
        clientSlug: this.props.place._clientSlug,
      });

      this.setState({
        isNetworkRequestInFlight: false,
      });

      if (placeResponse) {
        Util.log("USER", "place", "successfully-update-place");

        // Save attachments.
        if (this.attachments.length) {
          await Promise.all(
            this.attachments.map(async attachment => {
              const attachmentResponse = await mapseedApiClient.attachments.create(
                placeResponse.url,
                attachment,
              );

              if (attachmentResponse) {
                placeResponse.attachments.push(attachmentResponse);
                Util.log("USER", "dataset", "successfully-add-attachment");
              } else {
                alert("Oh dear. It looks like an attachment didn't save.");
                Util.log("USER", "place", "fail-to-add-attachment");
              }
            }),
          );
        }

        emitter.emit(constants.DRAW_DELETE_GEOMETRY_EVENT);

        this.props.updatePlace(placeResponse);

        emitter.emit(
          constants.PLACE_COLLECTION_ADD_PLACE_EVENT,
          this.props.place._datasetSlug,
        );

        this.props.updateEditModeToggled(false);
        this.props.onRequestEnd();

        scrollTo(this.props.container, 0, 100);
      } else {
        alert("Oh dear. It looks like that didn't save. Please try again.");
        Util.log("USER", "place", "fail-to-update-place");
        this.props.onRequestEnd();
      }
    } else {
      this.setState({
        formValidationErrors: newValidationErrors,
        showValidityStatus: true,
      });
      scrollTo(this.props.container, 0, 300);
    }
  }

  async removePlace() {
    const response = await mapseedApiClient.place.update({
      placeUrl: this.props.place.url,
      placeData: {
        ...this.props.place,
        visible: false,
      },
      datasetSlug: this.props.place._datasetSlug,
      clientSlug: this.props.place._clientSlug,
    });

    this.setState({
      isNetworkRequestInFlight: false,
    });

    if (response) {
      this.props.router.navigate("/", { trigger: true });
      this.props.removePlace(this.props.place.id);
      emitter.emit(
        constants.PLACE_COLLECTION_REMOVE_PLACE_EVENT,
        this.props.place._datasetSlug,
      );

      Util.log("USER", "place", "successfully-remove-place");
      this.props.updateEditModeToggled(false);
    } else {
      alert("Oh dear. It looks like that didn't save. Please try again.");
      Util.log("USER", "place", "fail-to-remove-place");
      this.props.onRequestEnd();
    }
  }

  onClickRemoveAttachment = async attachmentId => {
    const response = mapseedApiClient.attachments.delete(
      this.props.place.url,
      attachmentId,
    );

    if (response) {
      this.props.removePlaceAttachment(this.props.place.id, attachmentId);
    } else {
      alert("Oh dear. It looks like that didn't save. Please try again.");
      Util.log("USER", "place", "fail-to-remove-attachment");
    }
  };

  onAddAttachment = attachment => {
    this.attachments.push(attachment);
  };

  componentDidUpdate(prevProps) {
    if (
      prevProps.placeRequestType !== this.props.placeRequestType &&
      this.props.placeRequestType !== null
    ) {
      // A network request has been initiated from the EditorBar.
      this.setState({
        isNetworkRequestInFlight: true,
      });
      switch (this.props.placeRequestType) {
        case "update":
          this.updatePlace();
          break;
        case "remove":
          this.removePlace();
          break;
        default:
          break;
      }
    }
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
        {this.props.place.attachments
          .filter(attachment => attachment.type === "CO")
          .map((attachment, i) => (
            <CoverImage
              key={i}
              isEditable={true}
              imageUrl={attachment.file}
              attachmentId={attachment.id}
              onClickRemove={this.onClickRemoveAttachment}
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
                fieldConfig.isVisible && (
                  <FormField
                    existingGeometry={this.props.place.geometry}
                    existingGeometryStyle={this.props.place.style}
                    existingPlaceId={this.props.place.id}
                    datasetSlug={this.props.place._datasetSlug}
                    fieldConfig={fieldConfig}
                    attachments={this.props.place.attachments}
                    categoryConfig={this.categoryConfig}
                    disabled={this.state.isSubmitting}
                    fieldState={fieldState}
                    onAddAttachment={this.onAddAttachment}
                    isInitializing={this.state.isInitializing}
                    key={fieldName}
                    onFieldChange={this.onFieldChange.bind(this)}
                    router={this.props.router}
                    showValidityStatus={this.state.showValidityStatus}
                    updatingField={this.state.updatingField}
                  />
                )
              );
            })
            .toArray()}
          {this.state.isNetworkRequestInFlight && <Spinner />}
        </form>
      </div>
    );
  }
}

PlaceDetailEditor.propTypes = {
  activeMarker: PropTypes.string,
  attachments: PropTypes.array,
  container: PropTypes.object.isRequired,
  geometryStyle: geometryStyleProps.isRequired,
  isSubmitting: PropTypes.bool,
  onAddAttachment: PropTypes.func,
  onRequestEnd: PropTypes.func.isRequired,
  placeConfig: PropTypes.object.isRequired,
  place: placePropType.isRequired,
  placeRequestType: PropTypes.string,
  removePlace: PropTypes.func.isRequired,
  removePlaceAttachment: PropTypes.func.isRequired,
  router: PropTypes.object,
  t: PropTypes.func.isRequired,
  updateEditModeToggled: PropTypes.func.isRequired,
  updatePlace: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  activeMarker: activeMarkerSelector(state),
  geometryStyle: geometryStyleSelector(state),
  placeConfig: placeConfigSelector(state),
});

const mapDispatchToProps = dispatch => ({
  updateEditModeToggled: isToggled =>
    dispatch(updateEditModeToggled(isToggled)),
  updatePlace: place => dispatch(updatePlace(place)),
  removePlace: placeId => dispatch(removePlace(placeId)),
  removePlaceAttachment: (placeId, attachmentId) =>
    dispatch(removePlaceAttachment(placeId, attachmentId)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(translate("PlaceDetailEditor")(PlaceDetailEditor));

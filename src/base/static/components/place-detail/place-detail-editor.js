import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classNames from "classnames";
import { Map, OrderedMap, fromJS } from "immutable";
import Spinner from "react-spinner";
import "react-spinner/react-spinner.css";

import FormField from "../form-fields/form-field";
import WarningMessagesContainer from "../molecules/warning-messages-container";
import CoverImage from "../molecules/cover-image";

import { jumpTo } from "../../utils/scroll-helpers";
import { extractEmbeddedImages } from "../../utils/embedded-images";
const Util = require("../../js/utils.js");

import { translate } from "react-i18next";

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
  updateActiveEditPlaceId,
} from "../../state/ducks/places";
import {
  removeFeatureInGeoJSONSource,
  updateFeatureInGeoJSONSource,
  updateFocusedGeoJSONFeatures,
} from "../../state/ducks/map";
import { updateEditModeToggled, layoutSelector } from "../../state/ducks/ui";
import {
  isInAtLeastOneGroup,
  hasAdminAbilities,
  hasGroupAbilitiesInDatasets,
} from "../../state/ducks/user";

import { getCategoryConfig } from "../../utils/config-utils";
import { toClientGeoJSONFeature } from "../../utils/place-utils";
import { Mixpanel } from "../../utils/mixpanel";

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
      .filter(field => field.type !== "submit")
      .filter(field => field.isVisible)
      .forEach(field => {
        const fieldConfig = fromJS(
          this.categoryConfig.fields.find(f => f.name === field.name),
        );
        fields = fields.set(
          field.name,
          Map()
            .set(
              "value",
              field.name === "private"
                ? // Private fields will be returned with a true or false value,
                  // which should be mapped to the "yes"/"no" values of the field
                  // which manipulates the private setting.
                  // TODO: This should be better encapsulated.
                  this.props.place["private"]
                  ? "yes"
                  : "no"
                : this.props.place[field.name],
            )
            .set("config", fieldConfig)
            .set(
              // A field will be hidden if it is explicitly declared as
              // hidden_default in the config, or if it is restricted to a
              // group and the current user is not in that group or is not in
              // the administrators group.
              "isVisible",
              field.hidden_default
                ? false
                : fieldConfig.has("restrictToGroups")
                  ? this.props.isInAtLeastOneGroup(
                      fieldConfig.get("restrictToGroups"),
                      this.props.place._datasetSlug,
                    ) ||
                    this.props.hasAdminAbilities(this.props.place._datasetSlug)
                  : true,
            )
            .set("trigger", field.trigger && field.trigger.trigger_value)
            .set(
              "triggerTargets",
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

  componentDidMount() {
    this.props.updateActiveEditPlaceId(this.props.place.id);
  }

  componentWillUnmount() {
    this.props.updateActiveEditPlaceId(null);
  }

  async updatePlace() {
    // Validate the form.
    const newValidationErrors = this.state.fields
      .filter(field => field.get("isVisible"))
      .filter(field => !field.get("isValid"))
      .reduce((newValidationErrors, invalidField) => {
        return newValidationErrors.add(invalidField.get("message"));
      }, new Set());

    if (newValidationErrors.size === 0) {
      const attrs = this.state.fields
        .filter(state => state.get("value") !== null)
        .map(state => state.get("value"))
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
        .filter(field => field.type === "rich_textarea")
        .forEach(field => {
          attrs[field.name] = extractEmbeddedImages(attrs[field.name]);
        });

      Mixpanel.track("Updating place", { placeUrl: this.props.place.url });
      const placeResponse = await mapseedApiClient.place.update({
        placeUrl: this.props.place.url,
        placeData: {
          ...this.props.place,
          ...attrs,
        },
        datasetSlug: this.props.place._datasetSlug,
        clientSlug: this.props.place._clientSlug,
        hasAdminAbilities: this.props.hasAdminAbilities(
          this.props.place._datasetSlug,
        ),
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
                {
                  placeUrl: placeResponse.url,
                  attachment,
                  includePrivate: this.props.hasGroupAbilitiesInDatasets({
                    abilities: ["can_access_protected"],
                    datasetSlugs: [this.props.place._datasetSlug],
                    submissionSet: "places",
                  }),
                },
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

        this.props.updatePlace(placeResponse);
        this.props.updateFeatureInGeoJSONSource({
          sourceId: this.props.place._datasetSlug,
          featureId: placeResponse.id,
          feature: toClientGeoJSONFeature(placeResponse),
        });

        const { geometry, ...rest } = placeResponse;
        // Update the focused feature.
        this.props.updateFocusedGeoJSONFeatures([
          {
            type: "Feature",
            geometry: {
              type: geometry.type,
              coordinates: geometry.coordinates,
            },
            properties: rest,
          },
        ]);
        this.props.updateEditModeToggled(false);
        this.props.onRequestEnd();
        jumpTo({
          contentPanelInnerContainerRef: this.props
            .contentPanelInnerContainerRef,
          scrollPositon: 0,
          layout: this.props.layout,
        });
      } else {
        alert("Oh dear. It looks like that didn't save. Please try again.");
        Util.log("USER", "place", "fail-to-update-place");
        this.props.onRequestEnd();
      }
    } else {
      this.props.onRequestEnd();
      this.setState({
        formValidationErrors: newValidationErrors,
        showValidityStatus: true,
        isNetworkRequestInFlight: false,
      });
      jumpTo({
        contentPanelInnerContainerRef: this.props.contentPanelInnerContainerRef,
        scrollPositon: 0,
        layout: this.props.layout,
      });
      this.props.setPlaceRequestType(null);
    }
  }

  async removePlace() {
    Mixpanel.track("Removing place", { placeUrl: this.props.place.url });
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
      this.props.removeFeatureInGeoJSONSource(
        this.props.place._datasetSlug,
        this.props.place.id,
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
        .set("isVisible", isVisible);

      this.setState(({ fields }) => ({
        fields: fields.set(target, fieldStatus),
      }));
    });
  }

  onFieldChange({ fieldName, fieldStatus, isInitializing }) {
    // Check if this field triggers the visibility of other fields(s)
    if (fieldStatus.get("trigger")) {
      const isVisible = fieldStatus.get("trigger") === fieldStatus.get("value");
      this.triggerFieldVisibility(fieldStatus.get("triggerTargets"), isVisible);
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
        {this.state.formValidationErrors.size > 0 && (
          <WarningMessagesContainer
            errors={this.state.formValidationErrors}
            headerMsg={this.props.t("validationErrorHeaderMsg")}
          />
        )}
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
            .filter(field => field.get("isVisible"))
            .map((field, fieldName) => (
              <FormField
                existingGeometry={this.props.place.geometry}
                existingGeometryStyle={this.props.place.style}
                existingPlaceId={this.props.place.id}
                datasetSlug={this.props.place._datasetSlug}
                fieldConfig={field.get("config").toJS()}
                attachments={this.props.place.attachments}
                categoryConfig={this.categoryConfig}
                disabled={this.state.isSubmitting}
                fieldState={field}
                onAddAttachment={this.onAddAttachment}
                isInitializing={this.state.isInitializing}
                key={fieldName}
                onFieldChange={this.onFieldChange.bind(this)}
                router={this.props.router}
                showValidityStatus={this.state.showValidityStatus}
                updatingField={this.state.updatingField}
              />
            ))
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
  contentPanelInnerContainerRef: PropTypes.object.isRequired,
  geometryStyle: geometryStyleProps.isRequired,
  hasAdminAbilities: PropTypes.func.isRequired,
  hasGroupAbilitiesInDatasets: PropTypes.func.isRequired,
  isInAtLeastOneGroup: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  layout: PropTypes.string.isRequired,
  onAddAttachment: PropTypes.func,
  onRequestEnd: PropTypes.func.isRequired,
  placeConfig: PropTypes.object.isRequired,
  place: placePropType.isRequired,
  placeRequestType: PropTypes.string,
  removePlace: PropTypes.func.isRequired,
  removeFeatureInGeoJSONSource: PropTypes.func.isRequired,
  removePlaceAttachment: PropTypes.func.isRequired,
  router: PropTypes.object,
  setPlaceRequestType: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  updateActiveEditPlaceId: PropTypes.func.isRequired,
  updateEditModeToggled: PropTypes.func.isRequired,
  updateFeatureInGeoJSONSource: PropTypes.func.isRequired,
  updateFocusedGeoJSONFeatures: PropTypes.func.isRequired,
  updatePlace: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  activeMarker: activeMarkerSelector(state),
  hasAdminAbilities: datasetSlug => hasAdminAbilities(state, datasetSlug),
  isInAtLeastOneGroup: (groupNames, datasetSlug) =>
    isInAtLeastOneGroup(state, groupNames, datasetSlug),
  layout: layoutSelector(state),
  geometryStyle: geometryStyleSelector(state),
  placeConfig: placeConfigSelector(state),
  hasGroupAbilitiesInDatasets: ({ abilities, datasetSlugs, submissionSet }) =>
    hasGroupAbilitiesInDatasets({
      state,
      abilities,
      datasetSlugs,
      submissionSet,
    }),
});

const mapDispatchToProps = dispatch => ({
  updateEditModeToggled: isToggled =>
    dispatch(updateEditModeToggled(isToggled)),
  updatePlace: place => dispatch(updatePlace(place)),
  removeFeatureInGeoJSONSource: (sourceId, featureId) =>
    dispatch(removeFeatureInGeoJSONSource(sourceId, featureId)),
  removePlace: placeId => dispatch(removePlace(placeId)),
  removePlaceAttachment: (placeId, attachmentId) =>
    dispatch(removePlaceAttachment(placeId, attachmentId)),
  updateActiveEditPlaceId: placeId =>
    dispatch(updateActiveEditPlaceId(placeId)),
  updateFeatureInGeoJSONSource: ({ sourceId, featureId, feature }) =>
    dispatch(updateFeatureInGeoJSONSource({ sourceId, featureId, feature })),
  updateFocusedGeoJSONFeatures: newFeatures =>
    dispatch(updateFocusedGeoJSONFeatures(newFeatures)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(translate("PlaceDetailEditor")(PlaceDetailEditor));

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Map, OrderedMap, fromJS } from "immutable";
import classNames from "classnames";
import Spinner from "react-spinner";
import { connect } from "react-redux";

import FormField from "../form-fields/form-field";
import WarningMessagesContainer from "../ui-elements/warning-messages-container";
import FormStageHeaderBar from "../molecules/form-stage-header-bar";
import FormStageControlBar from "../molecules/form-stage-control-bar";

import { translate } from "react-i18next";
import { extractEmbeddedImages } from "../../utils/embedded-images";
import "./index.scss";

import { getCategoryConfig } from "../../utils/config-utils";
import { toClientGeoJSONFeature } from "../../utils/place-utils";
import { mapConfigSelector } from "../../state/ducks/map-config";
import { placeConfigSelector } from "../../state/ducks/place-config";
import { createPlace } from "../../state/ducks/places";
import { datasetClientSlugSelector } from "../../state/ducks/datasets-config";
import {
  activeMarkerSelector,
  geometryStyleSelector,
  setActiveDrawingTool,
  geometryStyleProps,
  setActiveDrawGeometryId,
} from "../../state/ducks/map-drawing-toolbar";
import {
  mapCenterpointSelector,
  mapDraggedOrZoomedSelector,
  createFeaturesInGeoJSONSource,
  updateLayerGroupVisibility,
} from "../../state/ducks/map";
import { hasAdminAbilities, isInAtLeastOneGroup } from "../../state/ducks/user";
import { updateUIVisibility, layoutSelector } from "../../state/ducks/ui";
import emitter from "../../utils/emitter";
import { jumpTo } from "../../utils/scroll-helpers";

const Util = require("../../js/utils.js");

import mapseedApiClient from "../../client/mapseed-api-client";

// TEMPORARY: We define flavor hooks here for the time being.
const MYWATER_SCHOOL_DISTRICTS = require("../../../../flavors/central-puget-sound/static/school-districts.json");
const hooks = {
  myWaterAddDistrict: attrs => {
    attrs.district = MYWATER_SCHOOL_DISTRICTS[attrs["school-name"]] || "";

    return attrs;
  },
};

class InputForm extends Component {
  constructor(props) {
    super(props);

    this.initializeForm(props.selectedCategory);
    this.state = {
      fields: this.getNewFields(OrderedMap()),
      updatingField: null,
      isFormSubmitting: false,
      formValidationErrors: new Set(),
      showValidityStatus: false,
      isMapPositioned: false,
      currentStage: 1,
    };
  }

  componentDidMount() {
    if (this.selectedCategoryConfig.multi_stage) {
      const stageConfig = this.selectedCategoryConfig.multi_stage[
        this.state.currentStage - 1
      ];

      this.setStageLayers(stageConfig);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.isFormResetting ||
      this.props.selectedCategory !== prevProps.selectedCategory
    ) {
      this.initializeForm(this.props.selectedCategory);
      this.setState({
        fields: this.getNewFields(prevState.fields),
        isFormSubmitting: false,
        isMapPositioned: false,
        formValidationErrors: new Set(),
        showValidityStatus: false,
      });
    }

    if (
      this.state.currentStage !== prevState.currentStage &&
      this.selectedCategoryConfig.multi_stage
    ) {
      // Configure layer visibility for this form stage.
      const stageConfig = this.selectedCategoryConfig.multi_stage[
        this.state.currentStage - 1
      ];

      this.setStageLayers(stageConfig);
    }
  }

  setStageLayers(stageConfig) {
    if (stageConfig.visibleLayerGroupIds) {
      // Set layers for this stage.
      stageConfig.visibleLayerGroupIds.forEach(layerGroupId =>
        this.props.updateLayerGroupVisibility(layerGroupId, true),
      );
      // Hide all other layers.
      this.props.mapConfig.layerGroups
        .filter(
          layerGroup =>
            !stageConfig.visibleLayerGroupIds.includes(layerGroup.id),
        )
        .forEach(layerGroup =>
          this.props.updateLayerGroupVisibility(layerGroup.id, false),
        );
    }
  }

  getNewFields(prevFields) {
    return this.selectedCategoryConfig.fields
      .filter(field => field.isVisible)
      .reduce((memo, field) => {
        const fieldConfig = fromJS(
          this.selectedCategoryConfig.fields.find(f => f.name === field.name),
        );
        return memo.set(
          field.name,
          Map({
            value: "",
            config: fieldConfig,
            trigger: field.trigger && field.trigger.trigger_value,
            triggerTargets: field.trigger && fromJS(field.trigger.targets),
            // A field will be hidden if it is explicitly declared as
            // hidden_default in the config, or if it is restricted to a
            // group and the current user is not in that group or is not in
            // the administrators group.
            isVisible: field.hidden_default
              ? false
              : fieldConfig.has("restrictToGroups")
                ? this.props.isInAtLeastOneGroup(
                    fieldConfig.get("restrictToGroups"),
                    this.props.datasetSlug,
                  ) || this.props.hasAdminAbilities(this.props.datasetSlug)
                : true,
            renderKey: prevFields.has(field.name)
              ? prevFields.getIn([field.name, "renderKey"]) + "_"
              : this.selectedCategoryConfig.category + field.name,
            isAutoFocusing: prevFields.get("isAutoFocusing"),
            advanceStage: field.advance_stage_on_value,
          }),
        );
      }, OrderedMap());
  }

  initializeForm(selectedCategory) {
    this.selectedCategoryConfig = getCategoryConfig(
      this.props.placeConfig,
      selectedCategory,
    );
    this.isWithCustomGeometry =
      this.selectedCategoryConfig.fields.findIndex(
        field => field.type === "map_drawing_toolbar",
      ) >= 0;
    this.attachments = [];
    if (this.isWithCustomGeometry) {
      this.props.updateSpotlightMaskVisibility(false);
      this.props.updateMapCenterpointVisibility(false);
    } else {
      this.props.updateMapCenterpointVisibility(true);
    }
  }

  onFieldChange({ fieldName, fieldStatus, isInitializing }) {
    fieldStatus = fieldStatus.set(
      "renderKey",
      this.state.fields.getIn([fieldName, "renderKey"]),
    );

    // Check if this field triggers the visibility of other fields(s)
    if (fieldStatus.get("trigger") && !isInitializing) {
      const isVisible = fieldStatus.get("trigger") === fieldStatus.get("value");
      this.triggerFieldVisibility(fieldStatus.get("triggerTargets"), isVisible);
    }

    this.setState(({ fields }) => ({
      fields: fields.set(fieldName, fieldStatus),
      updatingField: fieldName,
      isInitializing: isInitializing,
    }));

    // Check if this field should advance the current stage.
    if (
      fieldStatus.get("advanceStage") === fieldStatus.get("value") &&
      !isInitializing
    ) {
      this.validateForm(() => {
        jumpTo({
          contentPanelInnerContainerRef: this.props
            .contentPanelInnerContainerRef,
          scrollPosition: 0,
          layout: this.props.layout,
        });
        this.setState({
          currentStage: this.state.currentStage + 1,
          showValidityStatus: false,
          formValidationErrors: new Set(),
        });
      });
    }
  }

  triggerFieldVisibility(targets, isVisible) {
    this.setState({
      fields: this.state.fields.map((field, fieldName) => {
        return targets.includes(fieldName)
          ? field
              .set("isVisible", isVisible)
              .set(
                "isAutoFocusing",
                targets.indexOf(fieldName) === 0 && isVisible,
              )
          : field;
      }),
    });
  }

  onAddAttachment(attachment) {
    this.attachments.push(attachment);
  }

  validateForm(successCallback) {
    let {
      validationErrors: newValidationErrors,
      isValid,
    } = this.getFields().reduce(
      ({ validationErrors, isValid }, field) => {
        if (!field.get("isValid")) {
          validationErrors.add(field.get("message"));
          isValid = false;
        }
        return { validationErrors, isValid };
      },
      { validationErrors: new Set(), isValid: true },
    );

    if (!this.props.isMapDraggedOrZoomed) {
      newValidationErrors.add("mapNotDragged");
      isValid = false;
    }

    if (isValid) {
      successCallback();
    } else {
      this.setState({
        formValidationErrors: newValidationErrors,
        showValidityStatus: true,
      });
      jumpTo({
        contentPanelInnerContainerRef: this.props.contentPanelInnerContainerRef,
        scrollPosition: 0,
        layout: this.props.layout,
      });
    }
  }

  onSubmit() {
    Util.log("USER", "new-place", "submit-place-btn-click");

    this.validateForm(this.createPlace);
  }

  createPlace = async () => {
    this.setState({
      isFormSubmitting: true,
    });

    let attrs = {
      ...this.state.fields
        .filter(state => !!state.get("value"))
        .map(state => state.get("value"))
        .toJS(),
      location_type: this.selectedCategoryConfig.category,
    };

    // A form field with name "private" should use the value "yes" to indicate
    // that a place should be private.
    // TODO: Make a special form field to encapsulate this.
    attrs.private = attrs.private === "yes" ? true : false;

    if (this.state.fields.get("geometry")) {
      attrs["style"] =
        this.state.fields.getIn(["geometry", "value"]).type === "Point"
          ? { "marker-symbol": this.props.activeMarker }
          : this.props.geometryStyle;
    } else {
      const { longitude, latitude } = this.props.mapCenterpoint;
      attrs.geometry = {
        type: "Point",
        coordinates: [longitude, latitude],
      };
    }

    // Replace image data in rich text fields with placeholders built from each
    // image's name.
    // TODO: This logic is better suited for the FormField component,
    // perhaps in an onSave hook.
    this.selectedCategoryConfig.fields
      .filter(field => field.type === "rich_textarea")
      .forEach(field => {
        attrs[field.name] = extractEmbeddedImages(attrs[field.name]);
      });

    // Fire pre-save hook.
    // The pre-save hook allows flavors to attach arbitrary data to the attrs
    // object before submission to the database.
    if (this.props.customHooks && this.props.customHooks.preSave) {
      attrs = hooks[this.props.customHooks.preSave](attrs);
    }

    const placeResponse = await mapseedApiClient.place.create({
      datasetUrl: this.props.datasetUrl,
      placeData: attrs,
      datasetSlug: this.props.datasetSlug,
      clientSlug: this.props.datasetClientSlugSelector(this.props.datasetSlug),
      includePrivate: this.props.hasAdminAbilities(this.props.datasetSlug),
    });

    if (!placeResponse) {
      alert("Oh dear. It looks like that didn't save. Please try again.");
      Util.log("USER", "place", "fail-to-create-place");
      return;
    }
    if (placeResponse.isOffline) {
      alert(
        "No internet connection detected. Your submission may not be successful until you are back online.",
      );
      Util.log("USER", "place", "submitted-offline-place");
      this.props.router.navigate("/", { trigger: true });
      return;
    }
    Util.log("USER", "new-place", "successfully-add-place");

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

    // Only add this place to the places duck if it isn't private.
    !placeResponse.private && this.props.createPlace(placeResponse);
    !placeResponse.private &&
      this.props.createFeaturesInGeoJSONSource(
        // "sourceId" and a place's datasetSlug are the same thing.
        this.props.datasetSlug,
        toClientGeoJSONFeature(placeResponse),
      );

    this.setState({ isFormSubmitting: false, showValidityStatus: false });

    // Save autofill values as necessary.
    // TODO: This logic is better suited for the FormField component,
    // perhaps in an onSave hook.
    this.selectedCategoryConfig.fields.forEach(fieldConfig => {
      if (fieldConfig.autocomplete) {
        Util.saveAutocompleteValue(
          fieldConfig.name,
          this.state.fields.getIn([fieldConfig.name, "value"]),
          30, // 30 days
        );
      }
    });

    this.props.setActiveDrawGeometryId(null);

    // Fire post-save hook.
    // The post-save hook allows flavors to hijack the default
    // route-to-detail-view behavior.
    // TODO: are we still using these? Is it ok to delete this?
    if (this.props.customHooks && this.props.customHooks.postSave) {
      this.props.customHooks.postSave(
        placeResponse,
        this.defaultPostSave.bind(this),
      );
    } else {
      this.defaultPostSave(placeResponse);
    }
  };

  defaultPostSave(place) {
    if (place.private) {
      this.props.router.navigate("/", { trigger: true });
      emitter.emit("info-modal:open", {
        header: this.props.t("privateSubmissionModalHeader"),
        body: [this.props.t("privateSubmissionModalBody")],
      });
    } else {
      this.props.router.navigate(
        `${this.props.datasetClientSlugSelector(this.props.datasetSlug)}/${
          place.id
        }`,
        {
          trigger: true,
        },
      );
    }
  }

  getStageStartField() {
    return this.selectedCategoryConfig.multi_stage
      ? this.selectedCategoryConfig.multi_stage[this.state.currentStage - 1]
          .start_field_index - 1
      : 0;
  }

  getStageEndField() {
    return this.selectedCategoryConfig.multi_stage
      ? this.selectedCategoryConfig.multi_stage[this.state.currentStage - 1]
          .end_field_index
      : this.selectedCategoryConfig.fields.length;
  }

  getFields() {
    return (this.selectedCategoryConfig.multi_stage
      ? this.getFieldsFromStage({
          fields: this.state.fields,
          stage: this.selectedCategoryConfig.multi_stage[
            this.state.currentStage - 1
          ],
        })
      : this.state.fields
    ).filter(field => field.get("isVisible"));
  }

  getFieldsFromStage({ fields, stage }) {
    return fields.slice(stage.start_field_index - 1, stage.end_field_index);
  }

  render() {
    const cn = {
      form: classNames("input-form__form", this.props.className, {
        "input-form__form--inactive": this.state.isFormSubmitting,
      }),
      warningMsgs: classNames("input-form__warning-msgs-container", {
        "input-form__warning-msgs-container--visible":
          this.state.formValidationErrors.size > 0 &&
          this.state.showValidityStatus,
      }),
      spinner: classNames("input-form__submit-spinner", {
        "input-form__submit-spinner--visible": this.state.isFormSubmitting,
      }),
    };

    return (
      <div className="input-form">
        {this.selectedCategoryConfig.multi_stage && (
          <FormStageHeaderBar
            stageConfig={
              this.selectedCategoryConfig.multi_stage[
                this.state.currentStage - 1
              ]
            }
          />
        )}
        {this.state.formValidationErrors.size > 0 && (
          <WarningMessagesContainer
            errors={[...this.state.formValidationErrors]}
            headerMsg={this.props.t("validationHeader")}
          />
        )}
        <form
          id="mapseed-input-form"
          className={cn.form}
          onSubmit={evt => evt.preventDefault()}
        >
          {this.getFields()
            .map(field => (
              <FormField
                fieldConfig={field.get("config").toJS()}
                disabled={this.state.isFormSubmitting}
                fieldState={field}
                isInitializing={this.state.isInitializing}
                key={field.get("renderKey")}
                onAddAttachment={this.onAddAttachment.bind(this)}
                onFieldChange={this.onFieldChange.bind(this)}
                router={this.props.router}
                showValidityStatus={this.state.showValidityStatus}
                updatingField={this.state.updatingField}
                onClickSubmit={this.onSubmit.bind(this)}
              />
            ))
            .toArray()}
        </form>
        {this.state.isFormSubmitting && <Spinner />}

        {this.selectedCategoryConfig.multi_stage && (
          <FormStageControlBar
            onClickAdvanceStage={() => {
              this.validateForm(() => {
                jumpTo({
                  contentPanelInnerContainerRef: this.props
                    .contentPanelInnerContainerRef,
                  scrollPosition: 0,
                  layout: this.props.layout,
                });
                this.setState({
                  currentStage: this.state.currentStage + 1,
                  showValidityStatus: false,
                  formValidationErrors: new Set(),
                });
              });
            }}
            onClickRetreatStage={() => {
              if (
                this.state.currentStage === 1 &&
                !this.props.isSingleCategory
              ) {
                this.props.onCategoryChange(null);
              } else {
                jumpTo({
                  contentPanelInnerContainerRef: this.props
                    .contentPanelInnerContainerRef,
                  scrollPosition: 0,
                  layout: this.props.layout,
                });
                this.setState({
                  currentStage: this.state.currentStage - 1,
                  showValidityStatus: false,
                  formValidationErrors: new Set(),
                });
              }
            }}
            currentStage={this.state.currentStage}
            numStages={this.selectedCategoryConfig.multi_stage.length}
            isSingleCategory={this.props.isSingleCategory}
          />
        )}
      </div>
    );
  }
}

InputForm.propTypes = {
  activeMarker: PropTypes.string,
  className: PropTypes.string,
  customHooks: PropTypes.oneOfType([
    PropTypes.objectOf(PropTypes.func),
    PropTypes.bool,
  ]),
  container: PropTypes.instanceOf(HTMLElement),
  contentPanelInnerContainerRef: PropTypes.object.isRequired,
  createPlace: PropTypes.func.isRequired,
  datasetClientSlugSelector: PropTypes.func.isRequired,
  datasetUrl: PropTypes.string.isRequired,
  datasetSlug: PropTypes.string.isRequired,
  geometryStyle: geometryStyleProps,
  hasAdminAbilities: PropTypes.func.isRequired,
  isContinuingFormSession: PropTypes.bool,
  isFormResetting: PropTypes.bool,
  isFormSubmitting: PropTypes.bool,
  isInAtLeastOneGroup: PropTypes.func.isRequired,
  isLeavingForm: PropTypes.bool,
  isMapDraggedOrZoomed: PropTypes.bool.isRequired,
  isSingleCategory: PropTypes.bool,
  layout: PropTypes.string.isRequired,
  mapConfig: PropTypes.object.isRequired,
  mapCenterpoint: PropTypes.object,
  onCategoryChange: PropTypes.func,
  placeConfig: PropTypes.object.isRequired,
  renderCount: PropTypes.number,
  router: PropTypes.object.isRequired,
  selectedCategory: PropTypes.string.isRequired,
  setActiveDrawingTool: PropTypes.func.isRequired,
  setActiveDrawGeometryId: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  updateMapCenterpointVisibility: PropTypes.func.isRequired,
  updateSpotlightMaskVisibility: PropTypes.func.isRequired,
  createFeaturesInGeoJSONSource: PropTypes.func.isRequired,
  updateLayerGroupVisibility: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  activeMarker: activeMarkerSelector(state),
  datasetClientSlugSelector: datasetSlug =>
    datasetClientSlugSelector(state, datasetSlug),
  geometryStyle: geometryStyleSelector(state),
  hasAdminAbilities: datasetSlug => hasAdminAbilities(state, datasetSlug),
  isInAtLeastOneGroup: (groupNames, datasetSlug) =>
    isInAtLeastOneGroup(state, groupNames, datasetSlug),
  isMapDraggedOrZoomed: mapDraggedOrZoomedSelector(state),
  layout: layoutSelector(state),
  mapConfig: mapConfigSelector(state),
  mapCenterpoint: mapCenterpointSelector(state),
  placeConfig: placeConfigSelector(state),
});

const mapDispatchToProps = dispatch => ({
  createFeaturesInGeoJSONSource: (sourceId, sourceData) =>
    dispatch(createFeaturesInGeoJSONSource(sourceId, sourceData)),
  setActiveDrawGeometryId: id => dispatch(setActiveDrawGeometryId(id)),
  setActiveDrawingTool: activeDrawingTool =>
    dispatch(setActiveDrawingTool(activeDrawingTool)),
  createPlace: place => dispatch(createPlace(place)),
  updateLayerGroupVisibility: (layerGroupId, isVisible) =>
    dispatch(updateLayerGroupVisibility(layerGroupId, isVisible)),
  updateSpotlightMaskVisibility: isVisible =>
    dispatch(updateUIVisibility("spotlightMask", isVisible)),
  updateMapCenterpointVisibility: isVisible =>
    dispatch(updateUIVisibility("mapCenterpoint", isVisible)),
});

// Export undecorated component for testing purposes.
export { InputForm };

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(translate("InputForm")(InputForm));

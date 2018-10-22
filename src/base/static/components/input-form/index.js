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
import constants from "../../constants";
import { extractEmbeddedImages } from "../../utils/embedded-images";
import { scrollTo } from "../../utils/scroll-helpers";
import "./index.scss";

import { getCategoryConfig } from "../../utils/config-utils";
import { mapPositionSelector } from "../../state/ducks/map";
import { mapConfigSelector } from "../../state/ducks/map-config";
import { placeConfigSelector } from "../../state/ducks/place-config";
import {
  activeMarkerSelector,
  geometryStyleSelector,
  setActiveDrawingTool,
  geometryStyleProps,
} from "../../state/ducks/map-drawing-toolbar";

import emitter from "../../utils/emitter";
const Util = require("../../js/utils.js");

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

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.isFormResetting ||
      nextProps.selectedCategory !== this.props.selectedCategory
    ) {
      this.initializeForm(nextProps.selectedCategory);
      this.setState(prevState => ({
        fields: this.getNewFields(prevState.fields),
        isFormSubmitting: false,
        isMapPositioned: false,
        formValidationErrors: new Set(),
        showValidityStatus: false,
      }));
    }
  }

  getNewFields(prevFields) {
    return this.selectedCategoryConfig.fields.reduce((memo, field) => {
      return memo.set(
        field.name,
        Map({
          [constants.FIELD_VALUE_KEY]: "",
          [constants.FIELD_TRIGGER_VALUE_KEY]:
            field.trigger && field.trigger.trigger_value,
          [constants.FIELD_TRIGGER_TARGETS_KEY]:
            field.trigger && fromJS(field.trigger.targets),
          [constants.FIELD_VISIBILITY_KEY]: field.hidden_default ? false : true,
          [constants.FIELD_RENDER_KEY]: prevFields.has(field.name)
            ? prevFields.get(field.name).get(constants.FIELD_RENDER_KEY) + "_"
            : this.selectedCategoryConfig.category + field.name,
          [constants.FIELD_AUTO_FOCUS_KEY]: prevFields.get(
            constants.FIELD_AUTO_FOCUS_KEY,
          ),
          [constants.FIELD_ADVANCE_STAGE_ON_VALUE_KEY]:
            field.advance_stage_on_value,
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
        field => field.type === constants.MAP_DRAWING_TOOLBAR_TYPENAME,
      ) >= 0;
    this.attachments = [];
  }

  onFieldChange({ fieldName, fieldStatus, isInitializing }) {
    fieldStatus = fieldStatus.set(
      constants.FIELD_RENDER_KEY,
      this.state.fields.get(fieldName).get(constants.FIELD_RENDER_KEY),
    );

    // Check if this field triggers the visibility of other fields(s)
    if (fieldStatus.get(constants.FIELD_TRIGGER_VALUE_KEY) && !isInitializing) {
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

    // Check if this field should advance the current stage.
    if (
      fieldStatus.get(constants.FIELD_ADVANCE_STAGE_ON_VALUE_KEY) ===
        fieldStatus.get(constants.FIELD_VALUE_KEY) &&
      !isInitializing
    ) {
      this.validateForm(() => {
        scrollTo(this.props.container, 0);
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
              .set(constants.FIELD_VISIBILITY_KEY, isVisible)
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
    const {
      validationErrors: newValidationErrors,
      isValid,
    } = this.getFields().reduce(
      ({ validationErrors, isValid }, field) => {
        if (!field.get(constants.FIELD_VALIDITY_KEY)) {
          validationErrors.add(field.get(constants.FIELD_VALIDITY_MESSAGE_KEY));
          isValid = false;
        }
        return { validationErrors, isValid };
      },
      { validationErrors: new Set(), isValid: true },
    );

    if (isValid) {
      successCallback();
    } else {
      this.setState({
        formValidationErrors: newValidationErrors,
        showValidityStatus: true,
      });
      scrollTo(this.props.container, 0);
    }
  }

  onSubmit() {
    Util.log("USER", "new-place", "submit-place-btn-click");

    this.validateForm(this.saveModel.bind(this));
  }

  saveModel() {
    // TODO: this state should disable individual fields as well (?), not just
    //       the submit button.
    this.setState({
      isFormSubmitting: true,
    });
    const collection = this.props.places[this.selectedCategoryConfig.dataset];
    collection.add(
      {
        location_type: this.selectedCategoryConfig.category,
        datasetSlug: this.props.mapConfig.layers.find(
          layer => this.selectedCategoryConfig.dataset === layer.id,
        ).slug,
        datasetId: this.selectedCategoryConfig.dataset,
        showMetadata: this.selectedCategoryConfig.showMetadata,
      },
      { wait: true },
    );
    const model = collection.at(collection.length - 1);
    let attrs = this.state.fields
      .filter(state => !!state.get(constants.FIELD_VALUE_KEY))
      .map(state => state.get(constants.FIELD_VALUE_KEY))
      .toJS();

    if (this.state.fields.get(constants.GEOMETRY_PROPERTY_NAME)) {
      attrs[constants.GEOMETRY_STYLE_PROPERTY_NAME] =
        this.state.fields
          .get(constants.GEOMETRY_PROPERTY_NAME)
          .get(constants.FIELD_VALUE_KEY).type === "Point"
          ? { [constants.MARKER_ICON_PROPERTY_NAME]: this.props.activeMarker }
          : this.props.geometryStyle;
    } else {
      const center = this.props.mapPosition.center;
      attrs.geometry = {
        type: "Point",
        coordinates: [center.lng, center.lat],
      };
    }

    // Replace image data in rich text fields with placeholders built from each
    // image's name.
    // TODO: This logic is better suited for the FormField component,
    // perhaps in an onSave hook.
    this.selectedCategoryConfig.fields
      .filter(field => field.type === constants.RICH_TEXTAREA_FIELD_TYPENAME)
      .forEach(field => {
        attrs[field.name] = extractEmbeddedImages(attrs[field.name]);
      });

    this.attachments.forEach(attachment => {
      model.attachmentCollection.add(attachment);
    });

    // Fire pre-save hook.
    // The pre-save hook allows flavors to attach arbitrary data to the attrs
    // object before submission to the database.
    if (this.props.customHooks && this.props.customHooks.preSave) {
      attrs = hooks[this.props.customHooks.preSave](attrs);
    }

    model.save(attrs, {
      success: response => {
        Util.log("USER", "new-place", "successfully-add-place");

        emitter.emit(
          constants.PLACE_COLLECTION_ADD_PLACE_EVENT,
          this.selectedCategoryConfig.dataset,
        );

        // Save autofill values as necessary.
        // TODO: This logic is better suited for the FormField component,
        // perhaps in an onSave hook.
        this.selectedCategoryConfig.fields.forEach(fieldConfig => {
          if (fieldConfig.autocomplete) {
            Util.saveAutocompleteValue(
              fieldConfig.name,
              this.state.fields
                .get(fieldConfig.name)
                .get(constants.FIELD_VALUE_KEY),
              constants.AUTOFILL_DURATION_DAYS,
            );
          }
        });

        this.setState({ isFormSubmitting: false, showValidityStatus: false });

        // Fire post-save hook.
        // The post-save hook allows flavors to hijack the default
        // route-to-detail-view behavior.
        if (this.props.customHooks && this.props.customHooks.postSave) {
          this.props.customHooks.postSave(
            response,
            model,
            this.defaultPostSave.bind(this),
          );
        } else {
          this.defaultPostSave(model);
        }
      },
      error: () => {
        Util.log("USER", "new-place", "fail-to-add-place");
      },
      wait: true,
    });
  }

  defaultPostSave(model) {
    this.props.router.navigate(Util.getUrl(model), { trigger: true });
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
    ).filter(field => {
      return field.get(constants.FIELD_VISIBILITY_KEY);
    });
  }

  getFieldsFromStage({ fields, stage }) {
    return fields.slice(stage.start_field_index - 1, stage.end_field_index);
  }

  render() {
    if (this.isWithCustomGeometry) {
      this.props.hideSpotlightMask();
      this.props.hideCenterPoint();
    } else if (!this.props.selectedCategory) {
      this.props.showNewPin();
    }

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
            .map((fieldState, fieldName) => {
              return (
                <FormField
                  fieldConfig={this.selectedCategoryConfig.fields.find(
                    field => field.name === fieldName,
                  )}
                  disabled={this.state.isFormSubmitting}
                  fieldState={fieldState}
                  isInitializing={this.state.isInitializing}
                  key={fieldState.get(constants.FIELD_RENDER_KEY)}
                  onAddAttachment={this.onAddAttachment.bind(this)}
                  onFieldChange={this.onFieldChange.bind(this)}
                  places={this.props.places}
                  router={this.props.router}
                  showValidityStatus={this.state.showValidityStatus}
                  updatingField={this.state.updatingField}
                  onClickSubmit={this.onSubmit.bind(this)}
                />
              );
            })
            .toArray()}
        </form>
        {this.state.isFormSubmitting && <Spinner />}

        {this.selectedCategoryConfig.multi_stage && (
          <FormStageControlBar
            onClickAdvanceStage={() => {
              this.validateForm(() => {
                scrollTo(this.props.container, 0);
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
                scrollTo(this.props.container, 0);
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
  geometryStyle: geometryStyleProps.isRequired,
  hideCenterPoint: PropTypes.func.isRequired,
  hideSpotlightMask: PropTypes.func.isRequired,
  isContinuingFormSession: PropTypes.bool,
  isFormResetting: PropTypes.bool,
  isFormSubmitting: PropTypes.bool,
  isLeavingForm: PropTypes.bool,
  isSingleCategory: PropTypes.bool,
  mapPosition: PropTypes.object,
  onCategoryChange: PropTypes.func,
  placeConfig: PropTypes.object.isRequired,
  places: PropTypes.object.isRequired,
  renderCount: PropTypes.number,
  router: PropTypes.object.isRequired,
  selectedCategory: PropTypes.string.isRequired,
  setActiveDrawingTool: PropTypes.func.isRequired,
  showNewPin: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  activeMarker: activeMarkerSelector(state),
  geometryStyle: geometryStyleSelector(state),
  mapConfig: mapConfigSelector(state),
  mapPosition: mapPositionSelector(state),
  placeConfig: placeConfigSelector(state),
});

const mapDispatchToProps = dispatch => ({
  setActiveDrawingTool: activeDrawingTool =>
    dispatch(setActiveDrawingTool(activeDrawingTool)),
});

// Export undecorated component for testing purposes.
export { InputForm };

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(translate("InputForm")(InputForm));

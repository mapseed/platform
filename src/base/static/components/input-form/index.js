import React, { Component } from "react";
import PropTypes from "prop-types";
import { Map, OrderedMap } from "immutable";
import classNames from "classnames";
import Spinner from "react-spinner";

import FormField from "../form-fields/form-field";
import WarningMessagesContainer from "../ui-elements/warning-messages-container";

import { translate } from "react-i18next";
import constants from "../../constants";
import { extractEmbeddedImages } from "../../utils/embedded-images";
import { scrollTo } from "../../utils/scroll-helpers";
import "./index.scss";

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
    this.state = {
      fields: OrderedMap(),
      updatingField: null,
      isFormSubmitting: false,
      formValidationErrors: new Set(),
      showValidityStatus: false,
      isMapPositioned: false,
    };

    this.isWithCustomGeometry = false;
    this.geometryStyle = null;
    this.attachments = [];
  }

  componentDidMount() {
    this.props.map.on("dragend", this.handleDragEnd.bind(this));
    this.initializeForm(this.props.selectedCategoryConfig);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.isFormResetting ||
      nextProps.selectedCategoryConfig.category !==
        this.props.selectedCategoryConfig.category
    ) {
      this.initializeForm(nextProps.selectedCategoryConfig);
    }
  }

  componentWillUnmount() {
    this.props.map.off("dragend", this.handleDragEnd);
  }

  initializeForm(selectedCategoryConfig) {
    this.isWithCustomGeometry =
      selectedCategoryConfig.fields.findIndex(
        field => field.type === constants.MAP_DRAWING_TOOLBAR_TYPENAME,
      ) >= 0;
    this.attachments = [];
    this.geometryStyle = null;
    const getNewFields = prevFields =>
      selectedCategoryConfig.fields.reduce((memo, field) => {
        return memo.set(
          field.name,
          Map({
            [constants.FIELD_VALUE_KEY]: "",
            [constants.FIELD_RENDER_KEY]: prevFields.has(field.name)
              ? prevFields.get(field.name).get(constants.FIELD_RENDER_KEY) + 1
              : 0,
          }),
        );
      }, OrderedMap());
    this.setState(prevState => ({
      fields: getNewFields(prevState.fields),
      isFormSubmitting: false,
      isMapPositioned: false,
      formValidationErrors: new Set(),
      showValidityStatus: false,
    }));
  }

  handleDragEnd() {
    !this.state.isMapPositioned && this.setState({ isMapPositioned: true });
  }

  onGeometryStyleChange(style) {
    this.geometryStyle = style;
  }

  onFieldChange({ fieldName, fieldStatus, isInitializing }) {
    fieldStatus = fieldStatus.set(
      constants.FIELD_RENDER_KEY,
      this.state.fields.get(fieldName).get(constants.FIELD_RENDER_KEY),
    );
    this.setState(({ fields }) => ({
      fields: fields.set(fieldName, fieldStatus),
      updatingField: fieldName,
      isInitializing: isInitializing,
    }));
  }

  onAddAttachment(attachment) {
    this.attachments.push(attachment);
  }

  onSubmit(evt) {
    evt.preventDefault();
    Util.log("USER", "new-place", "submit-place-btn-click");

    // Validate the form.
    const {
      validationErrors: newValidationErrors,
      isValid,
    } = this.state.fields.reduce(
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
      this.saveModel();
    } else {
      this.setState({
        formValidationErrors: newValidationErrors,
        showValidityStatus: true,
      });
      scrollTo(this.props.container, 0);
    }
  }

  saveModel() {
    // TODO: this state should disable individual fields as well (?), not just
    //       the submit button.
    this.setState({
      isFormSubmitting: true,
    });

    const collection = this.props.places[
      this.props.selectedCategoryConfig.dataset
    ];
    collection.add(
      {
        location_type: this.props.selectedCategoryConfig.category,
        datasetSlug: this.props.mapConfig.layers.find(
          layer => this.props.selectedCategoryConfig.dataset === layer.id,
        ).slug,
        datasetId: this.props.selectedCategoryConfig.dataset,
        showMetadata: this.props.selectedCategoryConfig.showMetadata,
      },
      { wait: true },
    );
    const model = collection.at(collection.length - 1);
    let attrs = this.state.fields
      .filter(state => !!state.get(constants.FIELD_VALUE_KEY))
      .map(state => state.get(constants.FIELD_VALUE_KEY))
      .toJS();

    if (this.state.fields.get(constants.GEOMETRY_PROPERTY_NAME)) {
      attrs.style = this.geometryStyle;
    } else {
      const center = this.props.map.getCenter();
      attrs.geometry = {
        type: "Point",
        coordinates: [center.lng, center.lat],
      };
    }

    // Replace image data in rich text fields with placeholders built from each
    // image's name.
    // TODO: This logic is better suited for the FormField component,
    // perhaps in an onSave hook.
    this.props.selectedCategoryConfig.fields
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

        // Save autofill values as necessary.
        // TODO: This logic is better suited for the FormField component,
        // perhaps in an onSave hook.
        this.props.selectedCategoryConfig.fields.forEach(fieldConfig => {
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

  render() {
    if (this.isWithCustomGeometry) {
      this.props.hideSpotlightMask();
      this.props.hideCenterPoint();
    } else if (
      this.props.selectedCategoryConfig.category &&
      !this.state.isMapPositioned
    ) {
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
        {this.state.formValidationErrors.size && (
          <WarningMessagesContainer
            errors={[...this.state.formValidationErrors]}
            headerMsg={this.props.t("validationHeader")}
          />
        )}
        <form
          id="mapseed-input-form"
          className={cn.form}
          onSubmit={this.onSubmit.bind(this)}
        >
          {this.state.fields
            .map((fieldState, fieldName) => {
              return (
                <FormField
                  fieldConfig={this.props.selectedCategoryConfig.fields.find(
                    field => field.name === fieldName,
                  )}
                  categoryConfig={this.props.selectedCategoryConfig}
                  disabled={this.state.isFormSubmitting}
                  fieldState={fieldState}
                  isInitializing={this.state.isInitializing}
                  key={fieldState.get(constants.FIELD_RENDER_KEY)}
                  map={this.props.map}
                  mapConfig={this.props.mapConfig}
                  onAddAttachment={this.onAddAttachment.bind(this)}
                  onFieldChange={this.onFieldChange.bind(this)}
                  onGeometryStyleChange={this.onGeometryStyleChange.bind(this)}
                  places={this.props.places}
                  router={this.props.router}
                  showValidityStatus={this.state.showValidityStatus}
                  updatingField={this.state.updatingField}
                />
              );
            })
            .toArray()}
        </form>
        {this.state.isFormSubmitting && <Spinner />}
      </div>
    );
  }
}

InputForm.propTypes = {
  className: PropTypes.string,
  customHooks: PropTypes.oneOfType([
    PropTypes.objectOf(PropTypes.func),
    PropTypes.bool,
  ]),
  container: PropTypes.object.isRequired,
  hideCenterPoint: PropTypes.func.isRequired,
  hideSpotlightMask: PropTypes.func.isRequired,
  isContinuingFormSession: PropTypes.bool,
  isFormResetting: PropTypes.bool,
  isFormSubmitting: PropTypes.bool,
  isLeavingForm: PropTypes.bool,
  map: PropTypes.object.isRequired,
  mapConfig: PropTypes.object.isRequired,
  places: PropTypes.object.isRequired,
  renderCount: PropTypes.number,
  router: PropTypes.object.isRequired,
  selectedCategoryConfig: PropTypes.object,
  showNewPin: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default translate("InputForm")(InputForm);

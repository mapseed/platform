import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  OrderedMap as ImmutableOrderedMap,
  Map as ImmutableMap,
} from "immutable";
import classNames from "classnames";

import InputFormCategorySelector from "./input-form-category-selector";
import FormField from "../form-field";

import { inputForm as messages } from "../messages";
import constants from "../constants";
import "./input-form.scss";

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
      selectedCategory: null,
      isCategoryMenuHidden: false,
      fields: ImmutableOrderedMap(),
      updatingField: null,
      isFormSubmitting: false,
      formValidationErrors: new Set(),
      showValidityStatus: false,
      isMapPositioned: false,
    };

    this.customGeometryObj = {};
    this.attachments = [];
  }

  componentDidMount() {
    this.props.map.on("dragend", this.handleDragEnd.bind(this));

    // TODO: Replace this.
    new Spinner(Shareabouts.smallSpinnerOptions).spin(
      document.getElementsByClassName("input-form__submit-spinner")[0]
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isContinuingFormSession) {
      this.setActiveCategory(
        this.getCategoryConfig(this.state.selectedCategory)
      );
    }
  }

  componentWillUnmount() {
    this.props.map.off("dragend", this.handleDragEnd);
  }

  handleDragEnd() {
    !this.state.isMapPositioned && this.setState({ isMapPositioned: true });
  }

  getCategoryConfig(category) {
    return this.props.placeConfig.place_detail.find(
      config => config.category === category
    );
  }

  onFieldInitialize(fieldName, fieldValue) {
    this.setState(({ fields }) => ({
      fields: fields.set(fieldName, fieldValue),
      isInitializing: true,
    }));
  }

  onFieldChange(fieldName, fieldValue, isValid, message) {
    const newState = this.state.fields
      .get(fieldName)
      .set(constants.FIELD_STATE_VALUE_KEY, fieldValue)
      .set(constants.FIELD_STATE_VALIDITY_KEY, isValid)
      .set(constants.FIELD_STATE_VALIDITY_MESSAGE_KEY, message);
    this.setState(({ fields }) => ({
      fields: fields.set(fieldName, newState),
      updatingField: fieldName,
      isInitializing: false,
    }));
  }

  onCategoryChange(category) {
    this.setActiveCategory(this.getCategoryConfig(category));
  }

  onAdditionalData(action, payload) {
    switch (action) {
      case constants.ON_ADD_ATTACHMENT_ACTION:
        this.attachments.push(payload);
        break;
      default:
        console.error(
          "Error: Unable to handle form field callback action:",
          action
        );
        break;
    }
  }

  setActiveCategory(categoryConfig) {
    this.customGeometryObj =
      categoryConfig.fields.find(
        field => field.type === constants.MAP_DRAWING_TOOLBAR_TYPENAME
      ) || {};
    this.attachments = [];
    let fields = ImmutableOrderedMap();
    categoryConfig.fields.forEach(field => {
      fields = fields.set(
        field.name,
        ImmutableMap()
          .set(constants.FIELD_STATE_INITIALIZED_KEY, false)
          .set(constants.FIELD_STATE_VALUE_KEY, "")
      );
    });

    this.setState({
      fields: fields,
      selectedCategory: categoryConfig.category,
      isFormSubmitting: false,
      formValidationErrors: new Set(),
      showValidityStatus: false,
    });
  }

  onSubmit(evt) {
    evt.preventDefault();
    Util.log("USER", "new-place", "submit-place-btn-click");

    // Validate the form.
    const newValidationErrors = new Set();
    let isValid = true;
    this.state.fields.forEach(value => {
      if (!value.get(constants.FIELD_STATE_VALIDITY_KEY)) {
        newValidationErrors.add(
          value.get(constants.FIELD_STATE_VALIDITY_MESSAGE_KEY)
        );
        isValid = false;
      }
    });

    if (isValid) {
      this.saveModel();
    } else {
      this.setState({
        formValidationErrors: newValidationErrors,
        showValidityStatus: true,
      });
      this.scrollTo(document.querySelector(this.props.container), 0, 300);
    }
  }

  // Due to https://stackoverflow.com/questions/8917921/cross-browser-javascript-not-jquery-scroll-to-top-animation
  scrollTo(elt, to, duration) {
    const difference = to - elt.scrollTop;
    const perTick = difference / duration;
    setTimeout(() => {
      elt.scrollTop = elt.scrollTop + perTick;
      if (elt.scrollTop === to) return;
      this.scrollTo(elt, to, duration - 10);
    }, 10);
  }

  saveModel() {
    // TODO: this state should disable individual fields as well (?), not just
    //       the submit button.
    this.setState({
      isFormSubmitting: true,
    });

    const selectedCategoryConfig = this.getCategoryConfig(
      this.state.selectedCategory
    );
    let collection = this.props.places[selectedCategoryConfig.dataset];

    collection.add({
      location_type: selectedCategoryConfig.category,
      datasetSlug: this.props.mapConfig.layers.find(
        layer => selectedCategoryConfig.dataset === layer.id
      ).slug,
      datasetId: selectedCategoryConfig.dataset,
      showMetadata: selectedCategoryConfig.showMetadata,
    });
    const model = collection.at(collection.length - 1);
    let attrs = {};

    if (this.customGeometryObj.name) {
      attrs.geometry = this.state.fields
        .get(this.customGeometryObj.name)
        .get(constants.FIELD_STATE_VALUE_KEY)
        .get("geometry");
      attrs.style = this.state.fields
        .get(this.customGeometryObj.name)
        .get(constants.FIELD_STATE_VALUE_KEY)
        .get("geometryStyle");
    } else {
      const center = this.props.map.getCenter();
      attrs.geometry = {
        type: "Point",
        coordinates: [center.lng, center.lat],
      };
    }
    Object.assign(
      attrs,
      this.state.fields
        .filter(
          // TODO: There is probably a better pattern to use here, instead of
          // relying on these specific checks.
          val =>
            val.get(constants.FIELD_STATE_FIELD_TYPE_KEY) !==
              constants.MAP_DRAWING_TOOLBAR_TYPENAME &&
            val.get(constants.FIELD_STATE_FIELD_TYPE_KEY) !==
              constants.ATTACHMENT_FIELD_TYPENAME &&
            val.get(constants.FIELD_STATE_FIELD_TYPE_KEY) !==
              constants.SUBMIT_FIELD_TYPENAME &&
            val.get(constants.FIELD_STATE_FIELD_TYPE_KEY) !==
              constants.GEOCODING_FIELD_TYPENAME
        )
        .map(val => val.get(constants.FIELD_STATE_VALUE_KEY))
        .toJS()
    );

    // Save autofill values as necessary.
    selectedCategoryConfig.fields.forEach(fieldConfig => {
      if (fieldConfig.autocomplete) {
        Util.saveAutocompleteValue(
          fieldConfig.name,
          this.state.fields
            .get(fieldConfig.name)
            .get(constants.FIELD_STATE_VALUE_KEY),
          constants.AUTOFILL_DURATION_DAYS
        );
      }
    });

    // Replace image data in rich text fields with placeholders built from each
    // image's name.
    selectedCategoryConfig.fields
      .filter(field => field.type === constants.RICH_TEXTAREA_FIELD_TYPENAME)
      .forEach(field => {
        attrs[field.name] = attrs[field.name].replace(
          /<img.*?name="(.*?)".*?>/g,
          constants.RICH_TEXT_IMAGE_MARKUP_PREFIX +
            "$1" +
            constants.RICH_TEXT_IMAGE_MARKUP_SUFFIX
        );
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
        this.setState({ isFormSubmitting: false });

        // Fire post-save hook.
        // The post-save hook allows flavors to hijack the default
        // route-to-detail-view behavior.
        if (this.props.customHooks && this.props.customHooks.postSave) {
          this.props.customHooks.postSave(
            response,
            model,
            this.defaultPostSave.bind(this)
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
    if (this.customGeometryObj.name) {
      this.props.hideSpotlightMask();
      this.props.hideCenterPoint();
    } else if (!this.state.isMapPositioned) {
      this.props.showNewPin();
    }

    const cn = {
      form: classNames("input-form__form", this.props.className, {
        "input-form__form--inactive": this.state.isFormSubmitting,
      }),
      warningMsgs: classNames("input-form__warning-msgs-container", {
        "input-form__warning-msgs-container--visible":
          this.state.formValidationErrors.size > 0,
      }),
      spinner: classNames("input-form__submit-spinner", {
        "input-form__submit-spinner--visible": this.state.isFormSubmitting,
      }),
    };
    const fields = [];
    this.state.fields.forEach((fieldState, fieldName) => {
      fields.push(
        <FormField
          autofillMode={this.props.autofillMode}
          key={
            this.state.selectedCategory +
            "-" +
            fieldName +
            "-" +
            this.props.renderCount
          }
          map={this.props.map}
          mapConfig={this.props.mapConfig}
          isInitializing={this.state.isInitializing}
          router={this.props.router}
          placeConfig={this.props.placeConfig}
          updatingField={this.state.updatingField}
          config={this.getCategoryConfig(
            this.state.selectedCategory
          ).fields.find(field => field.name === fieldName)}
          showValidityStatus={this.state.showValidityStatus}
          disabled={this.state.isFormSubmitting}
          onChange={this.onFieldChange.bind(this)}
          onInitialize={this.onFieldInitialize.bind(this)}
          onAdditionalData={this.onAdditionalData.bind(this)}
          fieldState={fieldState}
          places={this.props.places}
          landmarks={this.props.landmarks}
        />
      );
    });

    return (
      <div className="input-form">
        <InputFormCategorySelector
          placeConfig={this.props.placeConfig}
          onCategoryChange={this.onCategoryChange.bind(this)}
          selectedCategory={this.state.selectedCategory}
        />
        <div className={cn.warningMsgs}>
          <p className={"input-form__warning-msgs-header"}>
            {messages.validationHeader}
          </p>
          {Array.from(this.state.formValidationErrors).map((errorMsg, i) => (
            <p key={i} className={"input-form__warning-msg"}>
              {errorMsg}
            </p>
          ))}
        </div>
        <form
          id="mapseed-input-form"
          className={cn.form}
          onSubmit={this.onSubmit.bind(this)}
        >
          {fields}
        </form>
        <div className={cn.spinner} />
      </div>
    );
  }
}

InputForm.propTypes = {
  autofillMode: PropTypes.string.isRequired,
  className: PropTypes.string,
  customHooks: PropTypes.oneOfType([
    PropTypes.objectOf(PropTypes.func),
    PropTypes.bool,
  ]),
  container: PropTypes.string.isRequired,
  hideCenterPoint: PropTypes.func.isRequired,
  hideSpotlightMask: PropTypes.func.isRequired,
  isContinuingFormSession: PropTypes.bool,
  isLeavingForm: PropTypes.bool,
  landmarks: PropTypes.object.isRequired,
  map: PropTypes.object.isRequired,
  mapConfig: PropTypes.object.isRequired,
  placeConfig: PropTypes.object.isRequired,
  places: PropTypes.object.isRequired,
  renderCount: PropTypes.number,
  router: PropTypes.object.isRequired,
  showNewPin: PropTypes.func.isRequired,
};

InputForm.defaultProps = {
  autofillMode: "color",
};

export default InputForm;

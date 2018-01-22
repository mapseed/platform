import React, { Component } from "react";
import PropTypes from "prop-types";
import { fromJS, List as ImmutableList, Map as ImmutableMap } from "immutable";
import classNames from "classnames";

import InputFormCategoryButton from "./input-form-category-button";
import FormField from "../form-field";

import { inputForm as messages } from "../messages";
import constants from "../constants";
import { mayHaveAnyValue, mustHaveSomeValue } from "./validators";
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
      isCategoryMenuCollapsed: false,
      isCategoryMenuHidden: false,
      fields: ImmutableMap(),
      updatingField: null,
      isFormSubmitting: false,
      formValidationErrors: new Set(),
      showValidityStatus: false,
      isMapPositioned: false,
    };

    this.customGeometryFieldname = null;
    this.richTextFields = [];
    this.attachments = [];
    this.visibleCategories = [];

    this.props.map.on("dragend", this.handleDragEnd.bind(this));
  }

  handleDragEnd() {
    !this.state.isMapPositioned && this.setState({ isMapPositioned: true });
  }

  resetState() {
    const isSingleCategory = this.visibleCategories.length === 1;

    this.setState({
      selectedCategory: isSingleCategory ? this.visibleCategories[0] : null,
      isCategoryMenuCollapsed: false,
      isCategoryMenuHidden: isSingleCategory,
      fields: ImmutableMap(),
      updatingField: null,
      isFormSubmitting: false,
      formValidationErrors: new Set(),
      showValidityStatus: false,
      isMapPositioned: false,
    });
    this.resetCategoryData();
  }

  resetCategoryData() {
    this.customGeometryFieldname = null;
    this.richTextFields = [];
    this.attachments = [];
  }

  componentWillMount() {
    this.visibleCategories = this.props.placeConfig.place_detail
      .filter(config => config.includeOnForm)
      .filter(config => {
        return !(
          config.admin_only &&
          !Util.getAdminStatus(config.dataset, config.admin_groups)
        );
      });

    if (this.visibleCategories.length === 1) {
      this.setActiveCategoryState(this.visibleCategories[0]);
      this.setState({ isCategoryMenuHidden: true });
    }
  }

  componentDidMount() {
    // TODO: Replace this.
    new Spinner(Shareabouts.smallSpinnerOptions).spin(
      document.getElementsByClassName("input-form__submit-spinner")[0]
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isContinuingFormSession) {
      this.setActiveCategoryState(
        this.getCategoryConfig(this.state.selectedCategory)
      );

      // TODO: I think this condition will no longer be necessary given reliable
      // unmount behavior when the detail view renders.
    } else if (nextProps.isLeavingForm) {
      this.resetState();
    }
  }

  componentWillUnmount() {
    this.props.map.off("dragend", this.handleDragEnd);
  }

  getCategoryConfig(category) {
    return this.props.placeConfig.place_detail.find(
      config => config.category === category
    );
  }

  onFieldChange(fieldName, fieldValue, isValid, message) {
    const newState = this.state.fields
      .get(fieldName)
      .set(constants.FIELD_STATE_VALUE_KEY, fieldValue)
      .set(constants.FIELD_STATE_VALIDITY_KEY, isValid)
      .set(constants.FIELD_STATE_VALIDITY_MESSAGE_KET, message);
    this.setState(({ fields, updatingField }) => ({
      fields: fields.set(fieldName, newState),
      updatingField: fieldName,
    }));
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

  setActiveCategoryState(categoryConfig) {
    this.resetCategoryData();

    let newFields = ImmutableMap();
    categoryConfig.fields
      .filter(field => {
        if (field.type === constants.MAP_DRAWING_TOOLBAR_TYPENAME) {
          this.customGeometryFieldname = field.name;
        }

        return (
          this.resolveField(field).type !== constants.SUBMIT_FIELD_TYPENAME
        );
      })
      .forEach(field => {
        newFields = newFields.set(field.name, this.getInitialFieldState(field));
        if (field.type === constants.RICH_TEXTAREA_FIELD_TYPENAME) {
          this.richTextFields.push(field.name);
        }
      });

    this.setState({
      fields: newFields,
      selectedCategory: categoryConfig.category,
      isCategoryMenuCollapsed: true,
      isFormSubmitting: false,
      formValidationErrors: new Set(),
      showValidityStatus: false,
    });
  }

  getValidator(fieldConfig) {
    if (fieldConfig.type === constants.SUBMIT_FIELD_TYPENAME) {
      return {
        validate: mayHaveAnyValue,
        message: "",
      };
    } else if (fieldConfig.type === constants.MAP_DRAWING_TOOLBAR_TYPENAME) {
      return {
        validate: mustHaveSomeValue,
        message: messages.missingGeometry,
      };
    } else {
      return {
        validate: fieldConfig.optional ? mayHaveAnyValue : mustHaveSomeValue,
        message: messages.missingRequired,
      };
    }
  }

  getInitialFieldState(fieldConfig) {
    // "autofill" is a better term than "autocomplete" for this feature.
    // TODO: Update this throughout the codebase.
    let autofillValue = fieldConfig.autocomplete
      ? Util.getAutocompleteValue(this.resolveField(fieldConfig).name)
      : null;

    fieldConfig.hasAutofill = !!autofillValue;

    let fieldValue;
    switch (fieldConfig.type) {
      case constants.BIG_TOGGLE_FIELD_TYPENAME:
        fieldValue =
          autofillValue ||
          fieldConfig.default_value ||
          fieldConfig.content[1].value; // "off" position of the toggle
        break;
      case constants.BIG_CHECKBOX_FIELD_TYPENAME:
        fieldValue =
          fromJS(autofillValue) ||
          fromJS(fieldConfig.default_value) ||
          ImmutableList();
        break;
      case constants.PUBLISH_CONTROL_TOOLBAR_TYPENAME:
        fieldValue = autofillValue || fieldConfig.default_value;
        break;
      case constants.MAP_DRAWING_TOOLBAR_TYPENAME:
        fieldValue = null;
        break;
      case constants.COMMON_FORM_ELEMENT_TYPENAME:
        const commonFormElementConfig = Object.assign(
          {},
          this.props.placeConfig.common_form_elements[fieldConfig.name],
          { name: fieldConfig.name }
        );
        return this.getInitialFieldState(commonFormElementConfig);
        break;
      default:
        fieldValue = autofillValue || fieldConfig.default_value || "";
        break;
    }

    const fieldObj = ImmutableMap()
      .set(constants.FIELD_STATE_VALUE_KEY, fieldValue)
      .set(constants.FIELD_STATE_FIELD_TYPE_KEY, fieldConfig.type)
      .set(
        constants.FIELD_STATE_VALIDITY_KEY,
        this.getValidator(fieldConfig).validate(fieldValue)
      )
      .set(
        constants.FIELD_STATE_VALIDITY_MESSAGE_KEY,
        this.getValidator(fieldConfig).message
      );

    return fieldObj;
  }

  resolveField(fieldConfig) {
    if (fieldConfig.type === constants.COMMON_FORM_ELEMENT_TYPENAME) {
      return this.props.placeConfig.common_form_elements[fieldConfig.name];
    } else {
      return fieldConfig;
    }
  }

  onSubmit(evt) {
    // TOOD: Enter button submission is still having an effect...

    evt.preventDefault();
    Util.log("USER", "new-place", "submit-place-btn-click");

    // Validate the form.
    const newValidationErrors = new Set();
    let isValid = true;
    this.state.fields.forEach((value, name) => {
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
    let attrs = Object.assign(
      {},
      this.state.fields
        .filter(
          val =>
            val.get(constants.FIELD_STATE_FIELD_TYPE_KEY) !==
              constants.MAP_DRAWING_TOOLBAR_TYPENAME &&
            val.get(constants.FIELD_STATE_FIELD_TYPE_KEY) !==
              constants.ATTACHMENT_FIELD_TYPENAME
        )
        .map(val => val.get(constants.FIELD_STATE_VALUE_KEY))
        .toJS()
    );

    this.richTextFields.forEach(fieldName => {
      // Replace image data with placeholders built from each image's name.
      attrs[fieldName] = attrs[fieldName].replace(
        /<img.*?name="(.*?)".*?>/g,
        constants.RICH_TEXT_IMAGE_MARKUP_PREFIX +
          "$1" +
          constants.RICH_TEXT_IMAGE_MARKUP_SUFFIX
      );
    });

    this.attachments.forEach(attachment => {
      model.attachmentCollection.add(attachment);
    });

    // Save autofill values as necessary.
    selectedCategoryConfig.fields
      .concat(this.props.placeConfig.common_form_elements)
      .forEach(fieldConfig => {
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

    if (this.customGeometryFieldname) {
      attrs.geometry = this.state.fields
        .get(this.customGeometryFieldname)
        .get(constants.FIELD_STATE_VALUE_KEY)
        .get("geometry");
      attrs.style = this.state.fields
        .get(this.customGeometryFieldname)
        .get(constants.FIELD_STATE_VALUE_KEY)
        .get("geometryStyle");
    } else {
      const center = this.props.map.getCenter();
      attrs.geometry = {
        type: "Point",
        coordinates: [center.lng, center.lat],
      };
    }

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
      error: error => {
        Util.log("USER", "new-place", "fail-to-add-place");
      },
      wait: true,
    });
  }

  defaultPostSave(model) {
    this.resetState();
    this.props.router.navigate(Util.getUrl(model), { trigger: true });
  }

  getSpecialFieldProps(fieldType) {
    switch (fieldType) {
      case constants.MAP_DRAWING_TOOLBAR_TYPENAME:
        return {
          map: this.props.map,
          router: this.props.router,
        };
      case constants.GEOCODING_FIELD_TYPENAME:
        return {
          mapConfig: this.props.mapConfig,
          emitter: this.props.emitter,
        };
      case constants.COMMON_FORM_ELEMENT_TYPENAME:
        return {
          placeConfig: this.props.placeConfig,
        };
      default:
        return {};
    }
  }

  render() {
    const cn = {
      categoryBtns: classNames("input-form__category-buttons-container", {
        "input-form__category-buttons-container--hidden": this.state
          .isCategoryMenuHidden,
      }),
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
    const fields =
      this.state.selectedCategory &&
      this.getCategoryConfig(this.state.selectedCategory).fields;

    if (this.customGeometryFieldname) {
      this.props.hideSpotlightMask();
      this.props.hideCenterPoint();
    } else if (!this.state.isMapPositioned) {
      this.props.showNewPin();
    }

    return (
      <div className="input-form">
        <div className={cn.categoryBtns}>
          {this.visibleCategories.map(config => (
            <InputFormCategoryButton
              isActive={this.state.selectedCategory === config.category}
              isCategoryMenuCollapsed={this.state.isCategoryMenuCollapsed}
              key={config.category}
              categoryConfig={config}
              onCategoryChange={evt =>
                this.setActiveCategoryState(
                  this.getCategoryConfig(evt.target.value)
                )
              }
              onExpandCategories={() =>
                this.setState({ isCategoryMenuCollapsed: false })
              }
            />
          ))}
        </div>
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
          {this.state.selectedCategory &&
            this.getCategoryConfig(this.state.selectedCategory).fields.map(
              config => {
                const specialProps = this.getSpecialFieldProps(config.type);
                const validator = this.getValidator(config);
                const value = this.state.fields.get(config.name)
                  ? this.state.fields
                      .get(config.name)
                      .get(constants.FIELD_STATE_VALUE_KEY)
                  : "";
                return (
                  <FormField
                    key={config.name}
                    updatingField={this.state.updatingField}
                    config={config}
                    showValidityStatus={this.state.showValidityStatus}
                    validator={validator}
                    disabled={this.state.isFormSubmitting}
                    onChange={this.onFieldChange.bind(this)}
                    onAdditionalData={this.onAdditionalData.bind(this)}
                    value={value}
                    {...specialProps}
                  />
                );
              }
            )}
        </form>
        <div className={cn.spinner} />
      </div>
    );
  }
}

InputForm.propTypes = {
  autofillMode: PropTypes.string.isRequired,
  className: PropTypes.string,
  hideCenterPoint: PropTypes.func.isRequired,
  hideSpotlightMask: PropTypes.func.isRequired,
  placeConfig: PropTypes.object.isRequired,
  showNewPin: PropTypes.func.isRequired,
};

InputForm.defaultProps = {
  autofillMode: "color",
};

export default InputForm;

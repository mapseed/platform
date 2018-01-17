import React, { Component } from "react";
import update from "react-addons-update";
const cn = require("classnames");

import InputFormCategoryButton from "./input-form-category-button";
import TextField from "../form-fields/text-field";
import TextareaField from "../form-fields/textarea-field";
import DropdownField from "../form-fields/dropdown-field";
import DatetimeField from "../form-fields/datetime-field";
import GeocodingField from "../form-fields/geocoding-field";
import SecondaryButton from "../ui-elements/secondary-button";
import AddAttachmentButton from "../form-fields/add-attachment-button";
import BigRadioField from "../input-form/big-radio-field";
import BigCheckboxField from "../input-form/big-checkbox-field";
import InputFormSubmitButton from "../input-form/input-form-submit-button";
import RichTextareaField from "../form-fields/rich-textarea-field";
import MapDrawingToolbar from "../input-form/map-drawing-toolbar";
import AutocompleteComboboxField from "../form-fields/autocomplete-combobox-field";
import CustomUrlToolbar from "../input-form/custom-url-toolbar";
import BigToggleField from "../form-fields/big-toggle-field";
import PublishControlToolbar from "../input-form/publish-control-toolbar";
import RangeSliderWithLabel from "../input-form/range-slider-with-label";
import { inputForm as messages } from "../messages";
import constants from "./constants";
import "./input-form.scss";

const Util = require("../../js/utils.js");

// TEMPORARY: we define flavor hooks here for the time being
const MYWATER_SCHOOL_DISTRICTS = require("../../../../flavors/central-puget-sound/static/school-districts.json");
const hooks = {
  myWaterAddDistrict: attrs => {
    attrs.district = MYWATER_SCHOOL_DISTRICTS[attrs["school-name"]] || "";

    return attrs;
  },
};

// TODO: greensboropb hook(s)

class InputForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCategory: null,
      isCategoryMenuCollapsed: false,
      isCategoryMenuHidden: false,
      fieldValues: {},
      isFormSubmitting: false,
      formValidationErrors: [],
      isMapPositioned: false,
      isFormVisible: false,
    };

    this.geometry = null;
    this.geometryStyle = null;
    this.isWithCustomGeometry = false;
    this.requiredFields = [];
    this.richTextFields = [];
    this.richTextImages = [];
    this.coverImages = [];
    this.visibleCategories = [];

    this.validationExclusions = new Set([
      constants.COMMON_FORM_ELEMENT_TYPENAME,
      constants.MAP_DRAWING_TOOLBAR_TYPENAME,
      constants.PUBLISH_CONTROL_TOOLBAR_TYPENAME,
      constants.SUBMIT_FIELD_TYPENAME,
    ]);

    this.onCategoryChange = this.onCategoryChange.bind(this);
    this.onExpandCategories = this.onExpandCategories.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onGeometryChange = this.onGeometryChange.bind(this);
    this.onGeometryStyleChange = this.onGeometryStyleChange.bind(this);
    this.onCheckboxFieldChange = this.onCheckboxFieldChange.bind(this);
    this.onAttachmentFieldChange = this.onAttachmentFieldChange.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);

    this.props.map.on("dragend", () => {
      !this.state.isMapPositioned && this.setState({ isMapPositioned: true });
    });
  }

  resetState() {
    const isSingleCategory = this.visibleCategories.length === 1;

    this.setState({
      isFormVisible: false,
      selectedCategory: isSingleCategory ? this.visibleCategories[0] : null,
      isCategoryMenuCollapsed: false,
      isCategoryMenuHidden: isSingleCategory,
      fieldValues: {},
      isFormSubmitting: false,
      formValidationErrors: [],
      coverImages: [],
      isMapPositioned: false,
    });
    this.resetCategoryData();
  }

  resetCategoryData() {
    this.geometry = null;
    this.geometryStyle = null;
    this.isWithCustomGeometry = false;
    this.requiredFields = [];
    this.richTextFields = [];
    this.richTextImages = [];
    this.coverImages = [];
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
    this.setState({ isFormVisible: true });
    new Spinner(Shareabouts.smallSpinnerOptions).spin(
      document.getElementsByClassName("input-form__submit-spinner")[0]
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isContinuingFormSession) {
      this.setActiveCategoryState(
        this.getCategoryConfig(this.state.selectedCategory)
      );
    } else if (nextProps.isLeavingForm) {
      this.resetState();
    }
  }

  getCategoryConfig(category) {
    return this.props.placeConfig.place_detail.find(
      config => config.category === category
    );
  }

  // General handler for field change events.
  onFieldChange(evt, property) {
    const nextState = update(this.state.fieldValues, {
      [evt.target.name]: { $set: evt.target[property] },
    });

    this.setState({ fieldValues: nextState });
  }

  // Special handler for rich textarea fields, which do not return a synthetic
  // event object but rather the value of the editor field itself.
  onRichTextFieldChange(value, name) {
    // "Blank" Quill editors actually contain the following markup; we replace
    // that here with an empty string.
    if (value === "<p><br></p>") value = "";

    const nextState = update(this.state.fieldValues, {
      [name]: { $set: value },
    });

    this.setState({ fieldValues: nextState });
  }

  // Special handler for on/off toggle buttons.
  onToggleFieldChange(evt, values) {
    const idx = evt.target.checked ? 0 : 1;
    const nextState = update(this.state.fieldValues, {
      [evt.target.name]: { $set: values[idx] },
    });

    this.setState({ fieldValues: nextState });
  }

  onAttachmentFieldChange(evt, file) {
    this.coverImages.push(file);
    const nextSate = update(this.state.fieldValues, {
      [evt.target.name]: { $set: true },
    });
    this.setState({ fieldValues: nextState });
  }

  // Special handler for checkbox fields, which generate an array of selected
  // values instead of a single string value.
  onCheckboxFieldChange(evt) {
    let nextState;
    if (evt.target.checked) {
      nextState = update(this.state.fieldValues, {
        [evt.target.name]: { $push: [evt.target.value] },
      });
    } else {
      const index = this.state.fieldValues[evt.target.name].findIndex(
        item => item === evt.target.value
      );

      nextState = update(this.state.fieldValues, {
        [evt.target.name]: { $splice: [[index, 1]] },
      });
    }

    this.setState({ fieldValues: nextState });
  }

  // Special handler for fields that return onChange information in (value, name)
  // format. This includes the autocomplete combobox field and the datetime field.
  onValueNameFieldChange(value, name) {
    const nextState = update(this.state.fieldValues, {
      [name]: { $set: value },
    });

    this.setState({ fieldValues: nextState });
  }

  onAddRichTextImage(imgData) {
    this.richTextImages.push(imgData);
  }

  onExpandCategories() {
    this.setState({ isCategoryMenuCollapsed: false });
  }

  onGeometryChange(geometry) {
    this.geometry = geometry;
  }

  onGeometryStyleChange(geometryStyle) {
    this.geometryStyle = geometryStyle;
  }

  onCategoryChange(evt) {
    this.setActiveCategoryState(this.getCategoryConfig(evt.target.value));
  }

  setActiveCategoryState(categoryConfig) {
    this.resetCategoryData();

    let initialFieldStates = {};
    categoryConfig.fields
      .filter(field => {
        if (field.type === constants.MAP_DRAWING_TOOLBAR_TYPENAME) {
          this.isWithCustomGeometry = true;
        }

        const resolvedFieldType = this.resolveFieldType(field);
        return (
          resolvedFieldType !== constants.SUBMIT_FIELD_TYPENAME &&
          resolvedFieldType !== constants.MAP_DRAWING_TOOLBAR_TYPENAME
        );
      })
      .forEach(field => {
        initialFieldStates[field.name] = this.getInitialFieldState(field);
        if (!field.optional && !this.validationExclusions.has(field.type)) {
          this.requiredFields.push(field.name);
        }
        if (field.type === constants.RICH_TEXTAREA_FIELD_TYPENAME) {
          this.richTextFields.push(field.name);
        }
      });

    this.setState({
      selectedCategory: categoryConfig.category,
      isCategoryMenuCollapsed: true,
      fieldValues: initialFieldStates,
      isFormSubmitting: false,
      formValidationErrors: [],
    });
  }

  resolveFieldType(fieldConfig) {
    if (fieldConfig.type === constants.COMMON_FORM_ELEMENT_TYPENAME) {
      return this.props.placeConfig.common_form_elements[fieldConfig.name];
    } else {
      return fieldConfig;
    }
  }

  getInitialFieldState(fieldConfig) {
    // "autofill" is a better term than "autocomplete" for this feature.
    // TODO: update this throughout the codebase.
    let autofillValue = fieldConfig.autocomplete
      ? Util.getAutocompleteValue(this.resolveFieldType(fieldConfig).name)
      : null;

    fieldConfig.hasAutofill = !!autofillValue;

    switch (fieldConfig.type) {
      case constants.BIG_TOGGLE_FIELD_TYPENAME:
        // NOTE: if binary toggle buttons don't have a saved autofill or
        // declared default value, assume their default value is the value
        // associated with the "off" position of the toggle.
        return (
          autofillValue ||
          fieldConfig.default_value ||
          fieldConfig.content[1].value
        );
        break;
      case constants.BIG_CHECKBOX_FIELD_TYPENAME:
        return autofillValue || fieldConfig.default_value || [];
        break;
      case constants.PUBLISH_CONTROL_TOOLBAR_TYPENAME:
        return autofillValue || fieldConfig.default_value || "isPublished";
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
        return autofillValue || fieldConfig.default_value || "";
        break;
    }
  }

  buildField(fieldConfig) {
    // TODO: appropriate field visibility based on admin status
    // TODO: these field definitions will eventually be factored out for reuse
    //       in the detail view editor.

    const {
      autofillMode,
      emitter,
      map,
      mapConfig,
      placeConfig,
      router,
    } = this.props;
    const { fieldValues, isFormSubmitting } = this.state;
    const classNames = {
      optionalMsg: cn("input-form__optional-msg", {
        "input-form__optional-msg--visible": fieldConfig.optional,
        "input-form__optional-msg--hidden": !fieldConfig.optional,
      }),
    };
    const fieldPrompt = (
      <p className="input-form__field-prompt">
        {fieldConfig.prompt}
        <span className={classNames.optionalMsg}>{messages.optionalMsg}</span>
      </p>
    );

    switch (fieldConfig.type) {
      case constants.TEXT_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <TextField
            name={fieldConfig.name}
            onChange={evt => this.onFieldChange(evt, "value")}
            value={fieldValues[fieldConfig.name]}
            placeholder={fieldConfig.placeholder}
            autofillMode={autofillMode}
            hasAutofill={fieldConfig.hasAutofill}
          />,
        ];
        break;
      case constants.TEXTAREA_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <TextareaField
            name={fieldConfig.name}
            onChange={evt => this.onFieldChange(evt, "value")}
            value={fieldValues[fieldConfig.name]}
            placeholder={fieldConfig.placeholder}
            autofillMode={autofillMode}
            hasAutofill={fieldConfig.hasAutofill}
          />,
        ];
        break;
      case constants.RICH_TEXTAREA_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <RichTextareaField
            name={fieldConfig.name}
            onChange={(value, name) => this.onRichTextFieldChange(value, name)}
            onAddImage={this.onAddRichTextImage.bind(this)}
            value={fieldValues[fieldConfig.name]}
            placeholder={fieldConfig.placeholder}
            autofillMode={autofillMode}
            hasAutofill={fieldConfig.hasAutofill}
            bounds="#content"
          />,
        ];
        break;
      case constants.CUSTOM_URL_TOOLBAR_TYPENAME:
        return [
          fieldPrompt,
          <CustomUrlToolbar
            layerConfig={this.layerConfig}
            placeholder={fieldConfig.placeholder}
            name={fieldConfig.name}
            onChange={evt => this.onFieldChange(evt, "value")}
          />,
        ];
        break;
      case constants.MAP_DRAWING_TOOLBAR_TYPENAME:
        return [
          fieldPrompt,
          <MapDrawingToolbar
            map={map}
            markers={fieldConfig.content.map(item => item.url)}
            router={router}
            onGeometryChange={this.onGeometryChange}
            onGeometryStyleChange={this.onGeometryStyleChange}
          />,
        ];
        break;
      case constants.ATTACHMENT_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <AddAttachmentButton
            label={fieldConfig.label}
            name={fieldConfig.name}
            onChange={this.onAttachmentFieldChange}
          />,
        ];
        break;
      case constants.SUBMIT_FIELD_TYPENAME:
        return (
          <InputFormSubmitButton
            disabled={isFormSubmitting}
            label={fieldConfig.label}
          />
        );
        break;
      case constants.RANGE_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <RangeSliderWithLabel
            name={fieldConfig.name}
            max={fieldConfig.max}
            min={fieldConfig.min}
            onChange={evt => this.onFieldChange(evt, "value")}
            value={fieldValues[fieldConfig.name]}
            autofillMode={autofillMode}
            hasAutofill={fieldConfig.hasAutofill}
          />,
        ];
        break;
      case constants.BIG_CHECKBOX_FIELD_TYPENAME:
        return [
          fieldPrompt,
          fieldConfig.content.map(item => (
            <BigCheckboxField
              key={item.value}
              value={item.value}
              label={item.label}
              id={"input-form-" + fieldConfig.name + "-" + item.value}
              checked={fieldValues[fieldConfig.name].includes(item.value)}
              name={fieldConfig.name}
              onChange={this.onCheckboxFieldChange}
              autofillMode={autofillMode}
              hasAutofill={fieldConfig.hasAutofill}
            />
          )),
        ];
        break;
      case constants.BIG_RADIO_FIELD_TYPENAME:
        return [
          fieldPrompt,
          fieldConfig.content.map(item => (
            <BigRadioField
              key={item.value}
              value={item.value}
              label={item.label}
              id={"input-form-" + fieldConfig.name + "-" + item.value}
              checked={fieldValues[fieldConfig.name] === item.value}
              name={fieldConfig.name}
              onChange={evt => this.onFieldChange(evt, "value")}
              autofillMode={autofillMode}
              hasAutofill={fieldConfig.hasAutofill}
            />
          )),
        ];
        break;
      case constants.PUBLISH_CONTROL_TOOLBAR_TYPENAME:
        return (
          <PublishControlToolbar
            name={fieldConfig.name}
            published={fieldValues[fieldConfig.name]}
            onChange={evt => this.onFieldChange(evt, "value")}
          />
        );
        break;
      case constants.DATETIME_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <DatetimeField
            name={fieldConfig.name}
            date={fieldValues[fieldConfig.name]}
            showTimeSelect={true}
            onChange={(evt, name) => this.onValueNameFieldChange(evt, name)}
          />,
        ];
      case constants.GEOCODING_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <GeocodingField
            onChange={evt => this.onFieldChange(evt, "value")}
            name={fieldConfig.name}
            value={fieldValues[fieldConfig.name]}
            mapConfig={mapConfig}
            emitter={emitter}
          />,
        ];
        break;
      case constants.BIG_TOGGLE_FIELD_TYPENAME:
        const values = [
          fieldConfig.content[0].value,
          fieldConfig.content[1].value,
        ];
        return [
          fieldPrompt,
          <BigToggleField
            name={fieldConfig.name}
            checked={
              fieldValues[fieldConfig.name] === fieldConfig.content[0].value
            }
            labels={[
              fieldConfig.content[0].label,
              fieldConfig.content[1].label,
            ]}
            values={[
              fieldConfig.content[0].value,
              fieldConfig.content[1].value,
            ]}
            id={"input-form-" + fieldConfig.name}
            onChange={evt =>
              this.onToggleFieldChange(evt, [
                fieldConfig.content[0].value,
                fieldConfig.content[1].value,
              ])
            }
            autofillMode={autofillMode}
            hasAutofill={fieldConfig.hasAutofill}
          />,
        ];
        break;
      case constants.DROPDOWN_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <DropdownField
            name={fieldConfig.name}
            value={fieldValues[fieldConfig.name]}
            options={fieldConfig.content}
            onChange={evt => this.onFieldChange(evt, "value")}
            autofillMode={autofillMode}
            hasAutofill={fieldConfig.hasAutofill}
          />,
        ];
        break;
      case constants.DROPDOWN_AUTOCOMPLETE_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <AutocompleteComboboxField
            name={fieldConfig.name}
            options={fieldConfig.content}
            placeholder={fieldConfig.placeholder}
            id={"autocomplete-" + fieldConfig.name}
            onChange={this.onValueNameFieldChange.bind(this)}
            showAllValues={true}
            autofillMode={autofillMode}
            hasAutofill={fieldConfig.hasAutofill}
          />,
        ];
        break;
      case constants.COMMON_FORM_ELEMENT_TYPENAME:
        const commonFormElementConfig = Object.assign(
          {},
          placeConfig.common_form_elements[fieldConfig.name],
          { name: fieldConfig.name }
        );
        return this.buildField(commonFormElementConfig);
        break;
    }
  }

  // due to https://stackoverflow.com/questions/8917921/cross-browser-javascript-not-jquery-scroll-to-top-animation
  scrollTo(elt, to, duration) {
    const difference = to - elt.scrollTop;
    const perTick = difference / duration;
    setTimeout(() => {
      elt.scrollTop = elt.scrollTop + perTick;
      if (elt.scrollTop === to) return;
      this.scrollTo(elt, to, duration - 10);
    }, 10);
  }

  onSubmit(evt) {
    // TOOD: Enter button submission is still having an effect...

    evt.preventDefault();
    Util.log("USER", "new-place", "submit-place-btn-click");

    if (!this.isWithCustomGeometry) {
      const center = this.props.map.getCenter();
      this.geometry = {
        type: "Point",
        coordinates: [center.lng, center.lat],
      };
    }

    this.validate();
  }

  validate() {
    const { fieldValues, formValidationErrors } = this.state;
    let newValidationErrors = [];

    if (!this.geometry) {
      newValidationErrors.push(messages.missingGeometry);
    }

    for (let i = 0; i < this.requiredFields.length; i++) {
      if (!fieldValues[this.requiredFields[i]]) {
        newValidationErrors.push(messages.missingRequired);
        break;
      }
    }

    if (newValidationErrors.length > 0) {
      this.onInvalidSubmit(newValidationErrors);
      return;
    } else {
      this.onValidSubmit();
      return;
    }
  }

  onInvalidSubmit(errors) {
    this.setState({ formValidationErrors: errors });
    this.scrollTo(document.querySelector(this.props.container), 0, 300);
  }

  onValidSubmit() {
    // TODO: this state should disable individual fields as well (?), not just
    //       the submit button.
    this.setState({
      formValidationErrors: [],
      isFormSubmitting: true,
    });

    const { collectionsSet, customHooks, placeConfig, router } = this.props;
    const { fieldValues, selectedCategory } = this.state;
    const selectedCategoryConfig = this.getCategoryConfig(selectedCategory);
    let collection = collectionsSet.places[selectedCategoryConfig.dataset];

    collection.add({
      location_type: selectedCategoryConfig.category,
      datasetSlug: this.props.mapConfig.layers.find(
        layer => selectedCategoryConfig.dataset === layer.id
      ).slug,
      datasetId: selectedCategoryConfig.dataset,
      showMetadata: selectedCategoryConfig.showMetadata,
    });
    let model = collection.at(collection.length - 1);
    let attrs = Object.assign({}, fieldValues);

    this.richTextFields.forEach(fieldName => {
      // replace base64 image data with placeholders built from each image's name
      attrs[fieldName] = attrs[fieldName].replace(
        /\<img.*?name=\"(.*?)\".*?\>/g,
        "{{#rich_text_image $1}}"
      );
    });

    this.richTextImages.concat(this.coverImages).forEach(img => {
      model.attachmentCollection.add(img);
    });

    // TODO: is this still necessary?
    // Util.setStickyFields(
    //   attrs,
    //   Shareabouts.Config.survey.items,
    //   Shareabouts.Config.place.items,
    // );

    // Save autofill values as necessary.
    selectedCategoryConfig.fields
      .concat(placeConfig.common_form_elements)
      .forEach(fieldConfig => {
        if (fieldConfig.autocomplete) {
          Util.saveAutocompleteValue(
            fieldConfig.name,
            fieldValues[fieldConfig.name],
            constants.AUTOFILL_DURATION_DAYS
          );
        }
      });

    // TODO: case when url-title field is left blank: fall back to regular urls

    attrs.geometry = this.geometry;
    if (this.geometryStyle) {
      attrs.style = this.geometryStyle;
    }

    // Fire pre-save hook.
    // The pre-save hook allows flavors to attach arbitrary data to the attrs
    // object before submission to the database.
    if (customHooks && customHooks.preSave) {
      attrs = hooks[customHooks.preSave](attrs);
    }

    model.save(attrs, {
      success: response => {
        Util.log("USER", "new-place", "successfully-add-place");
        this.setState({ isFormSubmitting: false });

        // Fire post-save hook.
        // The post-save hook allows flavors to hijack the default
        // route-to-detail-view behavior.
        if (customHooks && customHooks.postSave) {
          customHooks.postSave(
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

  fieldIsInvalid(fieldName) {
    return (
      this.state.formValidationErrors.length > 0 &&
      this.requiredFields.includes(fieldName) &&
      !this.state.fieldValues[fieldName]
    );
  }

  render() {
    const {
      isCategoryMenuCollapsed,
      isCategoryMenuHidden,
      isFormVisible,
      fieldValues,
      isFormSubmitting,
      formValidationErrors,
      isMapPositioned,
      selectedCategory,
    } = this.state;
    const {
      autofillMode,
      className,
      hideCenterPoint,
      hideSpotlightMask,
      placeConfig,
      showNewPin,
    } = this.props;
    const classNames = {
      categoryBtns: cn("input-form__category-buttons-container", {
        "input-form__category-buttons-container--visible": !isCategoryMenuHidden,
        "input-form__category-buttons-container--hidden": isCategoryMenuHidden,
      }),
      form: cn("input-form__form", className, {
        "input-form__form--active": !isFormSubmitting,
        "input-form__form--inactive": isFormSubmitting,
      }),
      warningMsgs: cn("input-form__warning-msgs-container", {
        "input-form__warning-msgs-container--visible":
          formValidationErrors.length > 0,
        "input-form__warning-msgs-container--hidden":
          formValidationErrors.length === 0,
      }),
      spinner: cn("input-form__submit-spinner", {
        "input-form__submit-spinner--visible": isFormSubmitting,
        "input-form__submit-spinner--hidden": !isFormSubmitting,
      }),
    };
    let formFields = placeConfig.place_detail.filter(
      categoryConfig => selectedCategory === categoryConfig.category
    );

    if (formFields[0] && formFields[0].fields) {
      formFields = formFields[0].fields.map(fieldConfig => {
        let fieldContainerClassName = cn("input-form__field-container", {
          "input-form__field-container--invalid": this.fieldIsInvalid(
            fieldConfig.name
          ),
          "input-form__field-container--hidden":
            fieldValues[fieldConfig.name] &&
            fieldConfig.hasAutofill &&
            autofillMode === "hide",
        });

        return (
          <div key={fieldConfig.name} className={fieldContainerClassName}>
            {this.buildField(fieldConfig)}
          </div>
        );
      });
    }

    if (this.isWithCustomGeometry) {
      hideSpotlightMask();
      hideCenterPoint();
    } else if (!isMapPositioned && isFormVisible) {
      showNewPin();
    }

    return (
      <div className="input-form">
        <div className={classNames.categoryBtns}>
          {this.visibleCategories.map(categoryConfig => (
            <InputFormCategoryButton
              isActive={selectedCategory === categoryConfig.category}
              isCategoryMenuCollapsed={isCategoryMenuCollapsed}
              key={categoryConfig.category}
              categoryConfig={categoryConfig}
              onCategoryChange={this.onCategoryChange}
              onExpandCategories={this.onExpandCategories}
            />
          ))}
        </div>
        <div className={classNames.warningMsgs}>
          <p className={"input-form__warning-msgs-header"}>
            {messages.validationHeader}
          </p>
          {formValidationErrors.map(error => (
            <p className={"input-form__warning-msg"}>{error}</p>
          ))}
        </div>
        <form
          id="mapseed-input-form"
          className={classNames.form}
          onSubmit={this.onSubmit}
        >
          {formFields}
        </form>
        <div className={classNames.spinner} />
      </div>
    );
  }
}

export default InputForm;

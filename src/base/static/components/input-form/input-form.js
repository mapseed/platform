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
import { inputForm as messages } from "../messages";
import constants from "./constants";
import "./input-form.scss";

const Util = require("../../js/utils.js");

class InputForm extends Component {

  constructor() {
    super(...arguments);
    this.state = {
      selectedCategory: null,
      categoryMenuIsCollapsed: false,
      fieldValues: {},
      formIsSubmitting: false,
      formHasValidationErrors: false,

      // TODO: this state will probably be bumped higher in the hierarchy as the
      // port proceeds.
      formIsOpen: false
    };

    this.special = false;
    this.attachments = [];

    // Any Quill-driven rich text fields need special handling on form submit:
    // image content needs to be saved as an attachment collection first, then
    // the corresponding img tag's src attribute needs to be replaced with the
    // generated S3 bucket url. To facilitate this, keep track of rich text 
    // field names here.
    this.richTextFields = [];
    this.geometry = null;
    this.geometryStyle = null;

    // Use this flag to signal if a selected form category has a
    // MapDrawingToolbar component enabled. If so, we ignore the usual drag-
    // based Point geometry creation and get geometry information from the
    // MapDrawingToolbar instead.
    this.hasCustomGeometry = false;

    this.onCategoryChange = this.onCategoryChange.bind(this);
    this.onExpandCategories = this.onExpandCategories.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.setState({ formIsOpen: true });

    // TODO: the route event seems to fire even after the component mounts
    // this.props.router.on("route", () => { 
    //   console.log("on route");
    //   this.setState({ formIsOpen: false });
    // });

  }

  // General handler for field change events.
  onFieldChange(evt, property) {
    let nextState = update(
      this.state.fieldValues, {
        [evt.target.name]: {$set: evt.target[property]}
      }
    );

    this.setState({
      fieldValues: nextState
    }, () => {
      console.log(this.state);
    });
  }

  // Special handler for rich textarea fields, which do not return a synthetic
  // event object but rather the value of the editor field itself.
  onRichTextFieldChange(value, name) {
    let nextState = update(
      this.state.fieldValues, {
        [name]: {$set: value}
      }
    );

    this.setState({
      fieldValues: nextState
    });
  }

  // Special handler for toggle buttons.
  // TODO: We store the on/off state of binary toggle buttons using config-
  // supplied values. Things would be simpler if we used true/false boolean
  // values instead though. Changing this might have implications for existing 
  // saved data however...
  onToggleFieldChange(evt, values) {
    let idx = evt.target.checked ? 0 : 1,
        nextState = update(
          this.state.fieldValues, {
            [evt.target.name]: {$set: values[idx]}
          }
        );

    this.setState({
      fieldValues: nextState
    });
  }

  // Special handler for checkbox fields, which generate an array of selected
  // values instead of a single string value.
  onCheckboxFieldChange(evt) {
    let nextState;
    if (evt.target.checked) {
      nextState = update(
        this.state.fieldValues, {
          [evt.target.name]: {$push: [evt.target.value]}
        }
      );
    } else {
      let index = this.state.fieldValues[evt.target.name]
                    .findIndex(item => item === evt.target.value);

      nextState = update(
        this.state.fieldValues, {
          [evt.target.name]: {$splice: [[index, 1]]}
        }
      );
    }

    this.setState({
      fieldValues: nextState
    });
  }

  onAutocompleteChange(value) {
    console.log("onAutocompleteChange", value);
  }

  onAddImage(imgData) {
    this.attachments.push(imgData);
  }

  onExpandCategories() {
    console.log("onExpandCategories");

    this.setState({ categoryMenuIsCollapsed: false });
  }

  onGeometryChange(geometry) {
    console.log("onGeometryChange", geometry);

    this.geometry = geometry;
  }

  onGeometryStyleChange(geometryStyle) {
    this.geometryStyle = geometryStyle;
  }

  onCategoryChange(evt) {
    this.hasCustomGeometry = false;
    // TODO: complete reset of fieldValues state at this point? A reset method
    //       might be useful?

    let initialFieldStates = {};
    this.props.placeConfig.place_detail
      .filter(category => category.category === evt.target.value)[0].fields
      .filter(field => {
          return (
            // TODO: this won't work for commonFormElements...
            field.type !== "submit" &&
            field.type !== "geometryToolbar" &&
            field.type !== "file"
          );
      })
      .forEach(fieldConfig => initialFieldStates[fieldConfig.name] = this.getInitialFieldState(fieldConfig));

    this.setState({ 
      selectedCategory: evt.target.value,
      categoryMenuIsCollapsed: true,
      fieldValues: initialFieldStates
    });
  }

  getInitialFieldState(fieldConfig) {

    // "autofill" is a better term than "autocomplete" for this feature.
    // TODO: update this throughout the codebase
    let autofillValue = (fieldConfig.autocomplete)
      ? Util.getAutocompleteValue(fieldConfig.name) 
      : null;

    switch(fieldConfig.type) {
      case constants.BIG_TOGGLE_FIELD_TYPENAME:

        // NOTE: if binary toggle buttons don't have a saved autofill value, 
        // assume their default value is the value associated with the "off" 
        // position of the toggle.
        return autofillValue || fieldConfig.content[1].value;
        break;
      case constants.BIG_CHECKBOX_FIELD_TYPENAME:
        return autofillValue || [];
        break;
      case constants.PUBLISH_CONTROL_TOOLBAR_TYPENAME:
        return autofillValue || "isPublished";
        break;
      case constants.RICH_TEXTAREA_FIELD_TYPENAME:
        this.richTextFields.push(fieldConfig.name);
        return autofillValue || "";
        break;        
      default:
        return autofillValue || "";
        break;
    }
  }

  onSubmit(evt) {
    evt.preventDefault();

    if (!this.hasCustomGeometry) {
      let center = this.props.map.getCenter();
      this.geometry = {
        type: "Point",
        coordinates: [center.lng, center.lat]
      };
    }

    this.validate(this.onValidSubmit.bind(this), this.onInvalidSubmit.bind(this));
  }

  buildField(fieldConfig) {

    // TODO: appropriate field visibility based on admin status
    // TODO: consistency in field naming conventions
    // TODO: these field definitions will eventually be factored out for reuse
    //       in the detail view editor.
    // TODO: required prop for all field types.

    const classNames = cn("input-form__optional-msg", {
      "input-form__optional-msg--visible": fieldConfig.optional,
      "input-form__optional-msg--hidden": !fieldConfig.optional
    });
    const fieldPrompt = 
      <p className="input-form__field-prompt">
        {fieldConfig.prompt}
        <span className={classNames}>
          {messages.optionalMsg}
        </span>
      </p>;
    const { emitter, map, mapConfig, placeConfig, router } = this.props;
    const { fieldValues, formIsOpen, formIsSubmitting } = this.state;

    switch(fieldConfig.type) {
      case constants.TEXT_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <TextField 
            name={fieldConfig.name}
            onChange={evt => this.onFieldChange(evt, "value")}
            value={fieldValues[fieldConfig.name]}
            placeholder={fieldConfig.placeholder}
            required={!fieldConfig.optional} 
            hasAutofill={fieldConfig.autocomplete} />
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
            required={!fieldConfig.optional} />
        ];
        break;
      case constants.RICH_TEXTAREA_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <RichTextareaField
            name={fieldConfig.name}

            // NOTE: there's an important limitation here that we can only have
            // one rich text editor per form.
            // TODO: is this ok?
            ref="quill-rich-text-editor"
            onChange={(value, name) => this.onRichTextFieldChange(value, name)}
            onAddImage={this.onAddImage.bind(this)}
            value={fieldValues[fieldConfig.name]}
            placeholder={fieldConfig.placeholder}
            required={!fieldConfig.optional} 
            bounds="#content" />
        ];
        break;
      case constants.CUSTOM_URL_TOOLBAR_TYPENAME:
        return [
          fieldPrompt,
          <CustomUrlToolbar
            layerConfig={this.layerConfig} 
            placeholder={fieldConfig.placeholder}
            name={fieldConfig.name}
            required={!fieldConfig.optional}
            onChange={evt => this.onFieldChange(evt, "value")} />
        ];
        break;
      case constants.MAP_DRAWING_TOOLBAR_TYPENAME:
        this.hasCustomGeometry = true;
        // TODO: hide center pin and spotlight
        return [
          fieldPrompt,
          <MapDrawingToolbar 
            map={map}
            markers={fieldConfig.content.map(item => item.url)} 
            router={router}
            formIsOpen={formIsOpen} 
            onGeometryChange={this.onGeometryChange.bind(this)} 
            onGeometryStyleChange={this.onGeometryStyleChange.bind(this)} />
        ];
        break;
      case constants.ATTACHMENT_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <AddAttachmentButton 
            label={fieldConfig.label}
            name={fieldConfig.name} />
        ];
        break;
      case constants.SUBMIT_FIELD_TYPENAME:
        return (
          <InputFormSubmitButton 
            disabled={formIsSubmitting}
            label={fieldConfig.label} />
        ); 
        break;
      case constants.BIG_CHECKBOX_FIELD_TYPENAME:
        return [
          fieldPrompt,
          fieldConfig.content.map(item => 
            <BigCheckboxField
              key={item.value}
              value={item.value}
              label={item.label}
              id={"input-form-" + fieldConfig.name + "-" + item.value}
              checked={fieldValues[fieldConfig.name].includes(item.value)}
              name={fieldConfig.name} 
              onChange={this.onCheckboxFieldChange.bind(this)} />)
        ];
        break;
      case constants.BIG_RADIO_FIELD_TYPENAME:
        return [
          fieldPrompt,
          fieldConfig.content.map(item => 
            <BigRadioField
              key={item.value}
              value={item.value}
              label={item.label}
              id={"input-form-" + fieldConfig.name + "-" + item.value}
              checked={fieldValues[fieldConfig.name] === item.value}
              name={fieldConfig.name} 
              onChange={evt => this.onFieldChange(evt, "value")} />)
        ];
        break
      case constants.PUBLISH_CONTROL_TOOLBAR_TYPENAME:
        return (
          <PublishControlToolbar
            name={fieldConfig.name}
            published={fieldValues[fieldConfig.name]}
            onChange={evt => this.onFieldChange(evt, "value")} />
        );
        break;
      case constants.DATETIME_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <DatetimeField
            showTimeSelect={true}
            onChange={this.onFieldChange.bind(this)} />
        ];
      case constants.GEOCODING_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <GeocodingField
            onChange={evt => this.onFieldChange(evt, "value")}
            name={fieldConfig.name}
            value={fieldValues[fieldConfig.name]}
            mapConfig={mapConfig}
            emitter={emitter} />
        ];
        break;
      case constants.BIG_TOGGLE_FIELD_TYPENAME:
        let values = [fieldConfig.content[0].value, fieldConfig.content[1].value];
        return [
          fieldPrompt,
          <BigToggleField
            name={fieldConfig.name}
            checked={fieldValues[fieldConfig.name] === fieldConfig.content[0].value}
            labels={[fieldConfig.content[0].label, fieldConfig.content[1].label]}
            values={[fieldConfig.content[0].value, fieldConfig.content[1].value]}
            id={"input-form-" + fieldConfig.name}
            onChange={evt => this.onToggleFieldChange(evt, [fieldConfig.content[0].value, fieldConfig.content[1].value])} />
        ];
        break;
      case constants.DROPDOWN_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <DropdownField
            name={fieldConfig.name}
            value={fieldValues[fieldConfig.name]}
            required={!fieldConfig.optional}
            options={fieldConfig.content}
            onChange={evt => this.onFieldChange(evt, "value")} />
        ];
        break;
      case constants.DROPDOWN_AUTOCOMPLETE_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <AutocompleteComboboxField
            options={fieldConfig.content}
            placeholder={fieldConfig.placeholder}
            id={"autocomplete-" + fieldConfig.name}
            onChange={this.onAutocompleteChange.bind(this)}
            showAllValues={true} />
        ];
        break;
      case constants.COMMON_FORM_ELEMENT_TYPENAME:
        let commonFormElementConfig = Object.assign(
          {},
          placeConfig.common_form_elements[fieldConfig.name],
          {name: fieldConfig.name}
        );
        return this.buildField(commonFormElementConfig);
        break;
    }
  }

  // Perform any validation needed that isn't covered by HTML5 field validation.
  // TODO: remove HTML5 validation entirely
  validate(onSuccess, onFailure) {
    if (!this.geometry) {
      onFailure("NO_GEOMETRY");
      return;
    }

    // TODO: required quill field validation here.

    onSuccess();
    return;
  }

  onInvalidSubmit(reason) {
    if (reason === "NO_GEOMETRY") {
      console.log("submit failed: no geometry");
    }

  }

  onValidSubmit() {
    let spinnerTarget = document.getElementsByClassName("input-form__submit-spinner")[0];
    new Spinner(Shareabouts.smallSpinnerOptions).spin(spinnerTarget);
    
    // TODO: this state should disable individual fields as well (?), not just
    //       the submit button.
    this.setState({ formIsSubmitting: true });

    let selectedCategoryConfig = 
          this.props.placeConfig.place_detail
            .find(category => category.category === this.state.selectedCategory),
        collection = this.props.collectionsSet.places[selectedCategoryConfig.dataset],
        model;

    collection.add({
      location_type: selectedCategoryConfig.category,
      datasetSlug: this.props.mapConfig.layers.find(
        layer => selectedCategoryConfig.dataset === layer.id
      ).slug,
      datasetId: selectedCategoryConfig.dataset,
      showMetadata: selectedCategoryConfig.showMetadata,
    });
    model = collection.at(collection.length - 1);

    let attrs = Object.assign({}, this.state.fieldValues);

    // If attachments have been added via the rich text editor, we need to
    // remove rich text content initially before saving. Otherwise, we'll save 
    // the base-64 image content to the database.
    if (this.attachments.length > 0) {
      this.richTextFields.forEach(richTextField => delete attrs[richTextField]);
      this.attachments.forEach(attachment => model.attachmentCollection.add(attachment));
    }

    Util.log("USER", "new-place", "submit-place-btn-click");
    Util.setStickyFields(  // TODO: investigate this?
      //attrs,
      Shareabouts.Config.survey.items,
      Shareabouts.Config.place.items,
    );

    // TODO: case when url-title field is left blank: fall back to regular urls

    attrs.geometry = this.geometry;

    if (this.geometryStyle) {
      attrs.style = this.geometryStyle;
    }

    model.save(attrs, {
      success: (response) => {
        //if (self.formState.attachmentData.length > 0 && self.$(".rich-text-field").length > 0) {
        if (false) {
          // If there is rich text image content on the form, add it now and replace
          // img data urls with their S3 bucket equivalents.
          // NOTE: this success handler is called when all attachment models have
          // saved to the server.
          model.attachmentCollection.fetch({
            reset: true,
            success: function(collection) {
              // collection.each(function(attachment) {
              //   self
              //     .$("img[name='" + attachment.get("name") + "']")
              //     .attr("src", attachment.get("file"));
              // });

              // Add content that has been modified by Quill rich text fields
              // self.$(".rich-text-field").each(function() {
              //   attrs[$(this).attr("name")] = $(this).find(".ql-editor").html();
              // });

              model.saveWithoutAttachments(attrs, {
                success: function(response) {
                  Util.log("USER", "new-place", "successfully-add-place");
                  router.navigate(Util.getUrl(model), { trigger: true });
                },
                error: function() {
                  Util.log("USER", "new-place", "fail-to-embed-attachments");
                },
                complete: function() {
                  // if (self.geometryEditorView) {
                  //   self.geometryEditorView.tearDown();
                  // }
                  collection.each(attachment => attachment.set({ saved: true }));
                },
              });
            },
            error: function() {
              Util.log("USER", "new-place", "fail-to-fetch-embed-urls");
            },
          });
        } else {
          // Otherwise, go ahead and route to the newly-created place.
          Util.log("USER", "new-place", "successfully-add-place");
          this.props.router.navigate(Util.getUrl(model), { trigger: true });
          // if (self.geometryEditorView) {
          //   self.geometryEditorView.tearDown();
          // }
          // $button.removeAttr("disabled");
          // spinner.stop();
          // self.resetFormState();
        }
      },
      error: (error, b, c) => {
        Util.log("USER", "new-place", "fail-to-add-place");
        console.log("error:", error, b, c);
      },
      wait: true,
    });
  }

  render() {

    // TODO: geometry warning/info messages at top of form

    const { categoryMenuIsCollapsed, formIsSubmitting, selectedCategory } = this.state;
    const { placeConfig } = this.props;
    const classNames = {
      form: cn("input-form__form", {
        "input-form__form--active": !formIsSubmitting,
        "input-form__form--inactive": formIsSubmitting
      }),
      spinner: cn("input-form__submit-spinner", {
        "input-form__submit-spinner--visible": formIsSubmitting,
        "input-form__submit-spinner--hidden": !formIsSubmitting
      })
    };
    let formFields = placeConfig.place_detail
          .filter(categoryConfig => selectedCategory === categoryConfig.category);

    if (formFields[0] && formFields[0].fields) {
      formFields = formFields[0].fields.map(fieldConfig => 
        <div
          key={fieldConfig.name} 
          className="input-form__field-container">
          {this.buildField(fieldConfig)}
        </div>
      );
    }

    return (
      <div className="input-form">
        {placeConfig.place_detail
          // .filter((category) => {
          //   return (this.state.categoryMenuIsCollapsed)
          //     ? this.state.selectedCategory === category.category
          //     : true;
          // })
          // Filter out categories that shouldn't display on the form at all.
          .filter(categoryConfig => categoryConfig.includeOnForm)
          // Filter out admin_only categories that shouldn't be shown given the
          // current user's credentials.
          .filter(categoryConfig => {
            if (categoryConfig.admin_only && 
                !Util.getAdminStatus(categoryConfig.dataset, categoryConfig.admin_groups)) {
              return false;
            }
            return true;
          })
          .map(categoryConfig =>
            <InputFormCategoryButton 
              isActive={selectedCategory === categoryConfig.category}
              categoryMenuIsCollapsed={categoryMenuIsCollapsed}
              key={categoryConfig.category}
              categoryConfig={categoryConfig} 
              onCategoryChange={this.onCategoryChange} 
              onExpandCategories={this.onExpandCategories} 
            />
        )}
        <form 
          id="mapseed-input-form"
          className={classNames.form}
          onSubmit={this.onSubmit}>
          {formFields}
        </form>
        <div className={classNames.spinner}></div>
      </div>
    );
  }
}

export default InputForm;

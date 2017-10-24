import React, { Component } from "react";
import cx from "bem-classnames";
import update from "react-addons-update";

import { InputFormCategoryButton } from "./input-form-category-button";
import { TextField } from "../form-fields/text-field";
import { TextareaField } from "../form-fields/textarea-field";
import { DropdownField } from "../form-fields/dropdown-field";
import { DatetimeField } from "../form-fields/datetime-field";
import { GeocodingField } from "../form-fields/geocoding-field";
import { PrimaryButton } from "../ui-elements/primary-button";
import { SecondaryButton } from "../ui-elements/secondary-button";
import { AddAttachmentButton } from "../form-fields/add-attachment-button";
import { RadioBigButton } from "../input-form/radio-big-button";
import { CheckboxBigButton } from "../input-form/checkbox-big-button";
import { InputFormSubmitButton } from "../input-form/input-form-submit-button";
import { RichTextareaField } from "../form-fields/rich-textarea-field";
import { MapDrawingToolbar } from "../input-form/map-drawing-toolbar";
import { AutocompleteComboboxField } from "../form-fields/autocomplete-combobox-field";
import { CustomUrlField } from "../input-form/custom-url-field";
import { ToggleBigButton } from "../form-fields/toggle-big-button";
import { PublishControlToolbar } from "../input-form/publish-control-toolbar";
import { inputForm as messages } from "../messages";

const Util = require("../../js/utils.js");

const baseClass = "input-form";

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
    this.initialRenderComplete = false;

    // Use this flag to signal if a selected form category has a
    // MapDrawingToolbar component enabled. If so, we ignore the usual drag-
    // based Point geometry creation and get geometry information from the
    // MapDrawingToolbar instead.
    this.hasCustomGeometry = false;

    this.classes = {
      inputForm: {
        name: baseClass + "__form",
        modifiers: ["active"]
      },
      fieldContainer: {
        name: baseClass + "__field-container"
      },
      prompt: {
        name: baseClass + "__field-prompt"
      },
      optionalMsg: {
        name: baseClass + "__optional-msg",
        modifiers: ["visibility"]
      },
      formSubmitSpinner: {
        name: baseClass + "__submit-spinner",
        modifiers: ["visibility"]
      },
      headerWarningMsg: {
        name: baseClass + "__header-warning-msg",
        modifiers: ["visibility", "warningLevel"]
      }
    };
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

    console.log(evt.target[property]);

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

  // Special handler for binary toggle buttons.
  // TODO: We store the on/off state of binary toggle buttons using config-
  // supplied values. Things would be simpler if we used true/false boolean
  // values instead though. Changing this might have implications for existing 
  // saved data however...
  onBinaryToggleChange(evt, values) {
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
  // values instead of a string value.
  onCheckboxFieldChange(evt) {
    let nextState;
    if (evt.target.checked) {

      // Push the newly selected checkbox value onto our array of selected
      // checkbox values.
      nextState = update(
        this.state.fieldValues, {
          [evt.target.name]: {$push: [evt.target.value]}
        }
      );

    } else {

      // If a checkbox was unchekced, splice its value out of our array of
      // selected checkbox values.
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
    }, () => {
      this.initialRenderComplete = true;
    });
  }

  getInitialFieldState(fieldConfig) {

    // "autofill" is a better term than "autocomplete" for this feature.
    // TODO: update this throughout the codebase
    let autofillValue = (fieldConfig.autocomplete)
      ? Util.getAutocompleteValue(fieldConfig.name) 
      : null;

    switch(fieldConfig.type) {
      case "binary_toggle":

        // NOTE: if binary toggle buttons don't have a saved autofill value, 
        // assume their default value is the value associated with the "off" 
        // position of the toggle.
        return autofillValue || fieldConfig.content[1].value;
        break;
      case "checkbox_big_buttons":
        return autofillValue || [];
        break;
      case "publishControl":
        return autofillValue || "isPublished";
        break;
      case "richTextarea":
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

    // If this form doesn't have a MapDrawingToolbar (and thus no custom geometry),
    // pull the centerpoint off the map to use as the geometry.
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

    let fieldPrompt = 
      <p className={cx(this.classes.prompt)}>
        {fieldConfig.prompt}
        <span className={cx(this.classes.optionalMsg, { visibility: (fieldConfig.optional) ? "visible" : "hidden" })}>{messages.optionalMsg}</span>
      </p>;

    switch(fieldConfig.type) {
      case "text":
        return [
          fieldPrompt,
          <TextField 
            name={fieldConfig.name}
            onChange={(evt) => this.onFieldChange(evt, "value")}
            value={this.state.fieldValues[fieldConfig.name]}
            placeholder={fieldConfig.placeholder}
            required={!fieldConfig.optional} 
            hasAutofill={fieldConfig.autocomplete} />
        ];
        break;
      case "textarea":
        return [
          fieldPrompt,
          <TextareaField 
            name={fieldConfig.name}
            onChange={(evt) => this.onFieldChange(evt, "value")}
            value={this.state.fieldValues[fieldConfig.name]}
            placeholder={fieldConfig.placeholder}
            required={!fieldConfig.optional} />
        ];
        break;
      case "richTextarea":
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
            value={this.state.fieldValues[fieldConfig.name]}
            placeholder={fieldConfig.placeholder}
            required={!fieldConfig.optional} 
            bounds="#content" />
        ];
        break;
      case "url-title":
        return [
          fieldPrompt,
          <CustomUrlField 
            layerConfig={this.layerConfig} 
            placeholder={fieldConfig.placeholder}
            name={fieldConfig.name}
            required={!fieldConfig.optional}
            onChange={(evt) => this.onFieldChange(evt, "value")} />
        ];
        break;
      case "geometryToolbar":
        this.hasCustomGeometry = true;
        return [
          fieldPrompt,
          <MapDrawingToolbar 
            map={this.props.map}
            markers={fieldConfig.content.map(item => item.url)} 
            router={this.props.router}
            formIsOpen={this.state.formIsOpen} 
            onGeometryChange={this.onGeometryChange.bind(this)} 
            onGeometryStyleChange={this.onGeometryStyleChange.bind(this)} />
        ];
        break;
      case "file":
        return [
          fieldPrompt,
          <AddAttachmentButton 
            name={fieldConfig.name} />
        ];
        break;
      case "submit":
        return (
          <InputFormSubmitButton 
            disabled={this.state.formIsSubmitting}
            label={fieldConfig.label} />
        ); 
        break;
      case "checkbox_big_buttons":
        return [
          fieldPrompt,
          fieldConfig.content.map((item) => 
            <CheckboxBigButton
              key={item.value}
              value={item.value}
              label={item.label}
              id={"input-form-" + fieldConfig.name + "-" + item.value}
              checked={this.state.fieldValues[fieldConfig.name].includes(item.value)}
              name={fieldConfig.name} 
              onChange={this.onCheckboxFieldChange.bind(this)} />)
        ];
        break;
      case "radio_big_buttons":
        return [
          fieldPrompt,
          fieldConfig.content.map((item) => 
            <RadioBigButton
              key={item.value}
              value={item.value}
              label={item.label}
              id={"input-form-" + fieldConfig.name + "-" + item.value}
              name={fieldConfig.name} 
              onChange={(evt) => this.onFieldChange(evt, "value")} />)
        ];
        break
      case "publishControl":
        return (
          <PublishControlToolbar
            name={fieldConfig.name}
            published={this.state.fieldValues[fieldConfig.name]}
            onChange={(evt) => this.onFieldChange(evt, "value")} />
        );
        break;
      case "datetime":
        return [
          fieldPrompt,
          <DatetimeField
            showTimeSelect={true}
            onChange={this.onFieldChange.bind(this)} />
        ];
      case "geocoding":
        return [
          fieldPrompt,
          <GeocodingField
            onChange={(evt) => this.onFieldChange(evt, "value")}
            name={fieldConfig.name}
            value={this.state.fieldValues[fieldConfig.name]}
            mapConfig={this.props.mapConfig}
            emitter={this.props.emitter} />
        ];
        break;
      case "binary_toggle":
        let values = [fieldConfig.content[0].value, fieldConfig.content[1].value];
        return [
          fieldPrompt,
          <ToggleBigButton
            name={fieldConfig.name}
            checked={this.state.fieldValues[fieldConfig.name] === fieldConfig.content[0].value}
            labels={[fieldConfig.content[0].label, fieldConfig.content[1].label]}
            values={[fieldConfig.content[0].value, fieldConfig.content[1].value]}
            id={"input-form-" + fieldConfig.name}
            onChange={(evt) => this.onBinaryToggleChange(evt, [fieldConfig.content[0].value, fieldConfig.content[1].value])} />
        ];
        break;
      case "dropdown":
        return [
          fieldPrompt,
          <DropdownField
            name={fieldConfig.name}
            value={this.state.fieldValues[fieldConfig.name]}
            required={!fieldConfig.optional}
            options={fieldConfig.content}
            onChange={(evt) => this.onFieldChange(evt, "value")} />
        ];
        break;
      case "dropdown-autocomplete":
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
      case "commonFormElement":
        let commonFormElementConfig = Object.assign(
          {},
          this.props.placeConfig.common_form_elements[fieldConfig.name],
          {name: fieldConfig.name}
        );
        return this.buildField(commonFormElementConfig);
        break;
    }
  }

  // Perform any validation needed that isn't covered by HTML5 field validation.
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
    let spinnerTarget = document.getElementsByClassName(cx(this.classes.formSubmitSpinner))[0];
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

    let formFields = this.props.placeConfig.place_detail
          .filter(category => this.state.selectedCategory === category.category);

    if (formFields[0] && formFields[0].fields) {
      formFields = formFields[0].fields.map((fieldConfig) => 
        <div
          key={fieldConfig.name} 
          className={cx(this.classes.fieldContainer)}>
          {this.buildField(fieldConfig)}
        </div>
      );
    }

    return (
      <div className={baseClass}>
        {this.props.placeConfig.place_detail
          // .filter((category) => {
          //   return (this.state.categoryMenuIsCollapsed)
          //     ? this.state.selectedCategory === category.category
          //     : true;
          // })
          // Filter out categories that shouldn't display on the form at all.
          .filter(category => category.includeOnForm)
          // Filter out admin_only categories that shouldn't be shown given the
          // current user's credentials.
          .filter((category) => {
            if (category.admin_only && 
                !Util.getAdminStatus(category.dataset, category.admin_groups)) {
              return false;
            }
            return true;
          })
          .map(category =>
            <InputFormCategoryButton 
              isActive={this.state.selectedCategory === category.category}
              categoryMenuIsCollapsed={this.state.categoryMenuIsCollapsed}
              key={category.category}
              categoryConfig={category} 
              onCategoryChange={this.onCategoryChange.bind(this)} 
              onExpandCategories={this.onExpandCategories.bind(this)} />
        )}
        <form 
          id="mapseed-input-form" 
          className={cx(this.classes.inputForm, { active: (this.state.formIsSubmitting) ? "inactive" : "active" })}
          onSubmit={this.onSubmit.bind(this)}>
          {formFields}
        </form>
        <div className={cx(this.classes.formSubmitSpinner, { visibility: (this.state.formIsSubmitting) ? "visible" : "hidden" })}></div>
      </div>
    );
  }
}

export { InputForm };

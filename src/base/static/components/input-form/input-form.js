import React, { Component } from "react";
import cx from "bem-classnames";

import { InputFormCategoryButton } from "./input-form-category-button";
import { TextField } from "../form-fields/text-field";
import { TextareaField } from "../form-fields/textarea-field";
import { DropdownField } from "../form-fields/dropdown-field";
import { CheckboxField } from "../form-fields/checkbox-field";
import { RadioField } from "../form-fields/radio-field";
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



const baseClass = "input-form";

class InputForm extends Component {

  constructor() {
    super();
    this.state = {
      allCategories: [],
      visibleCategories: [],

      // TODO: this state will probably be bumped higher in the hierarchy as the
      // port proceeds.
      formIsOpen: false
    };

    this.options = [
      {
        value: "one",
        label: "One",
        selected: false
      },
      {
        value: "two",
        label: "Two",
        selected: true
      },
      {
        value: "three",
        label: "Three",
        selected: false
      }
    ];

    this.markers = [
      "/static/css/images/markers/marker-star.png",
      "/static/css/images/markers/marker-heart.png"
    ];

    this.suggestions = [
      {
        value: 'france',
        label: 'France'
      },
      {
        value: 'germany',
        label: 'Germany'
      },
      {
        value: 'united-kingdom',
        label: 'United Kingdom'
      }
    ];

    this.layerConfig = {
      id: "whatever",
      type: "place",
      slug: "slug"
    }
  }

  onChange(evt) {
    console.log("!!!!!", evt.target.value);

  }

  onGeometry(geometry) {
    console.log("onGeometry", geometry);
  }

  componentWillMount() {
    this.setState({ allCategories: this.props.placeConfig.place_detail });
    this.setState({ visibleCategories: this.props.placeConfig.place_detail });
  }

  componentDidMount() {
    this.setState({ formIsOpen: true });
    this.props.router.on("route", this.setState({ formIsOpen: false }), this);
  }

  onCategoryChange(evt) {
	
  }

  onSubmit(evt) {
    evt.preventDefault();
    console.log("form onSubmit");
  }

  render() {

    let fileFieldContainerClass = {
          name: baseClass + "__file-field-container"
        };

    return (
      <div className={baseClass}>
        {this.state.visibleCategories.map((category) =>
          <InputFormCategoryButton 
            key={category.category}
            categoryConfig={category} 
            onCategoryChange={this.onCategoryChange.bind(this)} />
        )}
        <form id="my-form" onSubmit={this.onSubmit.bind(this)}>

          <TextField 
            name="blah"
            placeholder="blahblah"
            required={false}>
          </TextField>
          <TextareaField 
            name="blah"
            onChange={this.onChange.bind(this)}
            placeholder="placeholder"
            required={true}>
          </TextareaField>
          <DropdownField
            name="blah"
            options={this.options}
            onChange={this.onChange.bind(this)}>
          </DropdownField>
          <CheckboxField
            name="ddsfsd"
            onChange={this.onChange.bind(this)}
            defaultChecked={true}>
          </CheckboxField>
          <RadioField
            name="ddsfsd"
            onChange={this.onChange.bind(this)}
            defaultChecked={false}>
          </RadioField>
          <RadioField
            name="ddsfsd"
            onChange={this.onChange.bind(this)}
            defaultChecked={true}>
          </RadioField>
          <DatetimeField
            showTimeSelect={true}
            onChange={this.onChange.bind(this)}>
          </DatetimeField>
          <GeocodingField
            onChange={this.onChange.bind(this)}
            name="dsfsdf"
            mapConfig={this.props.mapConfig}
            emitter={this.props.emitter}>
          </GeocodingField>
          <AddAttachmentButton name="my_image" />

          <RadioBigButton
            label="blah"
            id="blahblah"
            name="some-name" />
          <CheckboxBigButton
            label="waaaaa"
            id="blahblah2"
            name="some-name2" />
          <CheckboxBigButton
            label="blah2"
            id="blahblah3"
            name="some-name2" />

          <InputFormSubmitButton 
            label="Put it on the map!" />

          <MapDrawingToolbar 
            map={this.props.map}
            markers={this.markers} 
            router={this.props.router}
            formIsOpen={this.state.formIsOpen} 
            onGeometry={this.onGeometry.bind(this)} />

          <AutocompleteComboboxField
            options={this.suggestions}
            placeholder="Type a name"
            id="autocomplete"
            onChange={this.onChange.bind(this)}
            showAllValues={true} />

          <CustomUrlField 
            urlPrefix="localhost" 
            layerConfig={this.layerConfig} 
            placeholder="Type a custom url" 
            onChange={this.onChange.bind(this)} />

        </form> 
      </div>
    );
  }
}

export { InputForm };

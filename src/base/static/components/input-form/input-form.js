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


const baseClass = "input-form";

class InputForm extends Component {

	constructor() {
		super();
		this.state = {
			allCategories: [],
			visibleCategories: []
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
	}

	onChange() {
		console.log("!!!!!");

	}

	componentWillMount() {
		this.setState({ allCategories: this.props.placeConfig.place_detail });
		this.setState({ visibleCategories: this.props.placeConfig.place_detail });
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

	    	</form>
    	</div>
    );
  }
}

export { InputForm };

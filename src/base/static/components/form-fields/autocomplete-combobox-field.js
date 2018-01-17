import React, { Component } from "react";
import PropTypes from "prop-types";
import Autocomplete from "accessible-autocomplete/react";

import "./autocomplete-combobox-field.scss";

/*
  this.props.options should be an array of objects. Each object is as follows:
  {
    value: "option-value",
    label: "Option label"
  }
*/

class AutocompleteComboboxField extends Component {
  constructor() {
    super();
    this.suggestions = (query, populateResults) => {
      const filteredResults = this.props.options
        .map(option => option.label)
        .filter(
          result => result.toLowerCase().indexOf(query.toLowerCase()) !== -1
        );
      populateResults(filteredResults);
    };
    this.onConfirm = this.onConfirm.bind(this);
  }

  onConfirm(selectedLabel) {
    const { name, onChange, options } = this.props;
    const value = selectedLabel
      ? options.find(option => option.label === selectedLabel).value
      : "";

    onChange(value, name);
  }

  render() {
    const { id, placeholder } = this.props;

    return (
      <div className="autocomplete-combobox-field">
        <Autocomplete
          source={this.suggestions}
          placeholder={placeholder}
          confirmOnBlur={true}
          id={id}
          showAllValues={true}
          onConfirm={this.onConfirm}
        />
      </div>
    );
  }
}

AutocompleteComboboxField.propTypes = {
  options: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
};

export default AutocompleteComboboxField;

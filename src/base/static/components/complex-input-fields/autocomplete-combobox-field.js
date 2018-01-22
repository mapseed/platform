import React, { Component } from "react";
import PropTypes from "prop-types";
import Autocomplete from "accessible-autocomplete/react";

import "./autocomplete-combobox-field.scss";

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
  }

  onConfirm(selectedLabel) {
    const value = selectedLabel
      ? this.props.options.find(option => option.label === selectedLabel).value
      : "";

    this.props.onChange(this.props.name, value);
  }

  render() {
    return (
      <div className="autocomplete-combobox-field">
        <Autocomplete
          source={this.suggestions}
          placeholder={this.props.placeholder}
          confirmOnBlur={true}
          id={this.props.id}
          showAllValues={true}
          onConfirm={this.onConfirm.bind(this)}
        />
      </div>
    );
  }
}

AutocompleteComboboxField.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  placeholder: PropTypes.string,
};

export default AutocompleteComboboxField;

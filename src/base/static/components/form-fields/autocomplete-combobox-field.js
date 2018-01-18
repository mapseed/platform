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

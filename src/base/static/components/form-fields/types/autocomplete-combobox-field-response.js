import React from "react";
import PropTypes from "prop-types";

const AutocompleteComboboxFieldResponse = props => {
  return <p className="autocomplete-combobox-field-response">{props.label}</p>;
};

AutocompleteComboboxFieldResponse.propTypes = {
  label: PropTypes.string.isRequired,
};

export default AutocompleteComboboxFieldResponse;

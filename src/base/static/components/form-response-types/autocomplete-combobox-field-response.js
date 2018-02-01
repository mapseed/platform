import React from "react";
import PropTypes from "prop-types";

const AutocompleteComboboxFieldResponse = props => {
  return props.value
    .filter(response => response.selected)
    .map((response, i) => <p key={i}>{response.label}</p>);
};

AutocompleteComboboxFieldResponse.propTypes = {
  value: PropTypes.array.isRequired,
};

export default AutocompleteComboboxFieldResponse;

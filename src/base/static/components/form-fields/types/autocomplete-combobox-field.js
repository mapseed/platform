import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Autocomplete from "accessible-autocomplete/react";
import "accessible-autocomplete/dist/accessible-autocomplete.min.css";
import { translate } from "react-i18next";

import "./autocomplete-combobox-field.scss";

class AutocompleteComboboxField extends Component {
  constructor() {
    super();
    this.suggestions = (query, populateResults) => {
      const filteredResults = this.props.options
        .map(option => option.label)
        .filter(
          result => result.toLowerCase().indexOf(query.toLowerCase()) !== -1,
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
      <div
        className={classNames("autocomplete-combobox-field", {
          "autocomplete-combobox-field--has-autofill": this.props.hasAutofill,
        })}
      >
        <Autocomplete
          source={this.suggestions}
          placeholder={this.props.t(
            `autocompleteFieldPlaceholder${this.props.formId}${
              this.props.name
            }`,
            this.props.placeholder || " ",
          )}
          defaultValue={
            this.props.value
              ? this.props.options.find(
                  option => option.value === this.props.value,
                ).label
              : ""
          }
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
  formId: PropTypes.string.isRequired,
  hasAutofill: PropTypes.bool,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  placeholder: PropTypes.string,
  t: PropTypes.func.isRequired,
  value: PropTypes.string,
};

export default translate("AutocompleteComboboxField")(
  AutocompleteComboboxField,
);

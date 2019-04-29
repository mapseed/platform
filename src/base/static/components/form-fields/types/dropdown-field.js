import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import { translate } from "react-i18next";
import "./dropdown-field.scss";

const DropdownField = props => {
  const cn = classNames("dropdown-field", {
    "dropdown-field--has-autofill": props.hasAutofill,
  });

  return (
    <select
      className={cn}
      value={props.value}
      name={props.name}
      onChange={e => props.onChange(e.target.name, e.target.value)}
    >
      <option value="">
        {props.t("makeSelection", "Make a selection...")}
      </option>
      {props.options.map((option, optionIndex) => (
        <option key={option.value} value={option.value}>
          {props.t(
            `dropdownFieldOption${props.formId}${props.name}${optionIndex}`,
            option.label,
          )}
        </option>
      ))}
    </select>
  );
};

DropdownField.propTypes = {
  hasAutofill: PropTypes.bool.isRequired,
  formId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      selected: PropTypes.bool,
    }),
  ).isRequired,
  t: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

DropdownField.defaultProps = {
  hasAutofill: false,
};

export default translate("DropdownField")(DropdownField);

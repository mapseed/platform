import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./textarea-field.scss";

const TextareaField = props => {
  const cn = classNames("textarea-field", {
    "textarea-field--has-autofill": props.hasAutofill,
  });

  return (
    <textarea
      className={cn}
      name={props.name}
      placeholder={props.placeholder}
      value={props.value}
      onChange={e => props.onChange(e.target.name, e.target.value)}
    />
  );
};

TextareaField.propTypes = {
  hasAutofill: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
};

export default TextareaField;

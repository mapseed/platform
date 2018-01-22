import React from "react";
import PropTypes from "prop-types";

import "./file-field.scss";

const FileField = props => {
  return (
    <div className="file-field">
      <input
        className="file-field__input file-field__input--hidden"
        type="file"
        id={props.name}
        name={props.name}
        value={props.value}
        required={props.required}
        onChange={props.onChange}
        accept={props.accept}
      />
      <label
        className="file-field__label file-field__label--hoverable"
        htmlFor={props.name}
      >
        {props.label}
      </label>
    </div>
  );
};

FileField.propTypes = {
  accept: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  value: PropTypes.string,
};

export default FileField;

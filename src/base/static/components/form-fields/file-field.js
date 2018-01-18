import React from "react";
import PropTypes from "prop-types";

import "./file-field.scss";

const FileField = props => {
  const { accept, label, name, onChange, required, value } = props;

  return (
    <div className="file-field">
      <input
        className="file-field__input file-field__input--hidden"
        type="file"
        id={name}
        name={name}
        value={value}
        required={required}
        onChange={onChange}
        accept={accept}
      />
      <label
        className="file-field__label file-field__label--hoverable"
        htmlFor={name}
      >
        {label}
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

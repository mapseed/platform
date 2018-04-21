import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./file-field.scss";

const FileField = props => {
  return (
    <label
      className={classNames("file-field", props.className)}
      htmlFor={props.name}
    >
      <input
        className="file-field__input"
        type="file"
        id={props.name}
        name={props.name}
        value={props.value}
        required={props.required}
        onChange={props.onChange}
        accept={props.accept}
      />
      {props.label}
    </label>
  );
};

FileField.propTypes = {
  accept: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  value: PropTypes.string,
};

export default FileField;

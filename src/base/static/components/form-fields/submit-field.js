import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./submit-field.scss";

const SubmitField = props => {
  const { disabled, id, name, usageContext } = props;
  const cn = classNames("submit-field", {
    "submit-field--primary-button-context": usageContext === "PrimaryButton",
  });

  return (
    <input
      className={cn}
      type="submit"
      id={id}
      name={name}
      disabled={disabled}
    />
  );
};

SubmitField.propTypes = {
  disabled: PropTypes.bool,
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  usageContext: PropTypes.string,
};

export default SubmitField;

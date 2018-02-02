import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./submit-field.scss";

const SubmitField = props => {
  const cn = classNames("submit-field", {
    "submit-field--primary-button-context":
      props.usageContext === "PrimaryButton",
  });

  return (
    <input
      className={cn}
      type="submit"
      id={props.id}
      name={props.name}
      disabled={props.disabled}
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

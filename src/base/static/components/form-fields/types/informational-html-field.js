import React from "react";
import PropTypes from "prop-types";
import { translate } from "react-i18next";

const InformationalHTMLField = props => {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: props.t(
          `informationalHTMLContent${props.formId}${props.name}`,
          props.content,
        ),
      }}
    />
  );
};

InformationalHTMLField.propTypes = {
  content: PropTypes.string.isRequired,
  formId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

export default translate("InformationalHTMLField")(InformationalHTMLField);

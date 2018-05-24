import React from "react";
import PropTypes from "prop-types";

const InformationalHTMLField = props => {
  return <div dangerouslySetInnerHTML={{ __html: props.content }} />;
};

InformationalHTMLField.propTypes = {
  content: PropTypes.string.isRequired,
};

export default InformationalHTMLField;

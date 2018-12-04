import React from "react";
import PropTypes from "prop-types";

const CustomPage = props => (
  <div dangerouslySetInnerHTML={{ __html: props.pageContent }} />
);

CustomPage.propTypes = {
  pageContent: PropTypes.string.isRequired,
};

export default CustomPage;

import React from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";

const CustomPageWrapper = styled(props => ({}));

const CustomPage = props => (
  <div
    id="mapseed-custom-page-container"
    dangerouslySetInnerHTML={{ __html: props.pageContent }}
  />
);

CustomPage.propTypes = {
  pageContent: PropTypes.string.isRequired,
};

export default CustomPage;

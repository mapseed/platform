import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { pageSelector } from "../../state/ducks/pages-config";

const CustomPage = props => (
  <div
    id="mapseed-custom-page-container"
    dangerouslySetInnerHTML={{
      __html: props.pageContent({
        pageSlug: props.pageSlug,
        currentLanguageCode: props.currentLanguageCode,
        defaultLanguageCode: props.defaultLanguageCode,
      }).content,
    }}
  />
);

CustomPage.propTypes = {
  currentLanguageCode: PropTypes.string.isRequired,
  defaultLanguageCode: PropTypes.string.isRequired,
  layout: PropTypes.string.isRequired,
  pageContent: PropTypes.func.isRequired,
  pageSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  pageContent: ({ pageSlug, currentLanguageCode, defaultLanguageCode }) =>
    pageSelector({ state, pageSlug, currentLanguageCode, defaultLanguageCode }),
});

export default connect(mapStateToProps)(CustomPage);

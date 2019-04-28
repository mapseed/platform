import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { pageSelector } from "../../state/ducks/pages-config";

const CustomPage = props => (
  <div
    id="mapseed-custom-page-container"
    dangerouslySetInnerHTML={{
      __html: props.pageContent(props.pageSlug, props.currentLanguage).content,
    }}
  />
);

CustomPage.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
  pageContent: PropTypes.func.isRequired,
  pageSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  pageContent: (slug, lang) => pageSelector({ state, slug, lang }),
});

export default connect(mapStateToProps)(CustomPage);

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";

import { pageSelector } from "../../state/ducks/pages-config";

const CustomPage = props => {
  const pageContent = props.pageContent(props.pageSlug).content;

  return (
    <div
      id="mapseed-custom-page-container"
      dangerouslySetInnerHTML={{
        __html: props.t(`customPage${props.pageSlug}`, pageContent),
      }}
    />
  );
};

CustomPage.propTypes = {
  currentLanguageCode: PropTypes.string.isRequired,
  defaultLanguageCode: PropTypes.string.isRequired,
  layout: PropTypes.string.isRequired,
  pageContent: PropTypes.func.isRequired,
  pageSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  pageContent: pageSlug => pageSelector(state, pageSlug),
});

export default connect(mapStateToProps)(
  withTranslation("CustomPage")(CustomPage),
);

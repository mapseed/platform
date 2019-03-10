import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { connect } from "react-redux";

import CustomPage from "../components/organisms/custom-page";

import {
  contentPanelComponentSelector,
  pageSlugSelector,
} from "../state/ducks/ui";
import { pageSelector } from "../state/ducks/pages-config";

const ContentPanelContainer = styled("section")({
  width: "40%",
  height: "100%",
});

const ContentPanel = props => {
  return (
    <ContentPanelContainer>
      {props.contentPanelComponent === "CustomPage" && (
        <CustomPage
          pageContent={
            props.pageSelector(props.pageSlug, props.languageCode).content
          }
        />
      )}
    </ContentPanelContainer>
  );
};

ContentPanel.propTypes = {
  contentPanelComponent: PropTypes.string.isRequired,
  languageCode: PropTypes.string.isRequired,
  pageSelector: PropTypes.func.isRequired,
  pageSlug: PropTypes.string,
};

const mapStateToProps = state => ({
  contentPanelComponent: contentPanelComponentSelector(state),
  pageSelector: (pageSlug, lang) => pageSelector(state, pageSlug, lang),
  pageSlug: pageSlugSelector(state),
});

export default connect(mapStateToProps)(ContentPanel);

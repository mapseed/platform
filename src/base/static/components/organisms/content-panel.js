import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { connect } from "react-redux";

import CustomPage from "./custom-page";

import {
  contentPanelComponentSelector,
  pageSlugSelector,
} from "../../state/ducks/ui";
import { pageSelector } from "../../state/ducks/pages-config";

const ContentPanelOuterContainer = styled("section")({
  position: "absolute",
  top: 0,
  right: 0,
  width: "40%",
  height: "100%",
  backgroundColor: "#fff",
  boxSizing: "border-box",
  boxShadow: "-4px 0 3px rgba(0,0,0,0.1)",
});

const ContentPanelInnerContainer = styled("div")({
  width: "100%",
  height: "100%",
  overflow: "auto",
  padding: "8px",
  boxSizing: "border-box",
});

const CloseButton = styled("button")({
  position: "absolute",
  top: "10px",
  left: "-35px",
  borderTopLeftRadius: "8px",
  borderBottomLeftRadius: "8px",
  backgroundColor: "#fff",
  outline: "none",
  border: "none",
  fontSize: "24px",
  color: "#ff5e99",
  boxShadow: "-4px 4px 3px rgba(0,0,0,0.1)",
  padding: "12px 10px 8px 10px",

  "&:hover": {
    color: "#cd2c67",
    cursor: "pointer",
  },
});

const ContentPanel = props => {
  return (
    <ContentPanelOuterContainer>
      <CloseButton
        onClick={evt => {
          evt.preventDefault();
          props.router.navigate("/", { trigger: true });
        }}
      >
        &#10005;
      </CloseButton>
      <ContentPanelInnerContainer>
        {props.contentPanelComponent === "CustomPage" && (
          <CustomPage
            pageContent={
              props.pageSelector(props.pageSlug, props.languageCode).content
            }
          />
        )}
      </ContentPanelInnerContainer>
    </ContentPanelOuterContainer>
  );
};

ContentPanel.propTypes = {
  contentPanelComponent: PropTypes.string,
  languageCode: PropTypes.string.isRequired,
  pageSelector: PropTypes.func.isRequired,
  pageSlug: PropTypes.string,
  router: PropTypes.instanceOf(Backbone.Router).isRequired,
};

const mapStateToProps = state => ({
  contentPanelComponent: contentPanelComponentSelector(state),
  pageSelector: (slug, lang) => pageSelector({ state, slug, lang }),
  pageSlug: pageSlugSelector(state),
});

export default connect(mapStateToProps)(ContentPanel);

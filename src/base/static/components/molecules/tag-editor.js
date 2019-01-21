import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { translate } from "react-i18next";

import { SmallText } from "../atoms/typography";
import TagLabelSet from "./tag-label-set";

const TagContainer = styled("div")(props => ({
  outline: "none",
  padding: "8px",
  display: "flex",
  alignItems: "center",
  marginBottom: "8px",
  borderTop: props.isActive ? "1px solid #a8a8a8" : "1px dashed #aaa",
  borderRight: props.isActive ? "1px solid #c8c8c8" : "1px dashed #aaa",
  borderBottom: props.isActive ? 0 : "1px dashed #aaa",
  borderLeft: props.isActive ? "1px solid #c8c8c8" : "1px dashed #aaa",
  borderRadius: "3px",
  backgroundColor: props.isActive ? "#6495ed" : "transparent",
}));

const TagComment = styled(SmallText)(props => ({
  whiteSpace: props.isExpanded ? "unset" : "nowrap",
  textOverflow: "ellipsis",
  color: "#fff",
  fontStyle: "italic",
  overflow: "hidden",
  borderLeft: "1px solid #fff",
  paddingLeft: "6px",
  textAlign: "left",
}));

const ExpandCollapseButton = styled("button")({
  backgroundColor: "transparent",
  border: "none",
  outline: "none",
});

const ExpandCollapseText = styled(SmallText)({
  display: "block",
  whiteSpace: "nowrap",
  color: "#fff",
  fontStyle: "italic",
});

class Tag extends Component {
  state = {
    isExpanded: false,
  };

  render() {
    return (
      <TagContainer
        isActive={this.props.isActive}
        isExpanded={this.state.isExpanded}
      >
        <TagLabelSet
          tag={this.props.tag}
          isActive={this.props.isActive}
          datasetSlug={this.props.datasetSlug}
        />
        {this.props.tag.comment && (
          <Fragment>
            <TagComment isExpanded={this.state.isExpanded}>
              {this.props.tag.comment}
            </TagComment>
            <ExpandCollapseButton
              onClick={() =>
                this.setState({ isExpanded: !this.state.isExpanded })
              }
            >
              <ExpandCollapseText>
                {this.state.isExpanded
                  ? this.props.t("showLess")
                  : this.props.t("showMore")}
              </ExpandCollapseText>
            </ExpandCollapseButton>
          </Fragment>
        )}
      </TagContainer>
    );
  }
}

Tag.propTypes = {
  isActive: PropTypes.bool.isRequired,
  placeTags: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      comment: PropTypes.string,
    }),
  ),
  tag: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    parent: PropTypes.number,
  }).isRequired,
  datasetSlug: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

export default translate("Tag")(Tag);

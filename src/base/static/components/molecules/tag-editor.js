import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { translate } from "react-i18next";

import { TextareaInput } from "../atoms/input";
import TagNameSet from "./tag-name-set";

import mapseedApiClient from "../../client/mapseed-api-client";

const TagContainer = styled("div")(props => ({
  outline: "none",
  boxSizing: "border-box",
  width: "100%",
  padding: "8px",
  display: "flex",
  alignItems: "center",
  marginBottom: "8px",
  borderTop: props.isTagged ? "1px solid #a8a8a8" : "1px dashed #aaa",
  borderRight: props.isTagged ? "1px solid #c8c8c8" : "1px dashed #aaa",
  borderBottom: props.isTagged ? "1px solid transparent" : "1px dashed #aaa",
  borderLeft: props.isTagged ? "1px solid #c8c8c8" : "1px dashed #aaa",
  borderRadius: "3px",
  backgroundColor: props.isTagged
    ? props.backgroundColor || "#6495ed"
    : "transparent",

  "&:hover": {
    cursor: "pointer",
    backgroundColor: props.backgroundColor || "#6495ed",
    opacity: props.isTagged ? 1 : 0.3,
  },
}));

const CommentBox = styled(TextareaInput)(props => ({
  outline: "none !important",
  padding: "0 8px 0 6px",
  overflow: props.isFocused ? "visible" : "hidden",
  height: props.isFocused ? "5rem" : "0.7rem",
  lineHeight: props.isFocused ? "1rem" : "0.8rem",
  background: "transparent",
  borderLeft: "1px solid #fff !important",
  borderRight: "none !important",
  borderTop: "none !important",
  borderBottom: "none !important",
  color: "#fff",
  fontStyle: "italic",
  fontSize: "0.75rem",
  fontWeight: "normal",
  transition: "all .5s ease",

  "&::-webkit-input-placeholder": {
    color: props.isActive ? "#ddd" : "#ccc",
  },
  "&:-moz-placeholder": {
    color: props.isActive ? "#ddd" : "#ccc",
  },
  "&:-ms-input-placeholder": {
    color: props.isActive ? "#ddd" : "#ccc",
  },
}));

class TagEditor extends Component {
  state = {
    isFocused: false,
    note: this.props.placeTag && this.props.placeTag.note,
  };

  render() {
    const isTagged = !!this.props.placeTag;

    return (
      <TagContainer
        isTagged={isTagged}
        backgroundColor={this.props.backgroundColor}
        onClick={() => {
          this.props.onClick({
            tagId: this.props.tag.id,
            isTagged: isTagged,
            note: this.state.note,
          });
        }}
      >
        <TagNameSet tagNames={this.props.tagNames} isTagged={isTagged} />
        {isTagged && (
          <CommentBox
            value={this.state.note}
            placeholder="(Add a comment...)"
            isFocused={this.state.isFocused}
            onBlur={() => {
              // Save the comment text on blur.
              mapseedApiClient.placeTags.update({
                placeTag: this.props.placeTag,
                newData: {
                  note: this.state.note,
                },
                onSuccess: tagData => this.props.onUpdateComment(tagData),
                onFailure: () => {
                  // eslint-disable-next-line no-console
                  console.log("Error: Tag note did note save.");
                },
              });
              this.setState({ isFocused: false });
            }}
            onFocus={() => {
              this.setState({ isFocused: true });
            }}
            onClick={evt => {
              evt.stopPropagation();
            }}
            onChange={evt => {
              evt.preventDefault();
              this.setState({
                note: evt.target.value,
              });
            }}
          />
        )}
      </TagContainer>
    );
  }
}

TagEditor.propTypes = {
  backgroundColor: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  placeTag: PropTypes.shape({
    url: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    note: PropTypes.string,
  }),
  tag: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    parent: PropTypes.number,
  }).isRequired,
  onUpdateComment: PropTypes.func.isRequired,
  datasetSlug: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  tagNames: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default translate("TagEditor")(TagEditor);

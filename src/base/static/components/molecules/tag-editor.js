import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { translate } from "react-i18next";

import { TextareaInput } from "../atoms/input";
import TagLabelSet from "./tag-label-set";

const TagContainer = styled("div")(props => ({
  outline: "none",
  width: "100%",
  padding: "8px",
  display: "flex",
  alignItems: "center",
  marginBottom: "8px",
  borderTop: props.isActive ? "1px solid #a8a8a8" : "1px dashed #aaa",
  borderRight: props.isActive ? "1px solid #c8c8c8" : "1px dashed #aaa",
  borderBottom: props.isActive ? "1px solid transparent" : "1px dashed #aaa",
  borderLeft: props.isActive ? "1px solid #c8c8c8" : "1px dashed #aaa",
  borderRadius: "3px",
  backgroundColor: props.isActive ? "#6495ed" : "transparent",

  "&:hover": {
    cursor: "pointer",
  },
}));

const CommentBox = styled(TextareaInput)(props => ({
  padding: "0 8px 0 6px",
  overflow: props.isFocused ? "visible" : "hidden",
  height: props.isFocused ? "5rem" : "0.7rem",
  lineHeight: props.isFocused ? "1rem" : "0.8rem",
  background: "transparent",
  textOverflow: props.isFocused ? "unset" : "ellipsis",
  borderLeft: "1px solid #fff",
  borderRight: "none",
  borderTop: "none",
  borderBottom: "none",
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
    comment: this.props.placeTag && this.props.placeTag.comment,
  };

  render() {
    const isActive = !!this.props.placeTag;

    return (
      <TagContainer
        isActive={isActive}
        onClick={() => {
          this.props.onClick({
            tagId: this.props.tag.id,
            isActive: isActive,
            comment: this.state.comment,
          });
        }}
      >
        <TagLabelSet
          tag={this.props.tag}
          isActive={isActive}
          datasetSlug={this.props.datasetSlug}
        />
        {isActive && (
          <CommentBox
            value={this.state.comment}
            placeholder="(Add a comment...)"
            isFocused={this.state.isFocused}
            onBlur={() => {
              // Save the comment text on blur.
              this.props.onUpdateComment(this.props.tag.id, this.state.comment);
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
                comment: evt.target.value,
              });
            }}
          />
        )}
      </TagContainer>
    );
  }
}

TagEditor.propTypes = {
  onClick: PropTypes.func.isRequired,
  placeTag: PropTypes.shape({
    id: PropTypes.number.isRequired,
    comment: PropTypes.string,
  }),
  tag: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    parent: PropTypes.number,
  }).isRequired,
  onUpdateComment: PropTypes.func.isRequired,
  datasetSlug: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

export default translate("TagEditor")(TagEditor);

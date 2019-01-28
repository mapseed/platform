import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { translate } from "react-i18next";

import { TextareaInput } from "../atoms/input";
import TagName from "./tag-name";

import mapseedApiClient from "../../client/mapseed-api-client";

const TagContainer = styled("div")(props => ({
  outline: "none",
  boxSizing: "border-box",
  width: "100%",
  padding: "8px",
  display: "flex",
  alignItems: "center",
  marginBottom: "8px",
  borderTop: props.isSelected ? "1px solid #a8a8a8" : "1px dashed #aaa",
  borderRight: props.isSelected ? "1px solid #c8c8c8" : "1px dashed #aaa",
  borderBottom: props.isSelected ? "1px solid transparent" : "1px dashed #aaa",
  borderLeft: props.isSelected ? "1px solid #c8c8c8" : "1px dashed #aaa",
  borderRadius: "3px",
  backgroundColor: props.isSelected
    ? props.backgroundColor || "#6495ed"
    : "transparent",

  "&:hover": {
    cursor: "pointer",
    backgroundColor: props.backgroundColor || "#6495ed",
    opacity: props.isSelected ? 1 : 0.3,
  },
}));

const NoteBox = styled(TextareaInput)(props => ({
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
}));

class TagEditor extends Component {
  state = {
    isFocused: false,
    note: this.props.placeTag ? this.props.placeTag.note : "",
  };

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const isSelected = !!this.props.placeTag;

    return (
      <TagContainer
        isSelected={isSelected}
        backgroundColor={this.props.backgroundColor}
        onClick={async () => {
          // Toggle the placeTag.
          if (isSelected) {
            await mapseedApiClient.placeTags.delete(this.props.placeTag.url);
            this.props.onDeletePlaceTag(this.props.placeTag.id);
          } else {
            const tagData = await mapseedApiClient.placeTags.create(
              this.props.placeUrl,
              {
                note: this.state.note,
                place: this.props.placeUrl,
                tag: this.props.tag.url,
              },
            );
            this.props.onCreatePlaceTag(tagData);
          }
        }}
      >
        <TagName displayName={this.props.displayName} isSelected={isSelected} />
        {isSelected && (
          <NoteBox
            value={this.state.note}
            placeholder={this.props.t("addNotePlaceholder")}
            isFocused={this.state.isFocused}
            onBlur={async () => {
              // Save the note text on blur.
              const tagData = await mapseedApiClient.placeTags.update(
                this.props.placeTag.url,
                {
                  note: this.state.note,
                },
              );
              this.props.onUpdateTagNote(tagData);
              if (this._isMounted) {
                // The blur event could fire after the component unmounts (for
                // example if the user closes the content panel). Only update
                // the local state if the component is still mounted.
                this.setState({ isFocused: false });
              }
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
  placeTag: PropTypes.shape({
    url: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    note: PropTypes.string,
  }),
  placeUrl: PropTypes.string.isRequired,
  tag: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    parent: PropTypes.number,
    url: PropTypes.string.isRequired,
  }).isRequired,
  onCreatePlaceTag: PropTypes.func.isRequired,
  onDeletePlaceTag: PropTypes.func.isRequired,
  onUpdateTagNote: PropTypes.func.isRequired,
  datasetSlug: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  displayName: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default translate("TagEditor")(TagEditor);

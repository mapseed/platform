import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import styled from "react-emotion";
import { translate } from "react-i18next";

import { TextareaInput } from "../atoms/input";
import TagName from "./tag-name";

import { tagPropType, placeTagPropType } from "../../state/ducks/datasets";
import { createPlaceTag, removePlaceTag } from "../../state/ducks/places";

import mapseedApiClient from "../../client/mapseed-api-client";

const Util = require("../../js/utils.js");

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
  overflow: props.isFocused ? "visible" : "hidden",
  borderLeft: "1px solid #fff !important",
  borderRight: "none !important",
  borderTop: "none !important",
  borderBottom: "none !important",
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

  onClickCreatePlaceTag = async () => {
    const response = await mapseedApiClient.placeTags.create(
      this.props.placeUrl,
      {
        note: this.state.note,
        place: this.props.placeUrl,
        tag: this.props.tag.url,
      },
    );

    if (response) {
      this.props.createPlaceTag(this.props.placeId, response);
    } else {
      alert("Oh dear. It looks like that didn't save. Please try again.");
      Util.log("USER", "place-tags", "fail-to-create-place-tag");
    }
  };

  onClickRemovePlaceTag = async () => {
    const response = await mapseedApiClient.placeTags.delete(
      this.props.placeTag.url,
    );

    if (response) {
      this.props.removePlaceTag(this.props.placeId, this.props.placeTag.id);
    } else {
      alert("Oh dear. It looks like that didn't save. Please try again.");
      Util.log("USER", "place-tags", "fail-to-remove-place-tag");
    }
  };

  render() {
    const isSelected = !!this.props.placeTag;

    return (
      <TagContainer
        isSelected={isSelected}
        backgroundColor={this.props.backgroundColor}
        onClick={() => {
          // Toggle the placeTag.
          if (isSelected) {
            this.onClickRemovePlaceTag();
          } else {
            this.onClickCreatePlaceTag();
          }
        }}
      >
        <TagName
          displayName={this.props.tag.displayName}
          isSelected={isSelected}
        />
        {isSelected && (
          <NoteBox
            padding="0 8px 0 6px"
            fontWeight="normal"
            fontStyle="italic"
            textColor="#fff"
            fontSize="0.75rem"
            height={this.state.isFocused ? "5rem" : "0.7rem"}
            lineHeight={this.state.isFocused ? "1rem" : "0.8rem"}
            background="transparent"
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
  createPlaceTag: PropTypes.func.isRequired,
  placeId: PropTypes.number.isRequired,
  placeTag: placeTagPropType,
  placeUrl: PropTypes.string.isRequired,
  removePlaceTag: PropTypes.func.isRequired,
  tag: tagPropType,
  datasetSlug: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  createPlaceTag: (placeId, placeTagData) =>
    dispatch(createPlaceTag(placeId, placeTagData)),
  removePlaceTag: (placeId, placeTagId) =>
    dispatch(removePlaceTag(placeId, placeTagId)),
});

export default connect(
  null,
  mapDispatchToProps,
)(translate("TagEditor")(TagEditor));

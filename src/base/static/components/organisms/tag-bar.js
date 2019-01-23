import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { connect } from "react-redux";

import Tag from "../molecules/tag";
import TagEditor from "../molecules/tag-editor";

import {
  getAllTagsForDataset,
  getTagsFromChildTagId,
} from "../../state/ducks/datasets-config";

const TagBarContainer = styled("div")({
  borderBottom: "2px solid #ddd",
  marginBottom: "16px",
  paddingBottom: "8px",
});

const getColorFromTagSet = tagSet =>
  tagSet.reduce((color, tag) => {
    // Return the color from the first tag in the tagSet array with a
    // color attribute, which corresponds to the most senior tag with a
    // color attribute.
    return !color && tag.color ? tag.color : color;
  }, null);

const TagBar = props => {
  return (
    <TagBarContainer>
      {props.isEditModeToggled
        ? props.getAllTagsForDataset(props.datasetSlug).map(tag => {
            const tagSet = props.getTagsFromChildTagId(
              props.datasetSlug,
              tag.id,
            );

            return (
              <TagEditor
                key={tag.id}
                datasetSlug={props.datasetSlug}
                onClick={props.onToggleTag}
                onUpdateComment={props.onUpdateComment}
                backgroundColor={getColorFromTagSet(tagSet)}
                tagSet={tagSet}
                tag={tag}
                placeTag={props.placeTags.find(
                  placeTag => placeTag.id === tag.id,
                )}
              />
            );
          })
        : props.placeTags.map(placeTag => {
            const tagSet = props.getTagsFromChildTagId(
              props.datasetSlug,
              placeTag.id,
            );

            return (
              <Tag
                key={placeTag.id}
                datasetSlug={props.datasetSlug}
                backgroundColor={getColorFromTagSet(tagSet)}
                placeTag={placeTag}
                tagSet={tagSet}
              />
            );
          })}
    </TagBarContainer>
  );
};

TagBar.propTypes = {
  datasetSlug: PropTypes.string.isRequired,
  getAllTagsForDataset: PropTypes.func.isRequired,
  getTagsFromChildTagId: PropTypes.func.isRequired,
  isEditModeToggled: PropTypes.bool.isRequired,
  onToggleTag: PropTypes.func.isRequired,
  onUpdateComment: PropTypes.func.isRequired,
  placeTags: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      comment: PropTypes.string,
    }),
  ),
};

const mapStateToProps = state => ({
  getTagsFromChildTagId: (datasetSlug, tagId) =>
    getTagsFromChildTagId({ state, datasetSlug, tagId }),
  getAllTagsForDataset: datasetSlug => getAllTagsForDataset(state, datasetSlug),
});

export default connect(mapStateToProps)(TagBar);

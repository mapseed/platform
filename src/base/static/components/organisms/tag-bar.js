import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { connect } from "react-redux";

import Tag from "../molecules/tag";
import TagEditor from "../molecules/tag-editor";

import {
  getAllTagsForDataset,
  getAllTagNamesFromId,
  getColorForTagId,
} from "../../state/ducks/datasets-config";

const TagBarContainer = styled("div")({
  borderBottom: "2px solid #ddd",
  marginBottom: "16px",
  paddingBottom: "8px",
});

const TagBar = props => {
  return (
    <TagBarContainer>
      {props.isEditModeToggled
        ? props.getAllTagsForDataset(props.datasetSlug).map(tag => {
            return (
              <TagEditor
                key={tag.id}
                datasetSlug={props.datasetSlug}
                onClick={props.onToggleTag}
                onUpdateComment={props.onUpdateComment}
                backgroundColor={tag.color}
                tagNames={props.getAllTagNamesFromId(props.datasetSlug, tag.id)}
                tag={tag}
                placeTag={props.placeTags.find(
                  placeTag => placeTag.id === tag.id,
                )}
              />
            );
          })
        : props.placeTags.map(placeTag => {
            return (
              <Tag
                key={placeTag.id}
                datasetSlug={props.datasetSlug}
                backgroundColor={props.getColorForTagId(
                  props.datasetSlug,
                  placeTag.id,
                )}
                placeTag={placeTag}
                tagNames={props.getAllTagNamesFromId(
                  props.datasetSlug,
                  placeTag.id,
                )}
              />
            );
          })}
    </TagBarContainer>
  );
};

TagBar.propTypes = {
  datasetSlug: PropTypes.string.isRequired,
  getAllTagsForDataset: PropTypes.func.isRequired,
  getAllTagNamesFromId: PropTypes.func.isRequired,
  getColorForTagId: PropTypes.func.isRequired,
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
  getAllTagNamesFromId: (datasetSlug, tagId) =>
    getAllTagNamesFromId({ state, datasetSlug, tagId }),
  getAllTagsForDataset: datasetSlug => getAllTagsForDataset(state, datasetSlug),
  getColorForTagId: (datasetSlug, tagId) =>
    getColorForTagId({ state, datasetSlug, tagId }),
});

export default connect(mapStateToProps)(TagBar);

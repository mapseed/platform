import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { connect } from "react-redux";

import Tag from "../molecules/tag";
import TagEditor from "../molecules/tag-editor";

import {
  getAllTagsForDataset,
  getTagDisplayName,
  getColorForTag,
  getTagFromUrl,
} from "../../state/ducks/datasets";

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
                onUpdateComment={props.onUpdateComment}
                onDeletePlaceTag={props.onDeletePlaceTag}
                onCreatePlaceTag={props.onCreatePlaceTag}
                backgroundColor={tag.color}
                displayName={props.getTagDisplayName(props.datasetSlug, tag.id)}
                tag={tag}
                placeTag={props.placeTags.find(
                  placeTag => placeTag.tag === tag.url,
                )}
                placeUrl={props.placeUrl}
              />
            );
          })
        : props.placeTags.map(placeTag => {
            return (
              <Tag
                key={placeTag.id}
                datasetSlug={props.datasetSlug}
                backgroundColor={props.getColorForTag(
                  props.datasetSlug,
                  placeTag.tag,
                )}
                placeTag={placeTag}
                displayName={props.getTagDisplayName(
                  props.datasetSlug,
                  props.getTagFromUrl(props.datasetSlug, placeTag.tag).id,
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
  getTagDisplayName: PropTypes.func.isRequired,
  getColorForTag: PropTypes.func.isRequired,
  getTagFromUrl: PropTypes.func.isRequired,
  isEditModeToggled: PropTypes.bool.isRequired,
  onDeletePlaceTag: PropTypes.func.isRequired,
  onCreatePlaceTag: PropTypes.func.isRequired,
  onUpdateComment: PropTypes.func.isRequired,
  placeTags: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      comment: PropTypes.string,
    }),
  ),
  placeUrl: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  getTagDisplayName: (datasetSlug, tagId) =>
    getTagDisplayName({ state, datasetSlug, tagId }),
  getAllTagsForDataset: datasetSlug => getAllTagsForDataset(state, datasetSlug),
  getColorForTag: (datasetSlug, tagUrl) =>
    getColorForTag({ state, datasetSlug, tagUrl }),
  getTagFromUrl: (datasetSlug, tagUrl) =>
    getTagFromUrl({ state, datasetSlug, tagUrl }),
});

export default connect(mapStateToProps)(TagBar);

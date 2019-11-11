import React from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import { connect } from "react-redux";

import Tag from "../molecules/tag";
import TagEditor from "../molecules/tag-editor";

import {
  getAllTagsForDataset,
  getColorForTag,
  getTagFromUrl,
  placeTagPropType,
} from "../../state/ducks/datasets";

const TagBarContainer = styled("div")({
  borderBottom: "2px solid #ddd",
  marginBottom: "16px",
  paddingBottom: "8px",
});

const TagBar = props => {
  return props.isEditModeToggled && props.isEditable ? (
    <TagBarContainer>
      {props.getAllTagsForDataset(props.dataset).map(tag => {
        return (
          <TagEditor
            key={tag.id}
            dataset={props.dataset}
            backgroundColor={tag.color}
            tag={tag}
            placeId={props.placeId}
            placeTag={props.placeTags.find(
              placeTag => placeTag.tag === tag.url,
            )}
            placeUrl={props.placeUrl}
          />
        );
      })}
    </TagBarContainer>
  ) : (
    props.placeTags.length > 0 && (
      <TagBarContainer>
        {props.placeTags.map(placeTag => {
          return (
            <Tag
              key={placeTag.id}
              backgroundColor={props.getColorForTag(
                props.dataset,
                placeTag.tag,
              )}
              placeTag={placeTag}
              tag={props.getTagFromUrl(props.dataset, placeTag.tag)}
            />
          );
        })}
      </TagBarContainer>
    )
  );
};

TagBar.propTypes = {
  dataset: PropTypes.string.isRequired,
  getAllTagsForDataset: PropTypes.func.isRequired,
  getColorForTag: PropTypes.func.isRequired,
  getTagFromUrl: PropTypes.func.isRequired,
  isEditable: PropTypes.bool.isRequired,
  isEditModeToggled: PropTypes.bool.isRequired,
  placeId: PropTypes.number.isRequired,
  placeTags: PropTypes.arrayOf(placeTagPropType),
  placeUrl: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  getAllTagsForDataset: dataset => getAllTagsForDataset(state, dataset),
  getColorForTag: (dataset, tagUrl) =>
    getColorForTag({ state, dataset, tagUrl }),
  getTagFromUrl: (dataset, tagUrl) => getTagFromUrl({ state, dataset, tagUrl }),
});

export default connect(mapStateToProps)(TagBar);

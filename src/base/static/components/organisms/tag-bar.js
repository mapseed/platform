import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { connect } from "react-redux";

import Tag from "../molecules/tag";
import TagEditor from "../molecules/tag-editor";

import { getAllTagsForDataset } from "../../state/ducks/datasets-config";

const TagBarContainer = styled("div")({
  borderBottom: "2px solid #ddd",
  marginBottom: "16px",
  paddingBottom: "8px",
});

const TagBar = props => {
  return (
    <TagBarContainer>
      {props.isEditModeToggled
        ? props
            .getAllTagsForDataset(props.datasetSlug)
            .map(tag => (
              <TagEditor
                key={tag.id}
                datasetSlug={props.datasetSlug}
                tag={tag}
                isActive={props.placeTags.some(
                  placeTag => placeTag.id === tag.id,
                )}
              />
            ))
        : props.placeTags.map(placeTag => (
            <Tag
              key={placeTag.id}
              datasetSlug={props.datasetSlug}
              placeTag={placeTag}
              isActive={true}
            />
          ))}
    </TagBarContainer>
  );
};

TagBar.propTypes = {
  datasetSlug: PropTypes.string.isRequired,
  getAllTagsForDataset: PropTypes.func.isRequired,
  isEditModeToggled: PropTypes.bool.isRequired,
  placeTags: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      comment: PropTypes.string,
    }),
  ),
};

const mapStateToProps = state => ({
  getAllTagsForDataset: datasetSlug => getAllTagsForDataset(state, datasetSlug),
});

export default connect(mapStateToProps)(TagBar);

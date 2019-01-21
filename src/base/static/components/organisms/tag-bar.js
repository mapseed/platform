import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { connect } from "react-redux";

import Tag from "../molecules/tag";
import TagEditor from "../molecules/tag-editor";

import { getAllTags } from "../../state/ducks/datasets-config";

const TagBarContainer = styled("div")({
  borderBottom: "2px solid #ddd",
  marginBottom: "16px",
  paddingBottom: "8px",
});

const TagBar = props => {
  return (
    <TagBarContainer>
      {props.isEditModeToggled
        ? props.tags.map(placeTag => (
            <TagEditor
              key={placeTag.id}
              datasetSlug={props.datasetSlug}
              tag={placeTag}
            />
          ))
        : props
            .getAllTags(props.datasetSlug)
            .map(tag => (
              <Tag
                key={tag.id}
                datasetSlug={props.datasetSlug}
                tag={tag}
              />
            ))}
    </TagBarContainer>
  );
};

TagBar.propTypes = {
  datasetSlug: PropTypes.string.isRequired,
  getAllTags: PropTypes.func.isRequired,
  isEditModeToggled: PropTypes.bool.isRequired,
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      comment: PropTypes.string,
    }),
  ),
};

const mapStateToProps = state => ({
  getAllTags: datasetSlug => getAllTags(state, datasetSlug),
});

export default connect(mapStateToProps)(TagBar);

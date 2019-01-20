import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";

import Tag from "../molecules/tag";

const TagBarContainer = styled("div")({
  borderBottom: "2px solid #ddd",
  marginBottom: "16px",
  paddingBottom: "8px",
});

const TagBar = props => {
  return (
    <TagBarContainer>
      {props.tags.map(placeTag => {
        return (
          <Tag
            key={placeTag.id}
            datasetSlug={props.datasetSlug}
            placeTag={placeTag}
          />
        );
      })}
    </TagBarContainer>
  );
};

TagBar.propTypes = {
  datasetSlug: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      comment: PropTypes.string,
    }),
  ),
};

export default TagBar;

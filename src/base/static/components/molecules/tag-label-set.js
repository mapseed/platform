import React, { Fragment } from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { connect } from "react-redux";

import { RegularText, SmallText } from "../atoms/typography";

import { getTagsFromPlaceTag } from "../../state/ducks/datasets-config";

const PrimaryTagText = styled(RegularText)({
  whiteSpace: "nowrap",
  textTransform: "uppercase",
  color: "#fff",
  fontWeight: 800,
  marginRight: "8px",
});

const SecondaryTagText = styled(RegularText)({
  whiteSpace: "nowrap",
  color: "#fff",
  marginRight: "8px",
});

const RestTagText = styled(SmallText)({
  whiteSpace: "nowrap",
  color: "#fff",
  fontStyle: "italic",
  marginRight: "8px",
});

const tagTextStyles = [PrimaryTagText, SecondaryTagText, RestTagText];

const TagLabelSet = props => {
  return (
    <Fragment>
      {props.getTagsFromPlaceTag(props.datasetSlug, props.tag).map((tag, i) => {
        i = i < tagTextStyles.length - 1 ? i : tagTextStyles.length - 1;
        const TagText = tagTextStyles[i];

        return <TagText key={tag.id}>{tag.name}</TagText>;
      })}
    </Fragment>
  );
};

TagLabelSet.propTypes = {
  datasetSlug: PropTypes.string.isRequired,
  getTagsFromPlaceTag: PropTypes.func.isRequired,
  tag: PropTypes.shape({
    id: PropTypes.number.isRequired,
    comment: PropTypes.string,
  }),
};

const mapStateToProps = state => ({
  getTagsFromPlaceTag: (datasetSlug, placeTag) =>
    getTagsFromPlaceTag(state, datasetSlug, placeTag),
});

export default connect(mapStateToProps)(TagLabelSet);

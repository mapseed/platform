import React, { Fragment } from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { connect } from "react-redux";

import { RegularText, SmallText } from "../atoms/typography";

import { getTagsFromChildTag } from "../../state/ducks/datasets-config";

const PrimaryTagText = styled(RegularText)(props => ({
  whiteSpace: "nowrap",
  textTransform: "uppercase",
  color: props.isActive ? "#fff" : "#ccc",
  fontWeight: 800,
  marginRight: "8px",
}));

const SecondaryTagText = styled(RegularText)(props => ({
  whiteSpace: "nowrap",
  color: props.isActive ? "#fff" : "#ccc",
  marginRight: "8px",
}));

const RestTagText = styled(SmallText)(props => ({
  whiteSpace: "nowrap",
  color: props.isActive ? "#fff" : "#ccc",
  fontStyle: "italic",
  marginRight: "8px",
}));

const tagTextStyles = [PrimaryTagText, SecondaryTagText, RestTagText];

const TagLabelSet = props => {
  return (
    <Fragment>
      {props.getTagsFromChildTag(props.datasetSlug, props.tag).map((tag, i) => {
        i = i < tagTextStyles.length - 1 ? i : tagTextStyles.length - 1;
        const TagText = tagTextStyles[i];

        return (
          <TagText isActive={props.isActive} key={tag.id}>
            {tag.name}
          </TagText>
        );
      })}
    </Fragment>
  );
};

TagLabelSet.propTypes = {
  datasetSlug: PropTypes.string.isRequired,
  getTagsFromChildTag: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  tag: PropTypes.shape({
    id: PropTypes.number.isRequired,
    comment: PropTypes.string,
  }),
};

const mapStateToProps = state => ({
  getTagsFromChildTag: (datasetSlug, placeTag) =>
    getTagsFromChildTag(state, datasetSlug, placeTag),
});

export default connect(mapStateToProps)(TagLabelSet);

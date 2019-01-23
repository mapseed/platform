import React, { Fragment } from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";

import { RegularText, SmallText } from "../atoms/typography";

const PrimaryTagText = styled(RegularText)(props => ({
  whiteSpace: "nowrap",
  textTransform: "uppercase",
  color: props.isActive ? "#fff" : "#ccc",
  fontWeight: 800,
  marginRight: "8px",
}));

const SecondaryTagText = styled(RegularText)(props => ({
  whiteSpace: "nowrap",
  color: props.isTagged ? "#fff" : "#ccc",
  marginRight: "8px",
}));

const RestTagText = styled(SmallText)(props => ({
  whiteSpace: "nowrap",
  color: props.isEnabled ? "#fff" : "#ccc",
  fontStyle: "italic",
  marginRight: "8px",
}));

const tagTextStyles = [PrimaryTagText, SecondaryTagText, RestTagText];

const TagLabelSet = props => {
  return (
    <Fragment>
      {props.tagSet.map((tag, i) => {
        i = i < tagTextStyles.length - 1 ? i : tagTextStyles.length - 1;
        const TagText = tagTextStyles[i];

        return (
          <TagText isActive={props.isTagged} key={tag.id}>
            {tag.name}
          </TagText>
        );
      })}
    </Fragment>
  );
};

TagLabelSet.propTypes = {
  isTagged: PropTypes.bool.isRequired,
  tagSet: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      isActive: PropTypes.bool.isRequired,
      color: PropTypes.string,
      comment: PropTypes.string,
    }),
  ),
};

export default TagLabelSet;

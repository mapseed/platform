import React, { Fragment } from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";

import { RegularText, SmallText } from "../atoms/typography";

const PrimaryTagText = styled(RegularText)(props => ({
  whiteSpace: "nowrap",
  textTransform: "uppercase",
  color: props.isTagged ? "#fff" : "#ccc",
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
  color: props.isTagged ? "#fff" : "#ccc",
  fontStyle: "italic",
  marginRight: "8px",
}));

const tagTextStyles = [PrimaryTagText, SecondaryTagText, RestTagText];

const TagNameSet = props => {
  return (
    <Fragment>
      {props.tagNames.map((tagName, i) => {
        i = i < tagTextStyles.length - 1 ? i : tagTextStyles.length - 1;
        const TagText = tagTextStyles[i];

        return (
          <TagText isTagged={props.isTagged} key={i}>
            {tagName}
          </TagText>
        );
      })}
    </Fragment>
  );
};

TagNameSet.propTypes = {
  isTagged: PropTypes.bool.isRequired,
  tagNames: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default TagNameSet;

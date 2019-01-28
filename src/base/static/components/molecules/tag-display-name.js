import React, { Fragment } from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";

import { RegularText } from "../atoms/typography";

const PrimaryTagText = styled(RegularText)(props => ({
  whiteSpace: "nowrap",
  textTransform: "uppercase",
  color: props.isTagged ? "#fff" : "#ccc",
  fontWeight: 800,
  marginRight: "8px",
}));

const RestTagText = styled(RegularText)(props => ({
  whiteSpace: "nowrap",
  color: props.isTagged ? "#fff" : "#ccc",
  marginRight: "8px",
}));

const tagTextStyles = [PrimaryTagText, RestTagText];

const TagDisplayName = props => {
  return (
    <Fragment>
      {props.displayName.map((tagName, i) => {
        i = i < tagTextStyles.length - 1 ? i : tagTextStyles.length - 1;
        const TagText = tagTextStyles[i];

        return (
          <TagText isTagged={props.isTagged} key={tagName}>
            {tagName}
          </TagText>
        );
      })}
    </Fragment>
  );
};

TagDisplayName.propTypes = {
  isTagged: PropTypes.bool.isRequired,
  displayName: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default TagDisplayName;

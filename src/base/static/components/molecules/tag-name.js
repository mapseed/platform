import React, { Fragment } from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";

import { RegularText } from "../atoms/typography";

const PrimaryTagText = styled(RegularText)(props => ({
  whiteSpace: "nowrap",
  textTransform: "uppercase",
  color: props.isSelected ? "#fff" : "#ccc",
  fontWeight: 800,
  marginRight: "8px",
}));

const RestTagText = styled(RegularText)(props => ({
  whiteSpace: "nowrap",
  color: props.isSelected ? "#fff" : "#ccc",
  marginRight: "8px",
}));

const tagTextStyles = [PrimaryTagText, RestTagText];

const TagName = props => (
  <Fragment>
    {props.displayName.map((tagName, i) => {
      i = i < tagTextStyles.length - 1 ? i : tagTextStyles.length - 1;
      const TagText = tagTextStyles[i];

      return (
        <TagText isSelected={props.isSelected} key={tagName}>
          {tagName}
        </TagText>
      );
    })}
  </Fragment>
);

TagName.propTypes = {
  isSelected: PropTypes.bool.isRequired,
  displayName: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default TagName;

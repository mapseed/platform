import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";

import { HorizontalRule } from "../../atoms/layout";
import { SmallTitle, RegularText } from "../../atoms/typography";

const TextAreaWrapper = styled("div")({
  marginTop: "16px",
});

const TextArea = props => {
  return (
    <TextAreaWrapper>
      <SmallTitle>{props.title}</SmallTitle>
      <HorizontalRule spacing="tiny" color="light" />
      <RegularText>{props.description}</RegularText>
    </TextAreaWrapper>
  );
};

TextArea.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
};

export default TextArea;

import React from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";

import { HorizontalRule } from "../../atoms/layout";
import { SmallTitle, RegularText } from "../../atoms/typography";

const TextAreaWrapper = styled("div")({
  marginTop: "16px",
});

const Title = styled(SmallTitle)({
  marginTop: "32px",
  marginBottom: "8px",
});

const TextArea = props => {
  return (
    <TextAreaWrapper>
      <Title>{props.title}</Title>
      <HorizontalRule spacing="small" color="light" />
      <RegularText>{props.description}</RegularText>
    </TextAreaWrapper>
  );
};

TextArea.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
};

export default TextArea;

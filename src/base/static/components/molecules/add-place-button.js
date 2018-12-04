import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";

import { Button } from "../atoms/buttons";

const AddPlaceButton = styled(props => (
  <Button
    size="extra-large"
    variant="raised"
    color="primary"
    className={props.className}
  >
    {props.children}
  </Button>
))(props => {
  console.log("props.theme.map", props.theme.map);
  return {
    position: "absolute",
    top: "20px",
    left: "80px",
    zIndex: 10,
    backgroundColor: props.theme.map.inputButtonBackgroundColor,

    "&:hover": {
      backgroundColor: props.theme.map.inputButtonHoverBackgroundColor,
    },
  };
});

AddPlaceButton.propTypes = {
  children: PropTypes.node,
};

export default AddPlaceButton;

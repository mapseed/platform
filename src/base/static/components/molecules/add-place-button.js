import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";

import { Button } from "../atoms/buttons";
import mq from "../../../../media-queries";

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
  return {
    zIndex: 10,
    backgroundColor: props.theme.map.inputButtonBackgroundColor,

    "&:hover": {
      backgroundColor: props.theme.map.inputButtonHoverBackgroundColor,
    },

    [mq[0]]: {
      position: "fixed",
      width: "100%",
      bottom: 0,
      borderRadius: 0,
    },
    [mq[1]]: {
      position: "absolute",
      top: "20px",
      left: "80px",
    },
  };
});

AddPlaceButton.propTypes = {
  children: PropTypes.node,
};

export default AddPlaceButton;

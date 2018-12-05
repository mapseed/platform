import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { connect } from "react-redux";

import { Button } from "../atoms/buttons";
import mq from "../../../../media-queries";

import { addPlaceButtonVisibilitySelector } from "../../state/ducks/ui";

const AddPlaceButton = styled(
  props =>
    props.isAddPlaceButtonVisible && (
      <Button
        size="extra-large"
        variant="raised"
        color="primary"
        className={props.className}
        onClick={props.onClick}
      >
        {props.children}
      </Button>
    ),
)(props => {
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
  isAddPlaceButtonVisible: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  isAddPlaceButtonVisible: addPlaceButtonVisibilitySelector(state),
});

export default connect(mapStateToProps)(AddPlaceButton);

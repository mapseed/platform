import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { connect } from "react-redux";

import { Button } from "../atoms/buttons";
import mq from "../../../../media-queries";

import { geocodeAddressBarVisibilitySelector } from "../../state/ducks/ui";

const AddPlaceButtonContainer = styled(props => (
  <Button
    size="extra-large"
    variant="raised"
    color="primary"
    className={props.className}
    onClick={props.onClick}
  >
    {props.children}
  </Button>
))(props => {
  return {
    zIndex: 10,
    backgroundColor: props.theme.map.addPlaceButtonBackgroundColor,

    "&:hover": {
      backgroundColor: props.theme.map.addPlaceButtonHoverBackgroundColor,
    },

    [mq[0]]: {
      width: "100%",
      borderRadius: 0,
    },
    [mq[1]]: {
      position: "absolute",
      top: props.isGeocodeAddressBarVisible ? "92px" : "20px",
      left: "80px",
    },
  };
});

const AddPlaceButton = props => (
  <AddPlaceButtonContainer
    className={props.className}
    onClick={props.onClick}
    isGeocodeAddressBarVisible={props.isGeocodeAddressBarVisible}
  >
    {props.children}
  </AddPlaceButtonContainer>
);

AddPlaceButton.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  isGeocodeAddressBarVisible: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isGeocodeAddressBarVisible: geocodeAddressBarVisibilitySelector(state),
});

export default connect(mapStateToProps)(AddPlaceButton);

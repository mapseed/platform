import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { connect } from "react-redux";

import { Button } from "../atoms/buttons";
import mq from "../../../../media-queries";

import { geocodeAddressBarEnabledSelector } from "../../state/ducks/map-config";

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
    zIndex: 1,
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
      top: props.isGeocodeAddressBarEnabled ? "92px" : "20px",
      left: "80px",
    },
  };
});

const AddPlaceButton = props => (
  <AddPlaceButtonContainer
    className={props.className}
    onClick={props.onClick}
    isGeocodeAddressBarEnabled={props.isGeocodeAddressBarEnabled}
  >
    {props.children}
  </AddPlaceButtonContainer>
);

AddPlaceButton.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  isGeocodeAddressBarEnabled: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isGeocodeAddressBarEnabled: geocodeAddressBarEnabledSelector(state),
});

export default connect(mapStateToProps)(AddPlaceButton);

import React from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import { connect } from "react-redux";

import { Button } from "../atoms/buttons";
import mq from "../../../../media-queries";
import constants from "../../constants";

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
    position: props.layout == "desktop" ? "absolute" : "fixed",
    zIndex: 14,
    backgroundColor: props.theme.map.addPlaceButtonBackgroundColor,
    fontFamily: props.theme.text.bodyFontFamily,

    "&:hover": {
      backgroundColor: props.theme.map.addPlaceButtonHoverBackgroundColor,
    },

    [mq[0]]: {
      width: "100%",
      borderRadius: 0,
      bottom: 0,
      left: 0,
    },
    [mq[1]]: {
      top: props.isGeocodeAddressBarEnabled
        ? `${constants.HEADER_HEIGHT + 62}px`
        : `${constants.HEADER_HEIGHT + 20}px`,
      left: "60px",
    },
  };
});

const AddPlaceButton = props => (
  <AddPlaceButtonContainer
    className={props.className}
    layout={props.layout}
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
  layout: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isGeocodeAddressBarEnabled: geocodeAddressBarEnabledSelector(state),
});

export default connect(mapStateToProps)(AddPlaceButton);

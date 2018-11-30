import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";

import { Button } from "../../atoms/buttons";
import { FontAwesomeIcon } from "../../atoms/imagery";

import emitter from "../../../utils/emitter";
import constants from "../../../constants";

const GeolocateButton = styled(Button)(props => ({
  display: "flex",
  alignItems: "center",
}));

const GeolocatePlaceholder = styled("span")({
  paddingLeft: "8px",
  textTransform: "none",
  textAlign: "left",
  color: "#999",
});

const GeolocateField = props => {
  return (
    <GeolocateButton
      onClick={() => emitter.emit(constants.TRIGGER_GEOLOCATE_EVENT)}
    >
      <FontAwesomeIcon content="\f05b" fontSize="1.5rem" />
      <GeolocatePlaceholder>{props.placeholder}</GeolocatePlaceholder>
    </GeolocateButton>
  );
};

GeolocateField.propTypes = {
  placeholder: PropTypes.string,
};

export default GeolocateField;

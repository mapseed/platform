import React from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";

import { Button } from "../../atoms/buttons";
import { FontAwesomeIcon } from "../../atoms/imagery";

import emitter from "../../../utils/emitter";
import constants from "../../../constants";

const GeolocateButton = styled(props => (
  <Button
    color={props.color}
    className={props.className}
    onClick={props.onClick}
  >
    {props.children}
  </Button>
))(props => ({
  display: "flex",
  alignItems: "center",
}));

const GeolocatePlaceholder = styled("span")({
  paddingLeft: "8px",
  textTransform: "none",
  textAlign: "left",
  color: "#444",
});

const GeolocateField = props => {
  return (
    <GeolocateButton
      color="tertiary"
      onClick={() => emitter.emit(constants.TRIGGER_GEOLOCATE_EVENT)}
    >
      <FontAwesomeIcon faClassname="fa fa-crosshairs" fontSize="1.5rem" />
      <GeolocatePlaceholder>{props.placeholder}</GeolocatePlaceholder>
    </GeolocateButton>
  );
};

GeolocateField.propTypes = {
  placeholder: PropTypes.string,
};

export default GeolocateField;

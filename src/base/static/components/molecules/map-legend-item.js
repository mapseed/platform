import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";

import { Icon } from "../atoms/feedback";
import { RegularLabel } from "../atoms/typography";

import "./map-legend-item.scss";

const ColorSwatch = styled("span")(props => ({
  backgroundColor: props.color,
  width: 20,
  height: 20,
  marginRight: 10,
}));

// TODO: Abstract these components out when we refactor other panel types.
const IconContainer = styled("div")(props => ({
  display: "flex",
  justifyContent: "center",
  flex: 1,
}));

const MapLegendItemContainer = styled("div")(props => ({
  display: "flex",
  alignItems: "center",
  marginBottom: 5,
  paddingLeft: 15,
}));

const MapLegendItem = props => {
  return (
    <MapLegendItemContainer>
      {props.icon && (
        <IconContainer>
          <Icon icon={props.icon} classes="map-legend-item__icon" />
        </IconContainer>
      )}
      {props.swatch && <ColorSwatch color={props.swatch} />}
      <RegularLabel
        styles={{
          flex: 4,
        }}
      >
        {props.label}
      </RegularLabel>
    </MapLegendItemContainer>
  );
};

ColorSwatch.propTypes = {
  color: PropTypes.string.isRequired,
};

MapLegendItem.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string.isRequired,
  swatch: PropTypes.string,
};

export default MapLegendItem;

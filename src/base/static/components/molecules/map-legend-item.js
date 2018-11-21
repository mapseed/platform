import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";

import { LegacyIcon } from "../atoms/feedback";
import { RegularLabel } from "../atoms/typography";

const ColorSwatch = styled("span")(props => ({
  backgroundColor: props.color,
  width: "30px",
  height: "30px",
  marginRight: "10px",
}));

// TODO: Abstract these components out when we refactor other panel types.
const LegendIcon = styled(props => (
  <LegacyIcon icon={props.icon} classes={props.className} />
))(() => ({
  width: "30px",
  marginRight: "10px",
}));

const MapLegendItemContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  marginBottom: "5px",
  paddingLeft: "15px",
});

const MapLegendItem = props => {
  return (
    <MapLegendItemContainer>
      {props.icon && <LegendIcon icon={props.icon} />}
      {props.swatch && <ColorSwatch color={props.swatch} />}
      <RegularLabel>{props.label}</RegularLabel>
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

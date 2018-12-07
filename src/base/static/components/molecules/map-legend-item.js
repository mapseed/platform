import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";

import { LegacyIcon } from "../atoms/feedback";
import { RegularLabel } from "../atoms/typography";

// TODO: Abstract these components out when we refactor other panel types.
const LegendIcon = styled(props => (
  <LegacyIcon icon={props.icon} classes={props.className} />
))(() => ({
  flex: "0 0 30px",
  width: "30px",
  height: "auto",
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
      <LegendIcon icon={props.icon} />
      <RegularLabel>{props.label}</RegularLabel>
    </MapLegendItemContainer>
  );
};

MapLegendItem.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string.isRequired,
  swatch: PropTypes.string,
};

export default MapLegendItem;

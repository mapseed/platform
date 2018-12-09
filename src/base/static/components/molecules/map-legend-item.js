import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";

import { Image } from "../atoms/imagery";
import { RegularLabel } from "../atoms/typography";

const LegendIcon = styled(Image)({
  flex: "0 0 30px",
  width: "30px",
  height: "auto",
  marginRight: "10px",
});

const MapLegendItemContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  marginBottom: "5px",
  paddingLeft: "15px",
});

const MapLegendItem = props => {
  return (
    <MapLegendItemContainer>
      <LegendIcon src={props.icon} />
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

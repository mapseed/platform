import React from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import { connect } from "react-redux";

import MapLegendItem from "../molecules/map-legend-item";
import {
  placeFormsConfigPropType,
  placeFormsConfigSelector,
} from "../../state/ducks/forms-config";

const MapLegendPanelContainer = styled("div")(props => ({
  padding: 10,
  backgroundColor: props.isThemed ? props.theme.brand.secondary : "#fff",
  margin: 0,
}));

const MapLegendPanel = props => {
  return (
    <MapLegendPanelContainer isThemed={props.isThemed}>
      {props.placeFormsConfig.map(placeForm => (
        <MapLegendItem
          key={placeForm.id}
          icon={placeForm.icon}
          label={placeForm.label}
        />
      ))}
    </MapLegendPanelContainer>
  );
};

MapLegendPanel.propTypes = {
  placeFormsConfig: placeFormsConfigPropType.isRequired,
  isThemed: PropTypes.bool,
};

const mapStateToProps = state => ({
  placeFormsConfig: placeFormsConfigSelector(state),
});

export default connect(mapStateToProps)(MapLegendPanel);

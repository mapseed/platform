import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { connect } from "react-redux";

import MapLegendItem from "../molecules/map-legend-item";
import {
  surveyFormsConfigPropType,
  surveyFormsConfigSelector,
} from "../../state/ducks/survey-config";

const MapLegendPanelContainer = styled("div")(props => ({
  padding: 10,
  backgroundColor: props.isThemed ? props.theme.brand.secondary : "#fff",
  margin: 0,
}));

const MapLegendPanel = props => {
  return (
    <MapLegendPanelContainer isThemed={props.isThemed}>
      {props.surveyFormsConfig.map(surveyForm => (
        <MapLegendItem
          key={surveyForm.id}
          icon={surveyForm.icon}
          label={surveyForm.label}
        />
      ))}
    </MapLegendPanelContainer>
  );
};

MapLegendPanel.propTypes = {
  surveyFormsConfig: surveyFormsConfigPropType.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  isThemed: PropTypes.bool,
};

const mapStateToProps = state => ({
  surveyFormsConfig: surveyFormsConfigSelector(state),
});

export default connect(mapStateToProps)(MapLegendPanel);

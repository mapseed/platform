import * as React from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import { connect } from "react-redux";
import { darken } from "@material-ui/core/styles/colorManipulator";
import { withTheme } from "emotion-theming";
import { themePropType } from "../../state/ducks/app-config";
import { translate } from "react-i18next";

import {
  placeFormsConfigPropType,
  placeFormsConfigSelector,
} from "../../state/ducks/forms-config";

import { Image } from "../atoms/imagery";
import { RegularLabel } from "../atoms/typography";

const MapLegendPanelContainer = styled("div")(props => ({
  padding: 10,
  backgroundColor: props.backgroundColor,
  margin: 0,
}));

const MapLegendItemContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  marginBottom: "5px",
  paddingLeft: "15px",
});

const LegendLabel = styled(RegularLabel)(props => ({
  color: props.color,
}));

const LegendIcon = styled(Image)({
  flex: "0 0 30px",
  width: "30px",
  height: "auto",
  marginRight: "10px",
});

const MapLegendPanel = props => {
  const backgroundColor = props.isThemed ? props.theme.brand.secondary : "#fff";
  const labelColor = darken(backgroundColor, 0.8);
  return (
    <MapLegendPanelContainer backgroundColor={backgroundColor}>
      {props.placeFormsConfig.map((placeForm, i) => (
        <MapLegendItemContainer key={placeForm.id}>
          <LegendIcon src={placeForm.icon} />
          <LegendLabel color={labelColor}>
            {props.t(`mapLegendLabel${i}`, placeForm.label)}
          </LegendLabel>
        </MapLegendItemContainer>
      ))}
    </MapLegendPanelContainer>
  );
};

MapLegendPanel.propTypes = {
  placeFormsConfig: placeFormsConfigPropType.isRequired,
  isThemed: PropTypes.bool,
  t: PropTypes.func.isRequired,
  theme: themePropType,
};

const mapStateToProps = state => ({
  placeFormsConfig: placeFormsConfigSelector(state),
});

export default withTheme(
  connect(mapStateToProps)(translate("MapLegendPanel")(MapLegendPanel)),
);

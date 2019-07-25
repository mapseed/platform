import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";

import GeocodingField from "../molecules/form-field-types/geocoding-field";

import { uiVisibilitySelector, layoutSelector } from "../../state/ducks/ui";

import { getMainContentAreaWidth } from "../../utils/layout-utils";
import { Mixpanel } from "../../utils/mixpanel";

const GeocodeAddressBarWrapper = styled(props => (
  <form onSubmit={props.onSubmit} className={props.className}>
    {props.children}
  </form>
))(props => ({
  display: "block",
  position: "relative",
  height: "42px",
  backgroundColor: props.theme.brand.secondary,
  boxShadow: "0 2px 0 rgba(0,0,0,0.2)",
  boxSizing: "border-box",
  zIndex: 9,
  width: getMainContentAreaWidth({
    isContentPanelVisible: props.isContentPanelVisible,
    isRightSidebarVisible: props.isRightSidebarVisible,
    layout: props.layout,
  }),
}));

class GeocodeAddressBar extends Component {
  state = {
    address: "",
    isTriggeringGeocode: false,
  };

  onChange = (fieldName, fieldValue) => {
    this.setState({
      address: fieldValue,
      isTriggeringGeocode: false,
    });
  };

  onKeyDown = evt => {
    if (evt.key === "Tab") {
      // Prevent the default field-switching behavior of a Tab press here
      // because it screws up the UI.
      evt.preventDefault();
      this.setState({
        isTriggeringGeocode: true,
      });
    }
  };

  onSubmit = evt => {
    evt.preventDefault();
    this.setState({
      isTriggeringGeocode: true,
    });
    Mixpanel.track("Searching address", { address: this.state.address });
  };

  render() {
    return (
      <GeocodeAddressBarWrapper
        onSubmit={this.onSubmit}
        isContentPanelVisible={this.props.isContentPanelVisible}
        isRightSidebarVisible={this.props.isRightSidebarVisible}
        layout={this.props.layout}
      >
        <GeocodingField
          onKeyDown={this.onKeyDown}
          onChange={this.onChange}
          name="geocode-address-bar"
          placeholder={this.props.t(
            "geocodeAddressBarPlaceholderMsg",
            "Enter an address...",
          )}
          isTriggeringGeocode={this.state.isTriggeringGeocode}
          value={this.state.address}
          reverseGeocode={false}
        />
      </GeocodeAddressBarWrapper>
    );
  }
}

GeocodeAddressBar.propTypes = {
  isContentPanelVisible: PropTypes.bool.isRequired,
  isRightSidebarVisible: PropTypes.bool.isRequired,
  layout: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isContentPanelVisible: uiVisibilitySelector("contentPanel", state),
  isRightSidebarVisible: uiVisibilitySelector("rightSidebar", state),
  layout: layoutSelector(state),
});

export default connect(mapStateToProps)(
  withTranslation("GeocodeAddressBar")(GeocodeAddressBar),
);

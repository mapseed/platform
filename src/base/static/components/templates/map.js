import React, { Component, createRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import styled from "react-emotion";

import MainMap from "../organisms/main-map";
import ContentPanel from "../organisms/content-panel";
import AddPlaceButton from "../molecules/add-place-button";
import MapCenterpoint from "../molecules/map-centerpoint";
import LeftSidebar from "../organisms/left-sidebar";
import RightSidebar from "../organisms/right-sidebar";
import GeocodeAddressBar from "../organisms/geocode-address-bar";

import {
  addPlaceButtonVisibilitySelector,
  layoutSelector,
  uiVisibilitySelector,
} from "../../state/ducks/ui";
import {
  hasAnonAbilitiesInAnyDataset,
  datasetSlugsSelector,
} from "../../state/ducks/datasets-config";
import {
  placeConfigPropType,
  placeConfigSelector,
} from "../../state/ducks/place-config";
import { hasGroupAbilitiesInDatasets } from "../../state/ducks/user";
import { isLeftSidebarExpandedSelector } from "../../state/ducks/left-sidebar";
import { isRightSidebarEnabledSelector } from "../../state/ducks/right-sidebar-config";
import {
  geocodeAddressBarEnabledSelector,
  mapConfigSelector,
  mapConfigPropType,
} from "../../state/ducks/map-config";

import {
  getMainContentAreaWidth,
  getMainContentAreaHeight,
} from "../../utils/layout-utils";

const MapContainer = styled("div")(props => ({
  position: "relative",
  height: getMainContentAreaHeight({
    isContentPanelVisible: props.isContentPanelVisible,
    isGeocodeAddressBarEnabled: props.isGeocodeAddressBarEnabled,
    layout: props.layout,
  }),
  width: getMainContentAreaWidth({
    isContentPanelVisible: props.isContentPanelVisible,
    isRightSidebarVisible: props.isRightSidebarVisible,
    layout: props.layout,
  }),
}));

const SpotlightMask = styled("div")({
  pointerEvents: "none",
  position: "absolute",
  left: "calc(50% - 100px)",
  top: "calc(50% - 100px)",
  width: "200px",
  height: "200px",
  borderRadius: "50%",
  boxShadow:
    "0px 0px 0px 800px rgba(0, 0, 0, 0.4), inset 0px 0px 20px 30px rgba(0, 0, 0, 0.4)",
  zIndex: 8,
});

class MapTemplate extends Component {
  mapContainerRef = createRef();

  render() {
    return (
      <>
        {this.props.isGeocodeAddressBarEnabled && (
          <GeocodeAddressBar mapConfig={this.props.mapConfig} />
        )}
        <MapContainer
          ref={this.mapContainerRef}
          isContentPanelVisible={this.props.isContentPanelVisible}
          isRightSidebarVisible={this.props.isRightSidebarVisible}
          isGeocodeAddressBarEnabled={this.props.isGeocodeAddressBarEnabled}
          layout={this.props.layout}
        >
          {this.props.isLeftSidebarExpanded && <LeftSidebar />}
          {this.props.isAddPlaceButtonVisible &&
            this.props.hasAddPlacePermission && (
              <AddPlaceButton
                onClick={() => {
                  this.props.router.navigate("/new", {
                    trigger: true,
                  });
                }}
              >
                {this.props.placeConfig.add_button_label}
              </AddPlaceButton>
            )}
          <MainMap
            mapContainerRef={this.mapContainerRef}
            router={this.props.router}
          />
          {this.props.isMapCenterpointVisible && <MapCenterpoint />}
          {this.props.isSpotlightMaskVisible && <SpotlightMask />}
        </MapContainer>
        {this.props.isContentPanelVisible && (
          <ContentPanel
            router={this.props.router}
            languageCode={this.props.languageCode}
            mapContainerRef={this.mapContainerRef}
          />
        )}
        {this.props.layout === "desktop" &&
          this.props.isRightSidebarEnabled && (
            <RightSidebar router={this.props.router} />
          )}
      </>
    );
  }
}

MapTemplate.propTypes = {
  hasAddPlacePermission: PropTypes.bool.isRequired,
  isAddPlaceButtonVisible: PropTypes.bool.isRequired,
  isContentPanelVisible: PropTypes.bool.isRequired,
  isGeocodeAddressBarEnabled: PropTypes.bool.isRequired,
  isLeftSidebarExpanded: PropTypes.bool.isRequired,
  isMapCenterpointVisible: PropTypes.bool.isRequired,
  isRightSidebarEnabled: PropTypes.bool.isRequired,
  isRightSidebarVisible: PropTypes.bool.isRequired,
  isSpotlightMaskVisible: PropTypes.bool.isRequired,
  languageCode: PropTypes.string.isRequired,
  layout: PropTypes.string.isRequired,
  mapConfig: mapConfigPropType.isRequired,
  placeConfig: placeConfigPropType.isRequired,
  router: PropTypes.instanceOf(Backbone.Router),
};

const mapStateToProps = state => ({
  hasAddPlacePermission:
    hasAnonAbilitiesInAnyDataset({
      state: state,
      submissionSet: "places",
      abilities: ["create"],
    }) ||
    hasGroupAbilitiesInDatasets({
      state: state,
      submissionSet: "places",
      abilities: ["create"],
      datasetSlugs: datasetSlugsSelector(state),
    }),
  isAddPlaceButtonVisible: addPlaceButtonVisibilitySelector(state),
  isContentPanelVisible: uiVisibilitySelector("contentPanel", state),
  isGeocodeAddressBarEnabled: geocodeAddressBarEnabledSelector(state),
  isLeftSidebarExpanded: isLeftSidebarExpandedSelector(state),
  isMapCenterpointVisible: uiVisibilitySelector("mapCenterpoint", state),
  isRightSidebarEnabled: isRightSidebarEnabledSelector(state),
  isRightSidebarVisible: uiVisibilitySelector("rightSidebar", state),
  isSpotlightMaskVisible: uiVisibilitySelector("spotlightMask", state),
  layout: layoutSelector(state),
  mapConfig: mapConfigSelector(state),
  placeConfig: placeConfigSelector(state),
});

export default connect(mapStateToProps)(MapTemplate);

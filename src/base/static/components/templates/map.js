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

import { layoutSelector, uiVisibilitySelector } from "../../state/ducks/ui";
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
  overflow: "hidden",
  width: props.width,
  height: props.height,
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
  addPlaceButtonRef = createRef();

  state = {
    // NOTE: These dimension "declarations" will be CSS strings, as set by the
    // utility methods getMainContentAreaHeight() and
    // getMainContentAreaWidth().
    mapContainerHeightDeclaration: "",
    mapContainerWidthDeclaration: "",
  };

  componentDidMount() {
    this.recaculateContainerSize();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.layout !== prevProps.layout ||
      this.props.isContentPanelVisible !== prevProps.isContentPanelVisible ||
      this.props.isRightSidebarVisible !== prevProps.isRightSidebarVisible
    ) {
      this.recaculateContainerSize();
    }
  }

  recaculateContainerSize() {
    this.setState({
      mapContainerHeightDeclaration: getMainContentAreaHeight({
        isContentPanelVisible: this.props.isContentPanelVisible,
        isGeocodeAddressBarEnabled: this.props.isGeocodeAddressBarEnabled,
        layout: this.props.layout,
        isAddPlaceButtonVisible:
          this.props.isAddPlaceButtonVisible && this.hasAddPlacePermission,
        addPlaceButtonRef: this.addPlaceButtonRef,
      }),
      mapContainerWidthDeclaration: getMainContentAreaWidth({
        isContentPanelVisible: this.props.isContentPanelVisible,
        isRightSidebarVisible: this.props.isRightSidebarVisible,
        layout: this.props.layout,
      }),
    });
  }

  render() {
    return (
      <>
        {this.props.isGeocodeAddressBarEnabled && (
          <GeocodeAddressBar mapConfig={this.props.mapConfig} />
        )}
        <MapContainer
          ref={this.mapContainerRef}
          width={this.state.mapContainerWidthDeclaration}
          height={this.state.mapContainerHeightDeclaration}
        >
          {this.props.isLeftSidebarExpanded && <LeftSidebar />}
          <MainMap
            mapContainerRef={this.mapContainerRef}
            mapContainerWidthDeclaration={
              this.state.mapContainerWidthDeclaration
            }
            mapContainerHeightDeclaration={
              this.state.mapContainerHeightDeclaration
            }
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
        {this.props.isAddPlaceButtonVisible &&
          this.props.hasAddPlacePermission && (
            <AddPlaceButton
              ref={this.addPlaceButtonRef}
              onClick={() => {
                this.props.router.navigate("/new", {
                  trigger: true,
                });
              }}
            >
              {this.props.placeConfig.add_button_label}
            </AddPlaceButton>
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
  isAddPlaceButtonVisible: uiVisibilitySelector("addPlaceButton", state),
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

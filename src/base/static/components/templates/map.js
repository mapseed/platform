import React, { Component, createRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import styled from "@emotion/styled";

import MainMap from "../organisms/main-map";
import ContentPanel from "../organisms/content-panel";
import AddPlaceButton from "../molecules/add-place-button";
import MapCenterpoint from "../molecules/map-centerpoint";
import LeftSidebar from "../organisms/left-sidebar";
import RightSidebar from "../organisms/right-sidebar";
import GeocodeAddressBar from "../organisms/geocode-address-bar";

import {
  layoutSelector,
  uiVisibilitySelector,
  updateUIVisibility,
  updateActivePage,
  updateContentPanelComponent,
  updateEditModeToggled,
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
import { updateMapViewport } from "../../state/ducks/map";
import { updateFocusedPlaceId } from "../../state/ducks/places";

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
    console.log("MAP TEMPLATED MOUNTED", this.props);
    this.recaculateContainerSize();
    this.updateUIConfiguration(this.props.uiConfiguration);
    //   // URL parameters passed through by the router.
    //   const { params } = this.props.match;

    //   params.zoom &&
    //     params.lat &&
    //     params.lng &&
    //     this.props.updateMapViewport({
    //       zoom: params.zoom,
    //       lat: params.lat,
    //       lng: params.lng,
    //     });

    //   this.props.updateUIVisibility(
    //     "contentPanel",
    //     !!(params.pageSlug || params.datasetClientSlug),
    //   );

    //   this.props.updateUIVisibility(
    //     "mapCenterpoint",
    //     this.props.location.pathname === "/new",
    //   );
    //   this.props.updateUIVisibility("spotlightMask", (params.datasetClientSlug));
    //   this.props.updateUIVisibility("addPlaceButton", true);
    //   this.props.focusedPlaceId &&
    //     this.props.updateFocusedPlaceId(this.props.focusedPlaceId);
    //   this.props.contentPanelComponent &&
    //     this.props.updateContentPanelComponent(this.props.contentPanelComponent);
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.layout !== prevProps.layout ||
      this.props.isContentPanelVisible !== prevProps.isContentPanelVisible ||
      this.props.isRightSidebarVisible !== prevProps.isRightSidebarVisible
    ) {
      this.recaculateContainerSize();
    }

    if (this.props.params.placeId !== prevProps.params.placeId) {
      this.props.updateFocusedPlaceId(parseInt(this.props.params.placeId));
    }

    if (this.props.uiConfiguration !== prevProps.uiConfiguration) {
      this.updateUIConfiguration(this.props.uiConfiguration);
    }
  }

  recaculateContainerSize() {
    this.setState({
      mapContainerHeightDeclaration: getMainContentAreaHeight({
        isContentPanelVisible: this.props.isContentPanelVisible,
        isGeocodeAddressBarEnabled: this.props.isGeocodeAddressBarEnabled,
        layout: this.props.layout,
        isAddPlaceButtonVisible:
          this.props.isAddPlaceButtonVisible &&
          this.props.hasAddPlacePermission,
        addPlaceButtonRef: this.addPlaceButtonRef,
      }),
      mapContainerWidthDeclaration: getMainContentAreaWidth({
        isContentPanelVisible: this.props.isContentPanelVisible,
        isRightSidebarVisible: this.props.isRightSidebarVisible,
        layout: this.props.layout,
      }),
    });
  }

  updateUIConfiguration(uiConfiguration) {
    switch (uiConfiguration) {
      case "map":
        this.props.updateUIVisibility("contentPanel", false);
        this.props.updateUIVisibility("spotlightMask", false);
        this.props.updateUIVisibility("mapCenterpoint", false);
        this.props.updateUIVisibility("addPlaceButton", true);
        //this.store.dispatch(updateActivePage(null));
        //this.store.dispatch(updateContentPanelComponent(null));
        break;
      case "placeDetail":
        // TODO: put inital place fetch here?
        this.props.updateEditModeToggled(false);
        //this.props.updateScrollToResponseId(parseInt(responseId));
        this.props.updateUIVisibility("contentPanel", true);
        this.props.updateUIVisibility("mapCenterpoint", false);
        this.props.updateUIVisibility("addPlaceButton", true);
        this.props.updateContentPanelComponent("PlaceDetail");
        break;
      case "inputForm":
        this.props.updateUIVisibility("addPlaceButton", false);
        this.props.updateUIVisibility("contentPanel", true);
        this.props.updateContentPanelComponent("InputForm");
        break;
      case "customPage":
        this.props.updateUIVisibility("contentPanel", true);
        this.props.updateUIVisibility("spotlightMask", false);
        this.props.updateUIVisibility("mapCenterpoint", false);
        this.props.updateUIVisibility("addPlaceButton", true);
        this.props.updateActivePage(this.props.pageSlug);
        this.props.updateContentPanelComponent("CustomPage");
        break;
    }
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
          />
          {this.props.isMapCenterpointVisible && <MapCenterpoint />}
          {this.props.isSpotlightMaskVisible && <SpotlightMask />}
        </MapContainer>
        {this.props.isContentPanelVisible && (
          <ContentPanel
            languageCode={this.props.languageCode}
            mapContainerRef={this.mapContainerRef}
          />
        )}
        {this.props.isAddPlaceButtonVisible &&
          this.props.hasAddPlacePermission && (
            <AddPlaceButton
              ref={this.addPlaceButtonRef}
              onClick={() => {
                //this.props.router.navigate("/new", {
                //  trigger: true,
                //});
              }}
            >
              {this.props.placeConfig.add_button_label}
            </AddPlaceButton>
          )}
        {this.props.layout === "desktop" &&
          this.props.isRightSidebarEnabled && <RightSidebar />}
      </>
    );
  }
}

MapTemplate.propTypes = {
  activePageSlug: PropTypes.string,
  contentPanelComponent: PropTypes.string,
  editModeToggled: PropTypes.bool,
  focusedPlaceId: PropTypes.number,
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
  updateMapViewport: PropTypes.func.isRequired,
  initialZoom: PropTypes.number,
  initialLat: PropTypes.number,
  initialLng: PropTypes.number,
  uiVisibilities: PropTypes.object,
  updateUIVisibility: PropTypes.func.isRequired,
  updateActivePage: PropTypes.func.isRequired,
  updateContentPanelComponent: PropTypes.func.isRequired,
  updateEditModeToggled: PropTypes.func.isRequired,
  updateFocusedPlaceId: PropTypes.func.isRequired,
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

const mapDispatchToProps = dispatch => ({
  updateMapViewport: mapViewport => dispatch(updateMapViewport(mapViewport)),
  updateUIVisibility: (componentName, isVisible) =>
    dispatch(updateUIVisibility(componentName, isVisible)),
  updateActivePage: pageSlug => dispatch(updateActivePage(pageSlug)),
  updateContentPanelComponent: componentName =>
    dispatch(updateContentPanelComponent(componentName)),
  updateFocusedPlaceId: focusedPlaceId =>
    dispatch(updateFocusedPlaceId(focusedPlaceId)),
  updateEditModeToggled: isToggled =>
    dispatch(updateEditModeToggled(isToggled)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapTemplate);

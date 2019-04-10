import React, { Component, createRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import styled from "@emotion/styled";
import { withRouter } from "react-router-dom";
import { FlyToInterpolator } from "react-map-gl";

import MainMap from "../organisms/main-map";
import ContentPanel from "../organisms/content-panel";
import AddPlaceButton from "../molecules/add-place-button";
import LeftSidebar from "../organisms/left-sidebar";
import RightSidebar from "../organisms/right-sidebar";
import GeocodeAddressBar from "../organisms/geocode-address-bar";

import mapseedApiClient from "../../client/mapseed-api-client";
import {
  navBarConfigSelector,
  navBarConfigPropType,
} from "../../state/ducks/nav-bar-config";
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
import {
  datasetsConfigSelector,
  datasetsConfigPropType,
} from "../../state/ducks/datasets-config";
import { hasGroupAbilitiesInDatasets } from "../../state/ducks/user";
import { isLeftSidebarExpandedSelector } from "../../state/ducks/left-sidebar";
import { isRightSidebarEnabledSelector } from "../../state/ducks/right-sidebar-config";
import {
  geocodeAddressBarEnabledSelector,
  mapConfigSelector,
  mapConfigPropType,
} from "../../state/ducks/map-config";
import {
  createFeaturesInGeoJSONSource,
  initialMapViewportSelector,
  mapViewportPropType,
} from "../../state/ducks/map";
import {
  placeExists,
  updateFocusedPlaceId,
  updateScrollToResponseId,
  loadPlaceAndSetIgnoreFlag,
} from "../../state/ducks/places";

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
    mapViewport: {
      transitionInterpolator: new FlyToInterpolator(),
      ...this.props.initialMapViewport,
    },
    isMapDraggedOrZoomed: false,
    isSpotlightMaskVisible: false,
  };

  async componentDidMount() {
    this.recaculateContainerSize();
    this.updateUIConfiguration(this.props.uiConfiguration);

    // Set initial map zoom and centerpoint.
    const { zoom, lat, lng } = this.props.params;
    zoom &&
      lat &&
      lng &&
      this.onUpdateMapViewport({
        zoom: parseFloat(zoom),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      });

    const startPageConfig = this.props.navBarConfig.find(
      navItem => navItem.start_page,
    );
    if (
      this.props.uiConfiguration === "map" &&
      startPageConfig &&
      !this.props.isStartPageViewed
    ) {
      this.props.history.push(startPageConfig.url);
      this.props.onViewStartPage();
    }

    // When this component mounts in the PlaceDetail configuration, a couple of
    // situations can occur:
    //  - The requested Place is not yet available. In this case, fetch it
    //    directly.
    //  - The requested Place is available (such as when routing to a
    //    PlaceDetail view from the list template). In this case, just set the
    //    focusedPlaceId.
    const { datasetClientSlug, placeId, responseId } = this.props.params;
    if (placeId && !this.props.placeExists(placeId)) {
      const datasetConfig = this.props.datasetsConfig.find(
        c => c.clientSlug === datasetClientSlug,
      );

      if (!datasetConfig) {
        // If we can't find a datasetConfig, it's likely because an invalid
        // clientSlug was supplied. In this case route back to the root.
        this.props.history.push("/");
        return;
      }

      const response = await mapseedApiClient.place.getPlace({
        datasetUrl: datasetConfig.url,
        datasetClientSlug,
        datasetSlug: datasetConfig.slug,
        placeId: parseInt(placeId),
        placeParams: {
          include_submissions: true,
          include_tags: true,
        },
        includePrivate: this.props.hasGroupAbilitiesInDatasets({
          abilities: ["can_access_protected"],
          datasetSlugs: [datasetConfig.slug],
          submissionSet: "places",
        }),
      });
      if (response) {
        // Add this Place to the places duck and update the map.
        this.props.loadPlaceAndSetIgnoreFlag(response);
        const { geometry, ...rest } = response;
        this.props.createFeaturesInGeoJSONSource(datasetConfig.slug, [
          {
            type: "Feature",
            geometry,
            properties: rest,
          },
        ]);

        this.props.updateEditModeToggled(false);
        this.props.updateFocusedPlaceId(parseInt(placeId));
        this.props.updateScrollToResponseId(parseInt(responseId));
      } else {
        // The Place doesn't exist, so route back to the map.
        this.props.history.push("/");
      }
    } else if (placeId) {
      this.props.updateFocusedPlaceId(parseInt(placeId));
      this.props.updateScrollToResponseId(parseInt(responseId));
    }

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

    if (this.props.params.placeId !== prevProps.params.placeId) {
      this.props.updateEditModeToggled(false);
      this.props.updateFocusedPlaceId(parseInt(this.props.params.placeId));
    }

    if (this.props.uiConfiguration !== prevProps.uiConfiguration) {
      this.updateUIConfiguration(this.props.uiConfiguration);
    }

    if (this.props.params.pageSlug !== prevProps.params.pageSlug) {
      this.props.updateActivePage(this.props.params.pageSlug);
    }

    if (this.props.params.responseId !== prevProps.params.responseId) {
      this.props.updateScrollToResponseId(
        parseInt(this.props.params.responseId),
      );
    }
  }

  onUpdateMapDraggedOrZoomed = isMapDraggedOrZoomed => {
    this.setState({
      isMapDraggedOrZoomed,
    });
  };

  onUpdateSpotlightMaskVisibility = isSpotlightMaskVisible => {
    this.setState({
      isSpotlightMaskVisible,
    });
  };

  onUpdateMapViewport = (newMapViewport, scrollZoomAroundCenter = false) => {
    this.setState(state => ({
      mapViewport: {
        ...state.mapViewport,
        ...newMapViewport,
        // NOTE: This is a fix for an apparent bug in react-map-gl.
        // See: https://github.com/uber/react-map-gl/issues/630
        bearing: isNaN(newMapViewport.bearing)
          ? state.mapViewport.bearing
          : newMapViewport.bearing,
        // These checks support a "scroll zoom around center" feature (in
        // which a zoom of the map will not change the centerpoint) that is
        // not exposed by react-map-gl. These checks are pretty convoluted,
        // though, so it would be great if react-map-gl could just
        // incorporate the scroll zoom around center option natively.
        // See: https://github.com/uber/react-map-gl/issues/515
        latitude:
          scrollZoomAroundCenter &&
          newMapViewport.zoom !== state.mapViewport.zoom
            ? state.mapViewport.latitude
            : newMapViewport.latitude
              ? newMapViewport.latitude
              : state.mapViewport.latitude,
        longitude:
          scrollZoomAroundCenter &&
          newMapViewport.zoom !== state.mapViewport.zoom
            ? state.mapViewport.longitude
            : newMapViewport.longitude
              ? newMapViewport.longitude
              : state.mapViewport.longitude,
      },
    }));
  };

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
    // TODO: allow batch updating of ui visibilities.
    switch (uiConfiguration) {
      case "newPlace":
        this.props.updateUIVisibility("contentPanel", true);
        this.props.updateUIVisibility("spotlightMask", true);
        this.props.updateUIVisibility("mapCenterpoint", true);
        this.props.updateUIVisibility("addPlaceButton", false);
        this.props.updateContentPanelComponent("InputForm");
        break;
      case "map":
        this.props.updateUIVisibility("contentPanel", false);
        this.props.updateUIVisibility("spotlightMask", false);
        this.props.updateUIVisibility("mapCenterpoint", false);
        this.props.updateUIVisibility("addPlaceButton", true);
        break;
      case "placeDetail":
        this.props.updateEditModeToggled(false);
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
        this.props.updateActivePage(this.props.params.pageSlug);
        this.props.updateContentPanelComponent("CustomPage");
        break;
      case "inviteModal":
        this.props.updateUIVisibility("inviteModal", true);
        break;
    }
  }

  render() {
    return (
      <>
        {this.props.isGeocodeAddressBarEnabled && (
          <GeocodeAddressBar
            mapConfig={this.props.mapConfig}
            onUpdateMapViewport={this.onUpdateMapViewport}
          />
        )}
        <MapContainer
          ref={this.mapContainerRef}
          width={this.state.mapContainerWidthDeclaration}
          height={this.state.mapContainerHeightDeclaration}
        >
          {this.props.isLeftSidebarExpanded && <LeftSidebar />}
          <MainMap
            isMapDraggedOrZoomed={this.state.isMapDraggedOrZoomed}
            mapContainerRef={this.mapContainerRef}
            mapContainerDimensions={this.state.mapContainerDimensions}
            mapContainerWidthDeclaration={
              this.state.mapContainerWidthDeclaration
            }
            mapContainerHeightDeclaration={
              this.state.mapContainerHeightDeclaration
            }
            mapViewport={this.state.mapViewport}
            onUpdateMapViewport={this.onUpdateMapViewport}
            onUpdateMapDraggedOrZoomed={this.onUpdateMapDraggedOrZoomed}
            onUpdateSpotlightMaskVisibility={
              this.onUpdateSpotlightMaskVisibility
            }
          />
          {this.props.isSpotlightMaskVisible && <SpotlightMask />}
        </MapContainer>
        {this.props.isContentPanelVisible && (
          <ContentPanel
            isMapDraggedOrZoomed={this.state.isMapDraggedOrZoomed}
            languageCode={this.props.languageCode}
            mapContainerRef={this.mapContainerRef}
            mapViewport={this.state.mapViewport}
            onUpdateMapViewport={this.onUpdateMapViewport}
            updateMapDraggedOrZoomed={isMapDraggedOrZoomed =>
              this.setState({
                isMapDraggedOrZoomed,
              })
            }
          />
        )}
        {this.props.isAddPlaceButtonVisible &&
          this.props.hasAddPlacePermission && (
            <AddPlaceButton
              ref={this.addPlaceButtonRef}
              onClick={() => {
                this.props.history.push("/new");
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
  createFeaturesInGeoJSONSource: PropTypes.func.isRequired,
  datasetsConfig: datasetsConfigPropType,
  hasAddPlacePermission: PropTypes.bool.isRequired,
  hasGroupAbilitiesInDatasets: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  initialMapViewport: mapViewportPropType.isRequired,
  isAddPlaceButtonVisible: PropTypes.bool.isRequired,
  isContentPanelVisible: PropTypes.bool.isRequired,
  isGeocodeAddressBarEnabled: PropTypes.bool.isRequired,
  isLeftSidebarExpanded: PropTypes.bool.isRequired,
  isRightSidebarEnabled: PropTypes.bool.isRequired,
  isRightSidebarVisible: PropTypes.bool.isRequired,
  isSpotlightMaskVisible: PropTypes.bool.isRequired,
  isStartPageViewed: PropTypes.bool,
  languageCode: PropTypes.string.isRequired,
  layout: PropTypes.string.isRequired,
  loadPlaceAndSetIgnoreFlag: PropTypes.func.isRequired,
  mapConfig: mapConfigPropType.isRequired,
  navBarConfig: navBarConfigPropType.isRequired,
  onViewStartPage: PropTypes.func,
  // Parameters passed from the router.
  params: PropTypes.shape({
    pageSlug: PropTypes.string,
    placeId: PropTypes.string,
    datasetClientSlug: PropTypes.string,
    responseId: PropTypes.string,
    zoom: PropTypes.string,
    lat: PropTypes.string,
    lng: PropTypes.string,
  }).isRequired,
  placeConfig: placeConfigPropType.isRequired,
  placeExists: PropTypes.func.isRequired,
  uiConfiguration: PropTypes.string.isRequired,
  updateUIVisibility: PropTypes.func.isRequired,
  updateActivePage: PropTypes.func.isRequired,
  updateContentPanelComponent: PropTypes.func.isRequired,
  updateEditModeToggled: PropTypes.func.isRequired,
  updateFocusedPlaceId: PropTypes.func.isRequired,
  updateScrollToResponseId: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  datasetsConfig: datasetsConfigSelector(state),
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
  hasGroupAbilitiesInDatasets: ({ abilities, submissionSet, datasetSlugs }) =>
    hasGroupAbilitiesInDatasets({
      state,
      abilities,
      submissionSet,
      datasetSlugs,
    }),
  initialMapViewport: initialMapViewportSelector(state),
  isAddPlaceButtonVisible: uiVisibilitySelector("addPlaceButton", state),
  isContentPanelVisible: uiVisibilitySelector("contentPanel", state),
  isGeocodeAddressBarEnabled: geocodeAddressBarEnabledSelector(state),
  isLeftSidebarExpanded: isLeftSidebarExpandedSelector(state),
  isRightSidebarEnabled: isRightSidebarEnabledSelector(state),
  isRightSidebarVisible: uiVisibilitySelector("rightSidebar", state),
  isSpotlightMaskVisible: uiVisibilitySelector("spotlightMask", state),
  layout: layoutSelector(state),
  mapConfig: mapConfigSelector(state),
  navBarConfig: navBarConfigSelector(state),
  placeConfig: placeConfigSelector(state),
  placeExists: placeId => placeExists(state, placeId),
});

const mapDispatchToProps = dispatch => ({
  createFeaturesInGeoJSONSource: (sourceId, newFeatures) =>
    dispatch(createFeaturesInGeoJSONSource(sourceId, newFeatures)),
  loadPlaceAndSetIgnoreFlag: placeModel =>
    dispatch(loadPlaceAndSetIgnoreFlag(placeModel)),
  updateUIVisibility: (componentName, isVisible) =>
    dispatch(updateUIVisibility(componentName, isVisible)),
  updateActivePage: pageSlug => dispatch(updateActivePage(pageSlug)),
  updateContentPanelComponent: componentName =>
    dispatch(updateContentPanelComponent(componentName)),
  updateFocusedPlaceId: focusedPlaceId =>
    dispatch(updateFocusedPlaceId(focusedPlaceId)),
  updateEditModeToggled: isToggled =>
    dispatch(updateEditModeToggled(isToggled)),
  updateScrollToResponseId: responseId =>
    dispatch(updateScrollToResponseId(responseId)),
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(MapTemplate),
);

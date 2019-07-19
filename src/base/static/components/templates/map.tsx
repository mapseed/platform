/** @jsx jsx */
import React, { Component, createRef, Fragment } from "react";
import { findDOMNode } from "react-dom";
import { css, jsx } from "@emotion/core";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import styled from "@emotion/styled";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { translate } from "react-i18next";
import i18next, { TranslationFunction } from "i18next";

import emitter from "../../utils/event-emitter";

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
  updateCurrentTemplate,
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
  MapSourcesLoadStatus,
} from "../../state/ducks/map";
import {
  createFeaturesInGeoJSONSource,
  mapSourcesSelector,
  mapSourcesPropType,
} from "../../state/ducks/map-style";
import {
  updateFocusedPlaceId,
  updateScrollToResponseId,
  loadPlaceAndSetIgnoreFlag,
} from "../../state/ducks/places";

import {
  getMainContentAreaWidth,
  getMainContentAreaHeight,
} from "../../utils/layout-utils";
import { Mixpanel } from "../../utils/mixpanel";

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

const statePropTypes = {
  datasetsConfig: datasetsConfigPropType.isRequired,
  hasAddPlacePermission: PropTypes.bool.isRequired,
  hasGroupAbilitiesInDatasets: PropTypes.func.isRequired,
  isAddPlaceButtonVisible: PropTypes.bool.isRequired,
  isContentPanelVisible: PropTypes.bool.isRequired,
  isGeocodeAddressBarEnabled: PropTypes.bool.isRequired,
  isLeftSidebarExpanded: PropTypes.bool.isRequired,
  isRightSidebarEnabled: PropTypes.bool.isRequired,
  isRightSidebarVisible: PropTypes.bool.isRequired,
  isSpotlightMaskVisible: PropTypes.bool.isRequired,
  mapSources: mapSourcesPropType,
  layout: PropTypes.string.isRequired,
  mapConfig: mapConfigPropType,
  navBarConfig: navBarConfigPropType.isRequired,
  placeConfig: placeConfigPropType.isRequired,
};

const dispatchPropTypes = {
  createFeaturesInGeoJSONSource: PropTypes.func.isRequired,
  loadPlaceAndSetIgnoreFlag: PropTypes.func.isRequired,
  updateUIVisibility: PropTypes.func.isRequired,
  updateActivePage: PropTypes.func.isRequired,
  updateContentPanelComponent: PropTypes.func.isRequired,
  updateFocusedPlaceId: PropTypes.func.isRequired,
  updateEditModeToggled: PropTypes.func.isRequired,
  updateScrollToResponseId: PropTypes.func.isRequired,
  updateCurrentTemplate: PropTypes.func.isRequired,
};

type StateProps = PropTypes.InferProps<typeof statePropTypes>;
type DispatchProps = PropTypes.InferProps<typeof dispatchPropTypes>;
interface OwnProps {
  uiConfiguration: string;
  isStartPageViewed?: boolean;
  onViewStartPage?: () => void;
  currentLanguageCode: string;
  defaultLanguageCode: string;
  params: {
    datasetClientSlug?: string;
    responseId?: string;
    pageSlug?: string;
    placeId?: string;
    zoom?: string;
    lat?: string;
    lng?: string;
  };
}
interface State {
  isMapTransitioning: boolean;
  addPlaceButtonHeight: number;
  mapContainerHeightDeclaration: string;
  mapContainerWidthDeclaration: string;
  mapViewport: MapViewport;
  isMapDraggedOrZoomedByUser: boolean;
  isSpotlightMaskVisible: boolean;
  mapSourcesLoadStatus: MapSourcesLoadStatus;
}
// Types were added to react-i18next is a newer version.
// TODO: Use supplied types when we upgrade i18next deps.
// See: https://github.com/i18next/react-i18next/pull/557/files
type TransProps = {
  i18nKey?: string;
  count?: number;
  parent?: React.ReactNode;
  i18n?: i18next.i18n;
  t?: TranslationFunction;
  defaults?: string;
  values?: {};
  components?: React.ReactNode[];
};

type Props = StateProps &
  DispatchProps &
  OwnProps &
  RouteComponentProps<{}> &
  TransProps;

class MapTemplate extends Component<Props, State> {
  private mapContainerRef = createRef<HTMLDivElement>();
  private addPlaceButtonRef = createRef<HTMLDivElement>();

  state: State = {
    // NOTE: These dimension "declarations" will be CSS strings, as set by the
    // utility methods getMainContentAreaHeight() and
    // getMainContentAreaWidth().
    mapContainerHeightDeclaration: "",
    mapContainerWidthDeclaration: "",
    addPlaceButtonHeight: 0,
    mapViewport: {
      ...this.props.initialMapViewport,
      transitionInterpolator: new FlyToInterpolator(),
    },
    isMapDraggedOrZoomedByUser: true,
    isSpotlightMaskVisible: false,
    isMapTransitioning: false,
    // Sources load status terminology:
    // ------------------------------------
    // "unloaded": The map has not yet begun to fetch data for this source.
    // "loading": The map has begun fetching data for this source, but it has
    //     not finished.
    // "loaded": All data for this source has finished. Rendering may or may not
    //     be in progress.
    // "error": An error occurred when fetching data for this source.
    mapSourcesLoadStatus: Object.keys(this.props.mapSources).reduce(
      (memo, groupName: string) => ({
        ...memo,
        [groupName]: "unloaded",
      }),
      {},
    ),
  };

  async componentDidMount() {
    this.recalculateContainerSize();
    this.updateUIConfiguration(this.props.uiConfiguration);
    this.props.updateCurrentTemplate("map");

    const { zoom, lat, lng } = this.props.params;
    zoom &&
      lat &&
      lng &&
      emitter.emit("setMapViewport", {
        zoom: parseFloat(zoom),
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
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
      this.props.onViewStartPage && this.props.onViewStartPage();
    }

    const { datasetClientSlug, placeId, responseId } = this.props.params;

    // When this component mounts in the Place detail configuration, fetch the
    // requested Place directly from the API for a better UX.
    if (placeId) {
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
        clientSlug: datasetClientSlug,
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
        responseId && this.props.updateScrollToResponseId(parseInt(responseId));
      } else {
        // The Place doesn't exist, so route back to the map.
        this.props.history.push("/");
      }
    }

    this.recalculateContainerSize();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.layout !== prevProps.layout ||
      this.props.isContentPanelVisible !== prevProps.isContentPanelVisible ||
      this.props.isRightSidebarVisible !== prevProps.isRightSidebarVisible
    ) {
      this.recalculateContainerSize();
    }

    if (
      this.props.params.placeId &&
      this.props.params.placeId !== prevProps.params.placeId
    ) {
      this.props.updateEditModeToggled(false);
      this.props.updateFocusedPlaceId(parseInt(this.props.params.placeId));
    }

    if (this.props.uiConfiguration !== prevProps.uiConfiguration) {
      this.updateUIConfiguration(this.props.uiConfiguration);
    }

    if (
      this.props.params.pageSlug &&
      this.props.params.pageSlug !== prevProps.params.pageSlug
    ) {
      this.props.updateActivePage(this.props.params.pageSlug);
    }

    if (
      this.props.params.responseId &&
      this.props.params.responseId !== prevProps.params.responseId
    ) {
      this.props.updateScrollToResponseId(
        parseInt(this.props.params.responseId),
      );
    }

    // TODO: refactor these into Redux.
    if (
      this.state.isMapDraggedOrZoomedByUser !==
        prevState.isMapDraggedOrZoomedByUser &&
      this.state.isMapDraggedOrZoomedByUser
    ) {
      this.props.updateUIVisibility("spotlightMask", false);
    }
  }

  onUpdateMapDraggedOrZoomedByUser = isMapDraggedOrZoomedByUser => {
    this.setState({
      isMapDraggedOrZoomedByUser,
    });
  };

  onUpdateSpotlightMaskVisibility = isSpotlightMaskVisible => {
    this.setState({
      isSpotlightMaskVisible,
    });
  };

  onUpdateSourceLoadStatus = (sourceId, loadStatus) => {
    this.setState(state => ({
      mapSourcesLoadStatus: {
        ...state.mapSourcesLoadStatus,
        [sourceId]: loadStatus,
      },
    }));
  };

  onUpdateMapTransitioning = isMapTransitioning => {
    this.setState({
      isMapTransitioning,
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

  recalculateContainerSize() {
    const addPlaceButton = findDOMNode(
      this.addPlaceButtonRef.current,
    ) as Element;
    const addPlaceButtonDims =
      addPlaceButton && addPlaceButton.getBoundingClientRect();

    this.setState({
      addPlaceButtonHeight: addPlaceButtonDims
        ? addPlaceButtonDims.height
        : this.state.addPlaceButtonHeight,
      mapContainerHeightDeclaration: getMainContentAreaHeight({
        isContentPanelVisible: this.props.isContentPanelVisible,
        isGeocodeAddressBarEnabled: this.props.isGeocodeAddressBarEnabled,
        layout: this.props.layout,
        isAddPlaceButtonVisible:
          this.props.isAddPlaceButtonVisible &&
          this.props.hasAddPlacePermission,
        addPlaceButtonDims: addPlaceButtonDims,
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
      case "mapWithInvalidRoute":
        this.props.history.push("/");
        break;
    }
  }

  render() {
    return (
      <Fragment>
        {this.props.isGeocodeAddressBarEnabled && (
          <GeocodeAddressBar mapConfig={this.props.mapConfig} />
        )}
        <div
          css={css`
            position: relative;
            overflow: hidden;
            width: ${this.state.mapContainerWidthDeclaration};
            height: ${this.state.mapContainerHeightDeclaration};
          `}
          ref={this.mapContainerRef}
        >
          {this.props.isLeftSidebarExpanded && (
            <LeftSidebar
              mapSourcesLoadStatus={this.state.mapSourcesLoadStatus}
            />
          )}
          <MainMap
            isMapDraggedOrZoomedByUser={this.state.isMapDraggedOrZoomedByUser}
            mapContainerRef={this.mapContainerRef}
            mapContainerWidthDeclaration={
              this.state.mapContainerWidthDeclaration
            }
            mapContainerHeightDeclaration={
              this.state.mapContainerHeightDeclaration
            }
            mapSourcesLoadStatus={this.state.mapSourcesLoadStatus}
            mapViewport={this.state.mapViewport}
            onUpdateInitialMapViewport={this.props.onUpdateInitialMapViewport}
            onUpdateMapViewport={this.onUpdateMapViewport}
            onUpdateMapDraggedOrZoomedByUser={
              this.onUpdateMapDraggedOrZoomedByUser
            }
            onUpdateSourceLoadStatus={this.onUpdateSourceLoadStatus}
            onUpdateMapTransitioning={this.onUpdateMapTransitioning}
            isMapTransitioning={this.state.isMapTransitioning}
          />
          {this.props.isSpotlightMaskVisible && <SpotlightMask />}
        </div>
        {this.props.isContentPanelVisible && (
          <ContentPanel
            addPlaceButtonHeight={this.state.addPlaceButtonHeight}
            currentLanguageCode={this.props.currentLanguageCode}
            defaultLanguageCode={this.props.defaultLanguageCode}
            mapContainerRef={this.mapContainerRef}
            mapViewport={this.state.mapViewport}
            onUpdateMapViewport={this.onUpdateMapViewport}
            onUpdateMapDraggedOrZoomedByUser={
              this.onUpdateMapDraggedOrZoomedByUser
            }
            isMapTransitioning={this.state.isMapTransitioning}
          />
        )}
        {this.props.isAddPlaceButtonVisible &&
          this.props.hasAddPlacePermission && (
            <AddPlaceButton
              layout={this.props.layout}
              onClick={() => {
                Mixpanel.track("Click Add Place Button");
                this.props.history.push("/new");
              }}
            >
              {this.props.t(
                "addPlaceButtonLabel",
                this.props.placeConfig.add_button_label,
              )}
            </AddPlaceButton>
          )}
        {this.props.layout === "desktop" &&
          this.props.isRightSidebarEnabled && <RightSidebar />}
      </Fragment>
    );
  }
}

type MapseedReduxState = any;

const mapStateToProps = (
  state: MapseedReduxState,
  ownProps: OwnProps,
): StateProps => ({
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
  isAddPlaceButtonVisible: uiVisibilitySelector("addPlaceButton", state),
  isContentPanelVisible: uiVisibilitySelector("contentPanel", state),
  isGeocodeAddressBarEnabled: geocodeAddressBarEnabledSelector(state),
  isLeftSidebarExpanded: isLeftSidebarExpandedSelector(state),
  isRightSidebarEnabled: isRightSidebarEnabledSelector(state),
  isRightSidebarVisible: uiVisibilitySelector("rightSidebar", state),
  isSpotlightMaskVisible: uiVisibilitySelector("spotlightMask", state),
  mapSources: mapSourcesSelector(state),
  layout: layoutSelector(state),
  mapConfig: mapConfigSelector(state),
  navBarConfig: navBarConfigSelector(state),
  placeConfig: placeConfigSelector(state),
});

const mapDispatchToProps = {
  createFeaturesInGeoJSONSource,
  loadPlaceAndSetIgnoreFlag,
  updateUIVisibility,
  updateActivePage,
  updateContentPanelComponent,
  updateFocusedPlaceId,
  updateEditModeToggled,
  updateScrollToResponseId,
  updateCurrentTemplate,
};

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(translate("MapTemplate")(withRouter(MapTemplate)));

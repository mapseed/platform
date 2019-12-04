/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import styled from "../../utils/styled";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { withTranslation, WithTranslation } from "react-i18next";

const MainMap = React.lazy(() => import("../organisms/main-map"));
import ContentPanel from "../organisms/content-panel";
import AddPlaceButton from "../molecules/add-place-button";
import LeftSidebar from "../organisms/left-sidebar";
import RightSidebar from "../organisms/right-sidebar";
import GeocodeAddressBar from "../organisms/geocode-address-bar";
import { LoadingBar } from "../atoms/imagery";

import mapseedApiClient from "../../client/mapseed-api-client";
import {
  navBarConfigSelector,
  NavBarConfig,
} from "../../state/ducks/nav-bar-config";
import {
  userSelector,
  User,
  datasetsWithCreatePlacesAbilitySelector,
  datasetsWithAccessProtectedPlacesAbilitySelector,
} from "../../state/ducks/user";
import { appConfigSelector, AppConfig } from "../../state/ducks/app-config";
import {
  layoutSelector,
  uiVisibilitySelector,
  updateUIVisibility,
  updateActivePage,
  updateCurrentTemplate,
} from "../../state/ducks/ui";
import {
  placeConfigPropType,
  placeConfigSelector,
} from "../../state/ducks/place-config";
import { Dataset } from "../../state/ducks/datasets";
import { isLeftSidebarExpandedSelector } from "../../state/ducks/left-sidebar";
import { isRightSidebarEnabledSelector } from "../../state/ducks/right-sidebar-config";
import {
  geocodeAddressBarEnabledSelector,
  mapConfigSelector,
  mapConfigPropType,
  MapSourcesLoadStatus,
  updateMapViewport,
} from "../../state/ducks/map";
import {
  createFeaturesInGeoJSONSource,
  mapSourcesSelector,
  mapSourcesPropType,
} from "../../state/ducks/map-style";
import { loadPlaceAndSetIgnoreFlag } from "../../state/ducks/places";
import { placeFormIdSelector } from "../../state/ducks/forms";

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

const dispatchPropTypes = {
  createFeaturesInGeoJSONSource: PropTypes.func.isRequired,
  loadPlaceAndSetIgnoreFlag: PropTypes.func.isRequired,
  updateUIVisibility: PropTypes.func.isRequired,
  updateActivePage: PropTypes.func.isRequired,
  updateCurrentTemplate: PropTypes.func.isRequired,
  updateMapViewport: PropTypes.func.isRequired,
};

type StateProps = {
  appConfig: AppConfig;
  datasetsWithCreatePlacesAbility: Dataset[];
  datasetsWithAccessProtectedPlacesAbility: Dataset[];
  isGeocodeAddressBarEnabled: boolean;
  isLeftSidebarExpanded: boolean;
  isRightSidebarEnabled: boolean;
  isRightSidebarVisible: boolean;
  isSpotlightMaskVisible: boolean;
  mapSources: PropTypes.InferProps<typeof mapSourcesPropType>;
  layout: string;
  mapConfig: PropTypes.InferProps<typeof mapConfigPropType>;
  navBarConfig: NavBarConfig;
  placeConfig: PropTypes.InferProps<typeof placeConfigPropType.isRequired>;
  placeFormIdSelector: (datasetUrl: string) => string | undefined;
  user: User;
};

type DispatchProps = PropTypes.InferProps<typeof dispatchPropTypes>;
interface OwnProps {
  isStartPageViewed?: boolean;
  onViewStartPage?: () => void;
  currentLanguageCode: string;
  defaultLanguageCode: string;
  params: {
    datasetClientSlug?: string;
    formId?: string;
    responseId?: string;
    pageSlug?: string;
    placeId?: string;
    zoom?: string;
    lat?: string;
    lng?: string;
  };
}
interface State {
  mapSourcesLoadStatus: MapSourcesLoadStatus;
}

type Props = StateProps &
  DispatchProps &
  OwnProps &
  RouteComponentProps<{}> &
  WithTranslation;

class MapTemplate extends React.Component<Props, State> {
  private mapContainerRef = React.createRef<HTMLDivElement>();

  state: State = {
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
    this.props.updateCurrentTemplate("map");

    const { zoom, lat, lng } = this.props.params;
    if (zoom && lat && lng) {
      this.props.updateMapViewport({
        zoom: parseFloat(zoom),
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      });
    }

    // TODO
    //const startPageConfig = this.props.navBarConfig.find(
    //  navItem => navItem.start_page,
    //);
    //if (
    //  this.props.uiConfiguration === "map" &&
    //  startPageConfig &&
    //  startPageConfig.url &&
    //  !this.props.isStartPageViewed
    //) {
    //  this.props.history.push(startPageConfig.url);
    //  this.props.onViewStartPage && this.props.onViewStartPage();
    //}

    const { datasetClientSlug, placeId, responseId } = this.props.params;

    // When this component mounts in the Place detail configuration, fetch the
    // requested Place directly from the API for a better UX.
    if (placeId) {
      const dataset = this.props.datasetsWithCreatePlacesAbility.find(
        ({ clientSlug }) => clientSlug === datasetClientSlug,
      );

      if (!dataset) {
        this.props.history.push("/");

        return;
      }

      const response = await mapseedApiClient.place.getPlace({
        datasetUrl: dataset.url,
        placeId,
        placeParams: {
          include_submissions: true,
          include_tags: true,
        },
        includePrivate: !!this.props.datasetsWithAccessProtectedPlacesAbility.find(
          ({ url }) => url === dataset.url,
        ),
      });

      if (response) {
        // Add this Place to the places duck and update the map.
        this.props.loadPlaceAndSetIgnoreFlag(response);
        const { geometry, ...rest } = response;
        this.props.createFeaturesInGeoJSONSource(dataset.slug, [
          {
            type: "Feature",
            geometry,
            properties: rest,
          },
        ]);

        //this.props.updateEditModeToggled(false);
        //this.props.updateFocusedPlaceId(parseInt(placeId));
        //responseId && this.props.updateScrollToResponseId(parseInt(responseId));
      } else {
        // The Place doesn't exist, so route back to the map.
        this.props.history.push("/");
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.match.url !== "/new" &&
      this.props.match.url === "/new" &&
      this.props.datasetsWithCreatePlacesAbility.length === 1
    ) {
      this.props.history.push(
        `/new/${this.props.placeFormIdSelector(
          this.props.datasetsWithCreatePlacesAbility[0].url,
        )}`,
      );
    }
  }

  onUpdateSourceLoadStatus = (sourceId, loadStatus) => {
    this.setState(state => ({
      mapSourcesLoadStatus: {
        ...state.mapSourcesLoadStatus,
        [sourceId]: loadStatus,
      },
    }));
  };

  render() {
    const { url } = this.props.match;
    const { formId, placeId, pageSlug, responseId } = this.props.params;
    const isContentPanelVisible = Boolean(
      formId || placeId || url === "/new" || pageSlug,
    );
    const { datasetsWithCreatePlacesAbility } = this.props;
    const isAddPlaceButtonVisible =
      url !== "/new" && datasetsWithCreatePlacesAbility.length > 0;

    return (
      <div
        css={css`
          display: flex;
          height: 100%;
        `}
      >
        {this.props.isGeocodeAddressBarEnabled && (
          <GeocodeAddressBar mapConfig={this.props.mapConfig} />
        )}
        <div
          css={css`
            position: relative;
            flex: 3;
          `}
          ref={this.mapContainerRef}
        >
          {this.props.isLeftSidebarExpanded && (
            <LeftSidebar
              mapSourcesLoadStatus={this.state.mapSourcesLoadStatus}
            />
          )}
          <React.Suspense fallback={<LoadingBar />}>
            <MainMap
              mapContainerRef={this.mapContainerRef}
              mapSourcesLoadStatus={this.state.mapSourcesLoadStatus}
              onUpdateSourceLoadStatus={this.onUpdateSourceLoadStatus}
              isContentPanelVisible={isContentPanelVisible}
            />
          </React.Suspense>
          {this.props.isSpotlightMaskVisible && <SpotlightMask />}
        </div>
        {isContentPanelVisible && (
          <ContentPanel
            currentLanguageCode={this.props.currentLanguageCode}
            defaultLanguageCode={this.props.defaultLanguageCode}
            mapContainerRef={this.mapContainerRef}
          />
        )}
        {isAddPlaceButtonVisible && (
          <AddPlaceButton
            layout={this.props.layout}
            onClick={() => this.props.history.push("/new")}
          >
            {this.props.t(
              "addPlaceButtonLabel",
              this.props.placeConfig.add_button_label,
            )}
          </AddPlaceButton>
        )}
        {this.props.layout === "desktop" &&
          this.props.isRightSidebarEnabled && <RightSidebar />}
      </div>
    );
  }
}

type MapseedReduxState = any;

const mapStateToProps = (state: MapseedReduxState): StateProps => ({
  appConfig: appConfigSelector(state),
  datasetsWithCreatePlacesAbility: datasetsWithCreatePlacesAbilitySelector(
    state,
  ),
  datasetsWithAccessProtectedPlacesAbility: datasetsWithAccessProtectedPlacesAbilitySelector(
    state,
  ),
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
  user: userSelector(state),
  placeFormIdSelector: datasetUrl => placeFormIdSelector(state, datasetUrl),
});

const mapDispatchToProps = {
  createFeaturesInGeoJSONSource,
  loadPlaceAndSetIgnoreFlag,
  updateUIVisibility,
  updateActivePage,
  updateCurrentTemplate,
  updateMapViewport,
};

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation("MapTemplate")(withRouter(MapTemplate)));

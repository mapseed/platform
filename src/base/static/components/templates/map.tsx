/** @jsx jsx */
/** @jsx jsx */
import * as React from "react";
import { findDOMNode } from "react-dom";
import { css, jsx } from "@emotion/core";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import styled from "../../utils/styled";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { withTranslation, WithTranslation } from "react-i18next";

import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

import emitter from "../../utils/event-emitter";

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
import { userSelector, User } from "../../state/ducks/user";
import { appConfigSelector, AppConfig } from "../../state/ducks/app-config";
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
import { datasetsSelector, Dataset } from "../../state/ducks/datasets";
import { hasGroupAbilitiesInDatasets } from "../../state/ducks/user";
import { isLeftSidebarExpandedSelector } from "../../state/ducks/left-sidebar";
import { isRightSidebarEnabledSelector } from "../../state/ducks/right-sidebar-config";
import { filtersConfigSelector, FiltersConfig, FilterComponentOption } from "../../state/ducks/filters";
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
  layerGroupsSelector,
  LayerGroups,
  updateLayerGroupVisibility,
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
import LoginModal from "../molecules/login-modal";

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
  updateContentPanelComponent: PropTypes.func.isRequired,
  updateFocusedPlaceId: PropTypes.func.isRequired,
  updateEditModeToggled: PropTypes.func.isRequired,
  updateScrollToResponseId: PropTypes.func.isRequired,
  updateCurrentTemplate: PropTypes.func.isRequired,
  updateMapViewport: PropTypes.func.isRequired,
  updateLayerGroupVisibility: typeof updateLayerGroupVisibility,
};

type StateProps = {
  appConfig: AppConfig;
  datasets: Dataset[];
  hasAddPlacePermission: boolean;
  hasGroupAbilitiesInDatasets: Function;
  isAddPlaceButtonVisible: boolean;
  isContentPanelVisible: boolean;
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
  user: User;
  filtersConfig: FiltersConfig;
  filtersComponentOption: FilterComponentOption[];
  layerGroups: LayerGroups;
};

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
  addPlaceButtonHeight: number;
  mapContainerHeightDeclaration: string;
  mapContainerWidthDeclaration: string;
  mapSourcesLoadStatus: MapSourcesLoadStatus;
  expanded: string;
  setExpanded: boolean;
}

type Props = StateProps &
  DispatchProps &
  OwnProps &
  RouteComponentProps<{}> &
  WithTranslation;

class MapTemplate extends React.Component<Props, State> {
  private mapContainerRef = React.createRef<HTMLDivElement>();
  private addPlaceButtonRef = React.createRef<HTMLDivElement>();

  state: State = {
    // NOTE: These dimension "declarations" will be CSS strings, as set by the
    // utility methods getMainContentAreaHeight() and
    // getMainContentAreaWidth().
    mapContainerHeightDeclaration: "",
    mapContainerWidthDeclaration: "",
    addPlaceButtonHeight: 0,
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
    expanded: '',
    setExpanded: false,
  };

  async componentDidMount() {
    this.recalculateContainerSize();
    this.updateUIConfiguration(this.props.uiConfiguration);
    this.props.updateCurrentTemplate("map");
    const { zoom, lat, lng } = this.props.params;
    if (zoom && lat && lng) {
      this.props.updateMapViewport({
        zoom: parseFloat(zoom),
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      });
    }

    const startPageConfig = this.props.navBarConfig.find(
      navItem => navItem.start_page,
    );
    if (
      this.props.uiConfiguration === "map" &&
      startPageConfig &&
      startPageConfig.url &&
      !this.props.isStartPageViewed
    ) {
      this.props.history.push(startPageConfig.url);
      this.props.onViewStartPage && this.props.onViewStartPage();
    }

    const { datasetClientSlug, placeId, responseId } = this.props.params;
    
    // When this component mounts in the Place detail configuration, fetch the
    // requested Place directly from the API for a better UX.
    if (placeId) {

      const dataset = this.props.datasets.find(
        dataset => dataset.clientSlug === datasetClientSlug,
      );

      if (!dataset) {
        // If we can't find a datasetConfig, it's likely because an invalid
        // clientSlug was supplied. In this case route back to the root.
        this.props.history.push("/");
        return;
      }

      const response = await mapseedApiClient.place.getPlace({
        datasetUrl: dataset.url,
        clientSlug: datasetClientSlug,
        datasetSlug: dataset.slug,
        placeId: parseInt(placeId),
        placeParams: {
          include_submissions: true,
          include_tags: true,
        },
        includePrivate: this.props.hasGroupAbilitiesInDatasets({
          abilities: ["can_access_protected"],
          datasetSlugs: [dataset.slug],
          submissionSet: "places",
        }),
      });

      if (response) {
        /*
        console.log("Visita...")
        response.visitas = response.visitas + 1;

        const response_place = await mapseedApiClient.place.update({
          placeUrl: dataset.places.url,
          placeData: response,
          datasetSlug: dataset.slug,
          clientSlug: dataset.clientSlug,
          hasAdminAbilities: false,
        });
        */
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
      this.props.isRightSidebarVisible !== prevProps.isRightSidebarVisible ||
      this.props.isAddPlaceButtonVisible !== prevProps.isAddPlaceButtonVisible
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
  }

  onUpdateSourceLoadStatus = (sourceId, loadStatus) => {
    this.setState(state => ({
      mapSourcesLoadStatus: {
        ...state.mapSourcesLoadStatus,
        [sourceId]: loadStatus,
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

  onToggleLayerGroup = (layerGroups, options) => {
    for (const key in options) {
      let layer = this.props.layerGroups.byId[options[key].layerGroupId];
      let lg_new = layerGroups.filter((selected)=>
        selected.layerGroupId==layer.id
      )
      if(layer.isVisible && lg_new.length == 0){
        this.props.updateLayerGroupVisibility(layer.id, false);
      }
    }
    layerGroups.forEach((layerGroup) => {
      let layerGroup_ = this.props.layerGroups.byId[layerGroup.layerGroupId];
      if(!layerGroup_.isVisible){
        this.props.updateLayerGroupVisibility(layerGroup_.id, true);
      }
    })
  }

  handleUserFilters = () => {
    console.log(this.props.mapSources)
    console.log(this.props.user)
    for (const key in this.props.mapSources) {
      const src = this.props.mapSources[key];
      if(src.data){
        for (const key_features in src.data.features) {
          const feature = src.data.features[key_features];
          let subm = feature.properties.submitter
          if(subm && subm.username == this.props.user.username){
            console.log(feature)
          }
        }
      }
    }
  }

  handleExpanded = (panel) => (event, isExpanded) => {
    this.setState({
      expanded: this.state.expanded == panel ? '' : panel 
    })
  }

  render() {
    return (
      <React.Fragment>
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
          <React.Suspense fallback={<LoadingBar />}>
            <MainMap
              mapContainerRef={this.mapContainerRef}
              mapContainerWidthDeclaration={
                this.state.mapContainerWidthDeclaration
              }
              mapContainerHeightDeclaration={
                this.state.mapContainerHeightDeclaration
              }
              mapSourcesLoadStatus={this.state.mapSourcesLoadStatus}
              onUpdateSourceLoadStatus={this.onUpdateSourceLoadStatus}
            />
          </React.Suspense>
          {this.props.isSpotlightMaskVisible && <SpotlightMask />}
        </div>
        {this.props.filtersConfig.enabled && (
          <div
            css={css`
              position: absolute;
              z-indeX: 100;
              width: 308px;
              left: 20px;
              top: 195px;
            `}
          >
          {this.props.filtersConfig.components.length > 0 &&
            this.props.filtersConfig.components.map(
              (component, compIndex) => {
                let options = new Array();
                component.options.forEach(option => {
                  let lg = this.props.layerGroups.byId[option.layerGroupId];  
                  if(lg.isVisible){
                    options.push(option)
                  }
                });
                return (
                  <Accordion 
                    key={compIndex}
                    expanded={this.state.expanded === component['title']} 
                    onChange={this.handleExpanded(component['title'])}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={component['title']+"bh-content"}
                      id={component['title']+"bh-header"}
                    >
                      {component['title']}
                    </AccordionSummary>
                    <AccordionDetails>
                      <div
                        css={css`
                          width: 100%;
                        `}
                      >
                        <Autocomplete
                          multiple
                          id="tags-standard"
                          value={options}
                          options={component['options']}
                          getOptionLabel={(option) => option['title']}
                          onChange={(event, value) => {
                            this.onToggleLayerGroup(value, component['options']);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="standard"
                              label=""
                              placeholder="¿Que desea buscar?"
                            />
                          )}
                        />
                      </div>
                    </AccordionDetails>
                  </Accordion>
                )
              },
          )}
          </div>
        )}
        {this.props.isContentPanelVisible && (
          <ContentPanel
            addPlaceButtonHeight={this.state.addPlaceButtonHeight}
            currentLanguageCode={this.props.currentLanguageCode}
            defaultLanguageCode={this.props.defaultLanguageCode}
            mapContainerRef={this.mapContainerRef}
          />
        )}
        {this.props.isAddPlaceButtonVisible &&
          this.props.hasAddPlacePermission && (
            <LoginModal
              appConfig={this.props.appConfig}
              render={openModal => (
                <AddPlaceButton
                  ref={this.addPlaceButtonRef}
                  layout={this.props.layout}
                  onClick={() => {
                    // If we aren't logged in, and one or more datasets are
                    // auth_only, then render the login modal:
                    if (
                      !this.props.user.isAuthenticated &&
                      this.props.datasets.some(dataset => dataset.auth_required)
                    ) {
                      openModal();
                    } else {
                      this.props.history.push("/new");
                    }
                  }}
                >
                  {this.props.t(
                    "addPlaceButtonLabel",
                    this.props.placeConfig.add_button_label,
                  )}
                </AddPlaceButton>
              )}
            />
          )}
        {this.props.layout === "desktop" &&
          this.props.isRightSidebarEnabled && <RightSidebar />}
      </React.Fragment>
    );
  }
}

type MapseedReduxState = any;

const mapStateToProps = (state: MapseedReduxState): StateProps => ({
  appConfig: appConfigSelector(state),
  datasets: datasetsSelector(state),
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
  user: userSelector(state),
  filtersConfig: filtersConfigSelector(state),
  filtersComponentOption: [],
  layerGroups: layerGroupsSelector(state),
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
  updateMapViewport,
  updateLayerGroupVisibility,
};

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation("MapTemplate")(withRouter(MapTemplate)));

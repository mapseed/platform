import React, { Component, Suspense, createRef, lazy } from "react";
import { Route, withRouter, Switch } from "react-router-dom";
import { findDOMNode } from "react-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import browserUpdate from "browser-update";
import styled from "@emotion/styled";
import { Provider } from "react-redux";
import Spinner from "react-spinner";

import SiteHeader from "./organisms/site-header";
import {
  currentTemplateSelector,
  updateLayout,
  layoutSelector,
  updateUIVisibility,
} from "../state/ducks/ui";
import ShaTemplate from "./templates/sha";
const DashboardTemplate = lazy(() => import("./templates/dashboard"));
const ListTemplate = lazy(() => import("./templates/place-list"));
const MapTemplate = lazy(() => import("./templates/map"));

import config from "config";

import mapseedApiClient from "../client/mapseed-api-client";
import { loadPlaces, updatePlacesLoadStatus } from "../state/ducks/places";
import {
  datasetsConfigSelector,
  datasetsConfigPropType,
  hasAnonAbilitiesInAnyDataset,
  datasetSlugsSelector,
} from "../state/ducks/datasets-config";
import { loadDatasets } from "../state/ducks/datasets";
import { loadDashboardConfig } from "../state/ducks/dashboard-config";
import { loadAppConfig, appConfigPropType } from "../state/ducks/app-config";
import { loadMapConfig } from "../state/ducks/map-config";
import { loadDatasetsConfig } from "../state/ducks/datasets-config";
import { loadPlaceConfig } from "../state/ducks/place-config";
// TODO: configs always in their own duck
import { loadLeftSidebarConfig } from "../state/ducks/left-sidebar";
import { loadRightSidebarConfig } from "../state/ducks/right-sidebar-config";
import { loadStoryConfig } from "../state/ducks/story-config";
import { loadFormsConfig } from "../state/ducks/forms-config";
import { loadSupportConfig } from "../state/ducks/support-config";
import {
  loadPagesConfig,
  pageExistsSelector,
} from "../state/ducks/pages-config";
import { loadNavBarConfig } from "../state/ducks/nav-bar-config";
import { loadMapStyle, loadMapViewport } from "../state/ducks/map";
import { loadCustomComponentsConfig } from "../state/ducks/custom-components-config";
import { loadUser } from "../state/ducks/user";
import languageModule from "../language-module";

import ThemeProvider from "./theme-provider";
import JSSProvider from "./jss-provider";

import { hasGroupAbilitiesInDatasets } from "../state/ducks/user";
import { appConfigSelector } from "../state/ducks/app-config";
import {
  storyConfigSelector,
  storyChaptersSelector,
} from "../state/ducks/story-config";
import {
  createFeaturesInGeoJSONSource,
  updateMapViewport,
} from "../state/ducks/map";
import { recordGoogleAnalyticsHit } from "../utils/analytics";

const Util = require("../js/utils.js");

browserUpdate({
  required: {
    e: -2, // Edge, last 2 versions
    i: 11, // IE >= 11.0
    f: -2, // Firefox, last 2 versions
    s: -2, // Safari, last 2 versions
    c: -2, // Chrome, last 2 versions
  },
});

const TemplateContainer = styled("div")(props => ({
  position: "relative",
  overflow:
    props.layout === "desktop"
      ? props.currentTemplate === "list"
        ? "hidden"
        : "auto"
      : "visible",
  width: "100%",
  // 56px === fixed height of header bar
  height: "calc(100% - 56px)",
}));

const Fallback = () => {
  return <Spinner />;
};

class App extends Component {
  templateContainerRef = createRef();

  async componentDidMount() {
    // In production, use the asynchronously fetched config file so we can
    // support localized config content. In development, use the imported
    // module so we can support incremental rebuilds.
    let resolvedConfig;
    if (process.env.NODE_ENV === "production") {
      const configResponse = await fetch(`/config-${Mapseed.languageCode}.js`);
      resolvedConfig = await configResponse.json();
    } else {
      resolvedConfig = config;
    }

    // TODO: Move to API client.
    fetch(`${resolvedConfig.app.api_root}utils/session-key?format=json`, {
      credentials: "include",
    }).then(async session => {
      const sessionJson = await session.json();
      Util.cookies.save("sa-api-sessionid", sessionJson.sessionid);
    });

    // Fetch and load user information.
    const authedUser = await mapseedApiClient.user.get(
      resolvedConfig.app.api_root,
    );
    const user = authedUser
      ? {
          token: `user:${authedUser.id}`,
          // avatar_url and `name` are backup values that can get overidden:
          avatar_url: "/static/css/images/user-50.png",
          name: authedUser.username,
          ...authedUser,
          isAuthenticated: true,
          isLoaded: true,
        }
      : {
          // anonymous user:
          avatar_url: "/static/css/images/user-50.png",
          token: `session:${Util.cookies.get("sa-api-sessionid")}`,
          groups: [],
          isAuthenticated: false,
          isLoaded: true,
        };
    this.props.loadUser(user);

    // Fetch and load datasets.
    const datasetUrls = resolvedConfig.datasets.map(c => c.url);
    const datasets = await mapseedApiClient.datasets.get(datasetUrls);
    this.props.loadDatasets(datasets);

    // Load all other ducks.
    this.props.loadAppConfig(resolvedConfig.app);
    this.props.loadDatasetsConfig(resolvedConfig.datasets);
    this.props.loadMapConfig(resolvedConfig.map);
    this.props.loadPlaceConfig(resolvedConfig.place, user);
    this.props.loadLeftSidebarConfig(resolvedConfig.left_sidebar);
    this.props.loadRightSidebarConfig(resolvedConfig.right_sidebar);
    this.props.loadStoryConfig(resolvedConfig.story);
    this.props.loadFormsConfig(resolvedConfig.forms);
    this.props.loadSupportConfig(resolvedConfig.support);
    this.props.loadPagesConfig(resolvedConfig.pages);
    this.props.loadNavBarConfig(resolvedConfig.nav_bar);
    this.props.loadCustomComponentsConfig(resolvedConfig.custom_components);
    this.props.loadMapStyle(resolvedConfig.map, resolvedConfig.datasets);
    resolvedConfig.dashboard &&
      this.props.loadDashboardConfig(resolvedConfig.dashboard);

    this.props.loadMapViewport(resolvedConfig.map.options.mapViewport);
    resolvedConfig.right_sidebar.is_visible_default &&
      this.props.updateUIVisibility("rightSidebar", true);

    languageModule.changeLanguage(Mapseed.languageCode);

    window.addEventListener("resize", this.props.updateLayout);

    // Globally capture all clicks so we can enable client-side routing.
    // TODO: Ideally this listener would only live in our Link atom and the
    // internal check would happen there. But because we have internal links
    // in custom page content, we need to listen globally. Note that this means
    // the route event will fire twice from internal links rendered by the
    // Link atom.
    document.addEventListener("click", evt => {
      const rel = evt.target.attributes.getNamedItem("rel");
      if (rel && rel.value === "internal") {
        evt.preventDefault();
        this.props.history.push(
          evt.target.attributes.getNamedItem("href").value,
        );
      }
    });

    const templateDims = findDOMNode(
      this.templateContainerRef.current,
    ).getBoundingClientRect();

    this.props.updateMapViewport({
      width: templateDims.width,
      height: templateDims.height,
    });

    this.routeListener = this.props.history.listen(location => {
      recordGoogleAnalyticsHit(location.pathname);
    });

    // Fetch and load Places.
    this.props.updatePlacesLoadStatus("loading");
    const allPlacePagePromises = [];
    await Promise.all(
      this.props.datasetsConfig.map(async c => {
        // Note that the response here is an array of page Promises.
        const response = await mapseedApiClient.place.get({
          datasetUrl: c.url,
          datasetSlug: c.slug,
          clientSlug: c.clientSlug,
          placeParams: {
            // NOTE: this is to include comments/supports while fetching our place models
            include_submissions: true,
            include_tags: true,
          },
          includePrivate: this.props.hasGroupAbilitiesInDatasets({
            abilities: ["can_access_protected"],
            datasetSlugs: [c.slug],
            submissionSet: "places",
          }),
        });

        if (response) {
          response.forEach(async placePagePromise => {
            allPlacePagePromises.push(placePagePromise);
            const pageData = await placePagePromise;
            this.props.loadPlaces(pageData, this.props.storyChapters);

            // Update the map.
            this.props.createFeaturesInGeoJSONSource(
              // "sourceId" and a dataset's slug are the same thing.
              c.slug,
              pageData.map(place => {
                const { geometry, ...rest } = place;

                return {
                  type: "Feature",
                  geometry,
                  properties: rest,
                };
              }),
            );
          });
        } else {
          Util.log("USER", "dataset", "fail-to-fetch-places-from-dataset");
        }
      }),
    );

    await Promise.all(allPlacePagePromises);
    this.props.updatePlacesLoadStatus("loaded");
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.props.updateLayout);
    this.routeListener && this.routeListener.unlisten();
  }

  render() {
    return (
      <Provider store={this.props.store}>
        <JSSProvider>
          <ThemeProvider>
            <SiteHeader languageCode={Mapseed.languageCode} />
            <TemplateContainer
              ref={this.templateContainerRef}
              layout={this.props.layout}
              currentTemplate={this.props.currentTemplate}
            >
              <Switch>
                <Route exact path="/sha" component={ShaTemplate} />
                <Route
                  exact
                  path="/list"
                  render={() => (
                    <Suspense fallback={<Fallback />}>
                      <ListTemplate />
                    </Suspense>
                  )}
                />
                <Route
                  exact
                  path="/new"
                  render={props => {
                    if (
                      this.props.hasAnonAbilitiesInAnyDataset("places", [
                        "create",
                      ]) ||
                      this.props.hasGroupAbilitiesInDatasets({
                        submissionSet: "places",
                        abilities: ["create"],
                        datasetSlugs: this.props.datasetSlugs,
                      })
                    ) {
                      return (
                        <Suspense fallback={<Fallback />}>
                          <MapTemplate
                            uiConfiguration="newPlace"
                            languageCode={Mapseed.languageCode}
                            {...props.match}
                          />
                        </Suspense>
                      );
                    } else {
                      this.props.history.push("/");
                      return;
                    }
                  }}
                />
                <Route
                  exact
                  path="/dashboard"
                  render={() => {
                    return (
                      <Suspense fallback={<Fallback />}>
                        <DashboardTemplate
                          datasetDownloadConfig={
                            this.props.appConfig.dataset_download
                          }
                          apiRoot={this.props.appConfig.api_root}
                        />
                      </Suspense>
                    );
                  }}
                />
                <Route
                  exact
                  path="/page/:pageSlug"
                  render={props => {
                    if (
                      !this.props.pageExists(
                        props.match.params.pageSlug,
                        Mapseed.languageCode,
                      )
                    ) {
                      this.props.history.push("/");
                      return;
                    }

                    return (
                      <Suspense fallback={<Fallback />}>
                        <MapTemplate
                          uiConfiguration="customPage"
                          languageCode={Mapseed.languageCode}
                          {...props.match}
                        />
                      </Suspense>
                    );
                  }}
                />
                <Route
                  exact
                  path="/:datasetClientSlug/:placeId"
                  render={props => {
                    return (
                      <Suspense fallback={<Fallback />}>
                        <MapTemplate
                          uiConfiguration="placeDetail"
                          languageCode={Mapseed.languageCode}
                          {...props.match}
                        />
                      </Suspense>
                    );
                  }}
                />
                <Route
                  exact
                  path="/:datasetClientSlug/:placeId/response/:responseId"
                  render={props => {
                    return (
                      <Suspense fallback={<Fallback />}>
                        <MapTemplate
                          uiConfiguration="placeDetail"
                          languageCode={Mapseed.languageCode}
                          {...props.match}
                        />
                      </Suspense>
                    );
                  }}
                />
                <Route
                  exact
                  path="/:zoom?/:lat?/:lng?"
                  render={props => {
                    return (
                      <Suspense fallback={<Fallback />}>
                        <MapTemplate
                          uiConfiguration="map"
                          languageCode={Mapseed.languageCode}
                          {...props.match}
                        />
                      </Suspense>
                    );
                  }}
                />
              </Switch>
            </TemplateContainer>
          </ThemeProvider>
        </JSSProvider>
      </Provider>
    );
  }
}

App.propTypes = {
  appConfig: appConfigPropType,
  createFeaturesInGeoJSONSource: PropTypes.func.isRequired,
  currentTemplate: PropTypes.string.isRequired,
  datasetsConfig: datasetsConfigPropType,
  datasetSlugs: PropTypes.array.isRequired,
  hasAnonAbilitiesInAnyDataset: PropTypes.func.isRequired,
  hasGroupAbilitiesInDatasets: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  layout: PropTypes.string.isRequired,
  loadDatasets: PropTypes.func.isRequired,
  loadPlaces: PropTypes.func.isRequired,
  // TODO: shape of this:
  storyChapters: PropTypes.array.isRequired,
  // TODO: shape of this:
  updateLayout: PropTypes.func.isRequired,
  updateMapViewport: PropTypes.func.isRequired,
  updatePlacesLoadStatus: PropTypes.func.isRequired,
  updateUIVisibility: PropTypes.func.isRequired,
  loadDatasetsConfig: PropTypes.func.isRequired,
  loadMapConfig: PropTypes.func.isRequired,
  loadPlaceConfig: PropTypes.func.isRequired,
  loadLeftSidebarConfig: PropTypes.func.isRequired,
  loadRightSidebarConfig: PropTypes.func.isRequired,
  loadStoryConfig: PropTypes.func.isRequired,
  loadAppConfig: PropTypes.func.isRequired,
  loadFormsConfig: PropTypes.func.isRequired,
  loadSupportConfig: PropTypes.func.isRequired,
  loadPagesConfig: PropTypes.func.isRequired,
  loadNavBarConfig: PropTypes.func.isRequired,
  loadCustomComponentsConfig: PropTypes.func.isRequired,
  loadMapStyle: PropTypes.func.isRequired,
  loadMapViewport: PropTypes.func.isRequired,
  loadDashboardConfig: PropTypes.func.isRequired,
  loadUser: PropTypes.func.isRequired,
  pageExists: PropTypes.func.isRequired,
  store: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  appConfig: appConfigSelector(state),
  currentTemplate: currentTemplateSelector(state),
  datasetsConfig: datasetsConfigSelector(state),
  datasetSlugs: datasetSlugsSelector(state),
  hasAnonAbilitiesInAnyDataset: (submissionSet, abilities) =>
    hasAnonAbilitiesInAnyDataset({ state, submissionSet, abilities }),
  hasGroupAbilitiesInDatasets: ({ abilities, datasetSlugs, submissionSet }) =>
    hasGroupAbilitiesInDatasets({
      state,
      abilities,
      datasetSlugs,
      submissionSet,
    }),
  layout: layoutSelector(state),
  pageExists: (slug, lang) => pageExistsSelector({ state, slug, lang }),
  storyConfig: storyConfigSelector(state),
  storyChapters: storyChaptersSelector(state),
});

const mapDispatchToProps = dispatch => ({
  createFeaturesInGeoJSONSource: (sourceId, newFeatures) =>
    dispatch(createFeaturesInGeoJSONSource(sourceId, newFeatures)),
  loadDatasets: datasets => dispatch(loadDatasets(datasets)),
  loadPlaces: (places, storyConfig) =>
    dispatch(loadPlaces(places, storyConfig)),
  updatePlacesLoadStatus: loadStatus =>
    dispatch(updatePlacesLoadStatus(loadStatus)),
  updateLayout: () => dispatch(updateLayout()),
  updateMapViewport: newViewport => dispatch(updateMapViewport(newViewport)),
  updateUIVisibility: (componentName, isVisible) =>
    dispatch(updateUIVisibility(componentName, isVisible)),
  loadDatasetsConfig: config => dispatch(loadDatasetsConfig(config)),
  loadDashboardConfig: config => dispatch(loadDashboardConfig(config)),
  loadMapConfig: config => dispatch(loadMapConfig(config)),
  loadPlaceConfig: config => dispatch(loadPlaceConfig(config)),
  loadLeftSidebarConfig: config => dispatch(loadLeftSidebarConfig(config)),
  loadRightSidebarConfig: config => dispatch(loadRightSidebarConfig(config)),
  loadStoryConfig: config => dispatch(loadStoryConfig(config)),
  loadAppConfig: config => dispatch(loadAppConfig(config)),
  loadFormsConfig: config => dispatch(loadFormsConfig(config)),
  loadSupportConfig: config => dispatch(loadSupportConfig(config)),
  loadPagesConfig: config => dispatch(loadPagesConfig(config)),
  loadNavBarConfig: config => dispatch(loadNavBarConfig(config)),
  loadCustomComponentsConfig: config =>
    dispatch(loadCustomComponentsConfig(config)),
  loadMapStyle: (mapConfig, datasetsConfig) =>
    dispatch(loadMapStyle(mapConfig, datasetsConfig)),
  loadMapViewport: mapViewport => dispatch(loadMapViewport(mapViewport)),
  loadUser: user => dispatch(loadUser(user)),
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(App),
);

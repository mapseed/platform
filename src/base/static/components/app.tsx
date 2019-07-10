/** @jsx jsx */
import * as React from "react";
import { jsx } from "@emotion/core";
import { Component, createRef, lazy, Suspense } from "react";
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from "react-router-dom";
import { Dispatch, Store } from "redux";
import { findDOMNode } from "react-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import browserUpdate from "browser-update";
import styled from "@emotion/styled";
import { Provider } from "react-redux";
import Spinner from "react-spinner";
import { Mixpanel } from "../utils/mixpanel";
import i18next from "i18next";
import { reactI18nextModule } from "react-i18next";
import resourceBundle from "../../../locales";

import SiteHeader from "./organisms/site-header";
import {
  currentTemplateSelector,
  layoutSelector,
  updateLayout,
  updateUIVisibility,
} from "../state/ducks/ui";
import ShaTemplate from "./templates/sha";
const DashboardTemplate = lazy(() => import("./templates/dashboard"));
const ListTemplate = lazy(() => import("./templates/place-list"));
const MapTemplate = lazy(() => import("./templates/map"));
const ReportTemplate = lazy(() => import("./templates/report"));

// @ts-ignore
import config from "config";

import mapseedApiClient from "../client/mapseed-api-client";
import translationServiceClient from "../client/translation-service-client";
import {
  datasetsConfigPropType,
  datasetsConfigSelector,
  datasetSlugsSelector,
  hasAnonAbilitiesInAnyDataset,
} from "../state/ducks/datasets-config";
import { loadDatasets } from "../state/ducks/datasets";
import { loadDashboardConfig } from "../state/ducks/dashboard-config";
import { appConfigPropType, loadAppConfig } from "../state/ducks/app-config";
import {
  loadMapConfig,
  defaultMapViewportSelector,
  InitialMapViewport,
} from "../state/ducks/map-config";
import { loadDatasetsConfig } from "../state/ducks/datasets-config";
import { loadPlaceConfig } from "../state/ducks/place-config";
import { loadLeftSidebarConfig } from "../state/ducks/left-sidebar";
import { loadRightSidebarConfig } from "../state/ducks/right-sidebar-config";
import { loadFormsConfig } from "../state/ducks/forms-config";
import { loadSupportConfig } from "../state/ducks/support-config";
import {
  loadPagesConfig,
  pageExistsSelector,
} from "../state/ducks/pages-config";
import { loadNavBarConfig } from "../state/ducks/nav-bar-config";
import { loadMapStyle, mapViewportPropType } from "../state/ducks/map";
import { updatePlacesLoadStatus, loadPlaces } from "../state/ducks/places";
import { loadCustomComponentsConfig } from "../state/ducks/custom-components-config";
import { loadUser } from "../state/ducks/user";

import ThemeProvider from "./theme-provider";
import JSSProvider from "./jss-provider";

import { hasGroupAbilitiesInDatasets } from "../state/ducks/user";
import { appConfigSelector } from "../state/ducks/app-config";
import {
  loadFeaturedPlacesConfig,
  featuredPlacesConfigPropType,
  featuredPlacesConfigSelector,
} from "../state/ducks/featured-places-config";
import {
  createFeaturesInGeoJSONSource,
  updateMapContainerDimensions,
} from "../state/ducks/map";
import { recordGoogleAnalyticsHit } from "../utils/analytics";
import isValidNonConfigurableI18nKey from "../utils/i18n-utils";

import Util from "../js/utils.js";

browserUpdate({
  required: {
    c: -2, // Chrome, last 2 versions
    e: -2, // Edge, last 2 versions
    f: -2, // Firefox, last 2 versions
    i: 12, // All versions of IE
    s: -2, // Safari, last 2 versions
  },
});

const isFetchingTranslation = {};

const TemplateContainer = styled("div")<{
  layout: string;
  currentTemplate: string;
}>(props => ({
  position: "relative",
  overflow:
    // The report template is a special case, and needs `overflow: visible`
    // for PDFs longer than one page to render.
    props.currentTemplate === "report"
      ? "visible"
      : props.layout === "desktop"
        ? "hidden"
        : "auto",
  width: "100%",
  height: "100%",

  "&::-webkit-scrollbar": {
    display: "none",
  },
}));

const Fallback = () => {
  return <Spinner />;
};

const statePropTypes = {
  appConfig: appConfigPropType,
  currentTemplate: PropTypes.string.isRequired,
  defaultMapViewport: mapViewportPropType,
  datasetsConfig: datasetsConfigPropType,
  datasetSlugs: PropTypes.array.isRequired,
  hasAnonAbilitiesInAnyDataset: PropTypes.func.isRequired,
  hasGroupAbilitiesInDatasets: PropTypes.func.isRequired,
  layout: PropTypes.string.isRequired,
  featuredPlacesConfig: featuredPlacesConfigPropType,
  // TODO: shape of this:
  pageExists: PropTypes.func.isRequired,
};

const dispatchPropTypes = {
  createFeaturesInGeoJSONSource: PropTypes.func.isRequired,
  loadDatasets: PropTypes.func.isRequired,
  loadPlaces: PropTypes.func.isRequired,
  updateMapContainerDimensions: PropTypes.func.isRequired,
  updatePlacesLoadStatus: PropTypes.func.isRequired,
  updateUIVisibility: PropTypes.func.isRequired,
  loadDatasetsConfig: PropTypes.func.isRequired,
  loadMapConfig: PropTypes.func.isRequired,
  loadPlaceConfig: PropTypes.func.isRequired,
  loadLeftSidebarConfig: PropTypes.func.isRequired,
  loadRightSidebarConfig: PropTypes.func.isRequired,
  loadFeaturedPlacesConfig: PropTypes.func.isRequired,
  loadAppConfig: PropTypes.func.isRequired,
  loadFormsConfig: PropTypes.func.isRequired,
  loadSupportConfig: PropTypes.func.isRequired,
  loadPagesConfig: PropTypes.func.isRequired,
  loadNavBarConfig: PropTypes.func.isRequired,
  loadCustomComponentsConfig: PropTypes.func.isRequired,
  loadMapStyle: PropTypes.func.isRequired,
  loadDashboardConfig: PropTypes.func.isRequired,
  loadUser: PropTypes.func.isRequired,
  updateLayout: PropTypes.func.isRequired,
};

type StateProps = PropTypes.InferProps<typeof statePropTypes>;

type DispatchProps = PropTypes.InferProps<typeof dispatchPropTypes>;

// These are Props passed down from parent:
interface OwnProps {
  store: Store;
}

type Props = StateProps &
  DispatchProps &
  OwnProps &
  // {} means empty interface, because we are using default ReactRouter props.
  RouteComponentProps<{}>;

// TODO: remove this once we remove the Mapseed global:
declare const Mapseed: any;
// 'process' global is injected by Webpack:
declare const process: any;

interface Language {
  code: string;
  label: string;
}
interface AvailableLanguages extends Array<Language> {}
interface State {
  currentLanguageCode: string;
  isInitialDataLoaded: boolean;
  isStartPageViewed: boolean;
  initialMapViewport: InitialMapViewport;
  defaultLanguage: Language;
  availableLanguages?: AvailableLanguages;
}

class App extends Component<Props, State> {
  private templateContainerRef: React.RefObject<HTMLInputElement> = createRef();
  private unlisten?: any;

  state: State = {
    isInitialDataLoaded: false,
    isStartPageViewed: false,
    // The `initialMapViewport` describes the viewport used when the map template
    // mounts, including when the app first loads and when the user routes to the
    // map template from another template. This allows us to "save" a viewport
    // when routing away from the map template, and restore it when routing back
    // to the map template.
    initialMapViewport: this.props.defaultMapViewport,
    defaultLanguage: {
      code: "en",
      label: "English",
    },
    availableLanguages: [],
    currentLanguageCode: "",
  };

  async componentDidMount() {
    // In production, use the asynchronously fetched config file so we can
    // support a config with overridden environment variables. In development,
    // use the imported module so we can support incremental rebuilds.
    // TODO(goldpbear): Now that gettext is gone I think this can be simplified.
    // We should be able to import the config directly in both prod and dev
    // with a little more work.
    let resolvedConfig;
    if (process.env.NODE_ENV === "production") {
      const configResponse = await fetch(`/config.js`);
      resolvedConfig = await configResponse.json();
    } else {
      resolvedConfig = config;
    }

    const sessionJSON = await mapseedApiClient.session.get(
      resolvedConfig.app.api_root,
    );

    if (sessionJSON) {
      Util.cookies.save("sa-api-sessionid", sessionJSON.sessionid);
    }

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
          // TODO: fix race condition here, with setting the cookie:
          token: `session:${Util.cookies.get("sa-api-sessionid")}`,
          groups: [],
          isAuthenticated: false,
          isLoaded: true,
        };
    if (user.isAuthenticated) {
      Mixpanel.identify(user.id);
      Mixpanel.track("Successful login");
      Mixpanel.people.set({
        name: user.name,
        username: user.username,
        id: user.id,
      });
    }
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
    this.props.loadLeftSidebarConfig(resolvedConfig.leftSidebar);
    this.props.loadRightSidebarConfig(resolvedConfig.right_sidebar);
    if (resolvedConfig.featuredPlaces) {
      this.props.loadFeaturedPlacesConfig(resolvedConfig.featuredPlaces);
    }
    this.props.loadFormsConfig(resolvedConfig.forms);
    this.props.loadSupportConfig(resolvedConfig.support);
    this.props.loadPagesConfig(resolvedConfig.pages);
    this.props.loadNavBarConfig(resolvedConfig.nav_bar);
    this.props.loadCustomComponentsConfig(resolvedConfig.custom_components);
    this.props.loadMapStyle(resolvedConfig.mapStyle, resolvedConfig.datasets);
    resolvedConfig.dashboard &&
      this.props.loadDashboardConfig(resolvedConfig.dashboard);
    resolvedConfig.right_sidebar.is_visible_default &&
      this.props.updateUIVisibility("rightSidebar", true);

    // Set up localization.
    i18next.use(reactI18nextModule).init({
      lng: resolvedConfig.flavor.defaultLanguage.code,
      resources: resourceBundle,
      react: { wait: true },
      interpolation: { escapeValue: false },
      saveMissing: true,
      missingKeyHandler: async (lng, ns, key, fallbackValue) => {
        if (
          key !== fallbackValue &&
          i18next.language === resolvedConfig.flavor.defaultLanguage
        ) {
          // Cache this string for future use.
          i18next.addResource(i18next.language, ns, key, fallbackValue);
        }

        // We want to avoid calling the translate API in the following cases:
        //   - The current language matches the default language. We make the
        //     strong assumption that all strings which are intended for
        //     automatic translation supply a fallback string in the flavor's
        //     default languague, so translating in this scenario is pointless.
        //   - A network request for a given key is already in flight. This can
        //     happen because the `missingKeyHandler` can get called repeatedly
        //     for the same key while waiting on the results of the original
        //     network request.
        //   - If the `key` equals the `fallbackValue`. If this is true, no
        //     actual fallbackValue was supplied, and i18next has swapped in the
        //     key instead. This is a misconfiguration, so rather than send the
        //     key itself to the translate API, we just render the key.
        //   - If the `key` represents a non-configurable piece of UI text and
        //     the current language is English. We expect the hard-coded default
        //     language of all non-configurable UI to be English.
        if (
          (i18next.language === resolvedConfig.flavor.defaultLanguage.code ||
            isFetchingTranslation[key] ||
            key === fallbackValue) &&
          isValidNonConfigurableI18nKey(key, i18next.language)
        ) {
          return;
        }

        isFetchingTranslation[key] = true;

        const response = await translationServiceClient.translate({
          text: fallbackValue,
          target: i18next.language,
          format: "text",
        });

        isFetchingTranslation[key] = false;

        if (response) {
          i18next.addResource(i18next.language, ns, key, response.body);
        } else {
          i18next.addResource(i18next.language, ns, key, fallbackValue);
        }
      },
    });

    // The config and user data are now loaded.
    this.setState({
      availableLanguages: resolvedConfig.flavor.availableLanguages,
      currentLanguageCode: i18next.language,
      defaultLanguage: resolvedConfig.flavor.defaultLanguage,
      isInitialDataLoaded: true,
      initialMapViewport: this.props.defaultMapViewport,
    });

    window.addEventListener("resize", this.props.updateLayout);

    // Globally capture all clicks so we can enable client-side routing.
    // TODO: Ideally this listener would only live in our Link atom and the
    // internal check would happen there. But because we have internal links
    // in custom page content, we need to listen globally. Note that this means
    // the route event will fire twice from internal links rendered by the
    // Link atom.
    document.addEventListener("click", event => {
      if (!event) {
        return;
      }
      // https://github.com/Microsoft/TypeScript/issues/299#issuecomment-474690599
      const evt = event as any;
      const rel = evt.target.attributes.getNamedItem("rel");
      if (rel && rel.value === "internal") {
        evt.preventDefault();
        this.props.history.push(
          evt.target.attributes.getNamedItem("href").value,
        );
      }
    });

    if (this.templateContainerRef.current) {
      const node = findDOMNode(this.templateContainerRef!.current);

      if (node instanceof Element) {
        const templateDims = node.getBoundingClientRect();

        this.props.updateMapContainerDimensions({
          width: templateDims.width,
          height: templateDims.height,
        });
      }
    }

    this.unlisten = this.props.history.listen(location => {
      recordGoogleAnalyticsHit(location.pathname);
    });

    // Fetch and load Places.
    this.props.updatePlacesLoadStatus("loading");
    const allPlacePagePromises: Promise<any>[] = [];
    await Promise.all(
      this.props.datasetsConfig.map(async datasetConfig => {
        // Note that the response here is an array of page Promises.
        const response: Promise<any>[] = await mapseedApiClient.place.get({
          datasetUrl: datasetConfig.url,
          datasetSlug: datasetConfig.slug,
          clientSlug: datasetConfig.clientSlug,
          placeParams: {
            // NOTE: this is to include comments/supports while fetching our place models
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
          response.forEach(async placePagePromise => {
            allPlacePagePromises.push(placePagePromise);
            const pageData = await placePagePromise;
            this.props.loadPlaces(pageData);

            // Update the map.
            this.props.createFeaturesInGeoJSONSource(
              // "sourceId" and a dataset's slug are the same thing.
              datasetConfig.slug,
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

    this.props.updatePlacesLoadStatus("loaded");
  }

  onViewStartPage = () => {
    this.setState({
      isStartPageViewed: true,
    });
  };

  onUpdateInitialMapViewport = initialMapViewport => {
    this.setState({
      initialMapViewport,
    });
  };

  onChangeLanguage = newLanguageCode => {
    i18next.changeLanguage(newLanguageCode);
    this.setState({
      currentLanguageCode: newLanguageCode,
    });
  };

  componentWillUnmount() {
    window.removeEventListener("resize", this.props.updateLayout);
    this.unlisten();
  }

  render() {
    const sharedMapTemplateProps = {
      initialMapViewport: this.state.initialMapViewport,
      onUpdateInitialMapViewport: this.onUpdateInitialMapViewport,
      isStartPageViewed: this.state.isStartPageViewed,
      onViewStartPage: this.onViewStartPage,
      currentLanguageCode: this.state.currentLanguageCode,
      defaultLanguageCode: this.state.defaultLanguage.code,
    };
    const headerProps = {
      availableLanguages: this.state.availableLanguages,
      defaultLanguage: this.state.defaultLanguage,
      currentLanguageCode: this.state.currentLanguageCode,
      onChangeLanguage: this.onChangeLanguage,
    };

    return (
      <Provider store={this.props.store}>
        {!this.state.isInitialDataLoaded ? (
          <Spinner />
        ) : (
          <JSSProvider>
            <ThemeProvider>
              <TemplateContainer
                ref={this.templateContainerRef}
                layout={this.props.layout}
                currentTemplate={this.props.currentTemplate}
              >
                <Switch>
                  <Route
                    exact
                    path="/"
                    render={props => {
                      return (
                        <Suspense fallback={<Fallback />}>
                          <SiteHeader {...headerProps} />
                          <MapTemplate
                            uiConfiguration="map"
                            {...sharedMapTemplateProps}
                            {...props.match}
                          />
                        </Suspense>
                      );
                    }}
                  />
                  <Route
                    exact
                    path="/:zoom(\d*\.\d+)/:lat(-?\d*\.\d+)/:lng(-?\d*\.\d+)"
                    render={props => {
                      return (
                        <Suspense fallback={<Fallback />}>
                          <SiteHeader {...headerProps} />
                          <MapTemplate
                            uiConfiguration="map"
                            {...sharedMapTemplateProps}
                            {...props.match}
                          />
                        </Suspense>
                      );
                    }}
                  />
                  <Route exact path="/sha" component={ShaTemplate} />
                  <Route
                    exact
                    path="/list"
                    render={() => (
                      <Suspense fallback={<Fallback />}>
                        <SiteHeader {...headerProps} />
                        <ListTemplate />
                      </Suspense>
                    )}
                  />
                  <Route
                    exact
                    path="/new"
                    render={props => {
                      if (
                        this.props.hasAnonAbilitiesInAnyDataset(
                          "places",
                          ["create"],
                        ) ||
                        this.props.hasGroupAbilitiesInDatasets({
                          submissionSet: "places",
                          abilities: ["create"],
                          datasetSlugs: this.props.datasetSlugs,
                        })
                      ) {
                        return (
                          <Suspense fallback={<Fallback />}>
                            <SiteHeader {...headerProps} />
                            <MapTemplate
                              uiConfiguration="newPlace"
                              {...sharedMapTemplateProps}
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
                          <SiteHeader {...headerProps} />
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
                    path="/print-report/:datasetClientSlug/:placeId"
                    render={props => {
                      return (
                        <Suspense fallback={<Fallback />}>
                          <ReportTemplate {...props.match} />
                        </Suspense>
                      );
                    }}
                  />
                  <Route
                    exact
                    path="/page/:pageSlug"
                    render={props => {
                      if (!this.props.pageExists(props.match.params.pageSlug)) {
                        return (
                          <Suspense fallback={<Fallback />}>
                            <SiteHeader {...headerProps} />
                            <MapTemplate
                              uiConfiguration="mapWithInvalidRoute"
                              {...sharedMapTemplateProps}
                              {...props.match}
                            />
                          </Suspense>
                        );
                      }

                      return (
                        <Suspense fallback={<Fallback />}>
                          <SiteHeader {...headerProps} />
                          <MapTemplate
                            uiConfiguration="customPage"
                            {...sharedMapTemplateProps}
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
                          <SiteHeader {...headerProps} />
                          <MapTemplate
                            uiConfiguration="placeDetail"
                            {...sharedMapTemplateProps}
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
                          <SiteHeader {...headerProps} />
                          <MapTemplate
                            uiConfiguration="placeDetail"
                            {...sharedMapTemplateProps}
                            {...props.match}
                          />
                        </Suspense>
                      );
                    }}
                  />
                  <Route
                    render={props => {
                      return (
                        <Suspense fallback={<Fallback />}>
                          <SiteHeader {...headerProps} />
                          <MapTemplate
                            uiConfiguration="mapWithInvalidRoute"
                            {...sharedMapTemplateProps}
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
        )}
      </Provider>
    );
  }
}

type MapseedReduxState = any;

const mapStateToProps = (
  state: MapseedReduxState,
  ownProps: OwnProps,
): StateProps => ({
  appConfig: appConfigSelector(state),
  currentTemplate: currentTemplateSelector(state),
  defaultMapViewport: defaultMapViewportSelector(state),
  datasetSlugs: datasetSlugsSelector(state),
  datasetsConfig: datasetsConfigSelector(state),
  hasAnonAbilitiesInAnyDataset: (submissionSet, abilities) =>
    hasAnonAbilitiesInAnyDataset({ state, submissionSet, abilities }),
  hasGroupAbilitiesInDatasets: ({ abilities, datasetSlugs, submissionSet }) =>
    hasGroupAbilitiesInDatasets({
      abilities,
      state,
      datasetSlugs,
      submissionSet,
    }),
  layout: layoutSelector(state),
  pageExists: slug => pageExistsSelector({ state, slug }),
  featuredPlacesConfig: featuredPlacesConfigSelector(state),
  ...ownProps,
});

const mapDispatchToProps = {
  createFeaturesInGeoJSONSource,
  loadDatasets,
  loadPlaces,
  updateLayout,
  updatePlacesLoadStatus,
  updateMapContainerDimensions,
  updateUIVisibility,
  loadDatasetsConfig,
  loadDashboardConfig,
  loadMapConfig,
  loadPlaceConfig,
  loadLeftSidebarConfig,
  loadRightSidebarConfig,
  loadFeaturedPlacesConfig,
  loadAppConfig,
  loadFormsConfig,
  loadSupportConfig,
  loadPagesConfig,
  loadNavBarConfig,
  loadCustomComponentsConfig,
  loadMapStyle,
  loadUser,
};

export default withRouter(
  connect<StateProps, DispatchProps, OwnProps>(
    mapStateToProps,
    mapDispatchToProps,
  )(App),
);

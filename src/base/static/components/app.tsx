/** @jsx jsx */
import * as React from "react";
import { jsx } from "@emotion/core";
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import browserUpdate from "browser-update";
import i18next, { ThirdPartyModule } from "i18next";
import { initReactI18next } from "react-i18next";
import resourceBundle from "../../../locales";

import SiteHeader from "./organisms/site-header";
import {
  currentTemplateSelector,
  layoutSelector,
  updateLayout,
  updateUIVisibility,
} from "../state/ducks/ui";
import ShaTemplate from "./templates/sha";
import { Spinner } from "./atoms/imagery";
import CookieConsentBanner from "./molecules/cookie-consent-banner";
const DashboardTemplate = React.lazy(() => import("./templates/dashboard"));
const ListTemplate = React.lazy(() => import("./templates/place-list"));
const MapTemplate = React.lazy(() => import("./templates/map"));
const ReportTemplate = React.lazy(() => import("./templates/report"));

// @ts-ignore
import config from "config";
import { createFeaturesInGeoJSONSource } from "../state/ducks/map-style";
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
import { AppConfig, loadAppConfig } from "../state/ducks/app-config";
import { loadMapConfig } from "../state/ducks/map";
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
import { loadMapStyle } from "../state/ducks/map-style";
import { updatePlacesLoadStatus, loadPlaces } from "../state/ducks/places";
import { loadCustomComponentsConfig } from "../state/ducks/custom-components-config";
import { loadUser } from "../state/ducks/user";

import { hasGroupAbilitiesInDatasets } from "../state/ducks/user";
import { appConfigSelector } from "../state/ducks/app-config";
import {
  loadFeaturedPlacesConfig,
  featuredPlacesConfigPropType,
  featuredPlacesConfigSelector,
} from "../state/ducks/featured-places-config";
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

const Fallback = () => {
  return <Spinner />;
};

const dispatchPropTypes = {
  createFeaturesInGeoJSONSource: PropTypes.func.isRequired,
  loadDatasets: PropTypes.func.isRequired,
  loadPlaces: PropTypes.func.isRequired,
  updatePlacesLoadStatus: PropTypes.func.isRequired,
  updateUIVisibility: PropTypes.func.isRequired,
  loadDatasetsConfig: PropTypes.func.isRequired,
  loadMapConfig: typeof loadMapConfig,
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

type StateProps = {
  appConfig: AppConfig;
  currentTemplate: string;
  datasetsConfig: PropTypes.InferProps<typeof datasetsConfigPropType>;
  datasetSlugs: any[];
  hasAnonAbilitiesInAnyDataset: Function;
  hasGroupAbilitiesInDatasets: Function;
  layout: string;
  featuredPlacesConfig: PropTypes.InferProps<
    typeof featuredPlacesConfigPropType
  >;
  // TODO: shape of this:
  pageExists: Function;
};

type DispatchProps = PropTypes.InferProps<typeof dispatchPropTypes>;

type Props = StateProps &
  DispatchProps &
  // {} means empty interface, because we are using default ReactRouter props.
  RouteComponentProps<{}>;

// 'process' global is injected by Webpack:
declare const process: any;

// TODO: Move this out of App state:
interface Language {
  code: string;
  label: string;
}
interface State {
  currentLanguageCode: string;
  isInitialDataLoaded: boolean;
  isStartPageViewed: boolean;
  defaultLanguage: Language;
  availableLanguages?: Language[];
}

interface ExtendedReactOptions extends i18next.ReactOptions {
  // The official typings seem to be missing this property, added here:
  // https://github.com/i18next/react-i18next/pull/749
  bindI18nStore?: string | false;
}

class App extends React.Component<Props, State> {
  private unlisten?: any;

  state: State = {
    isInitialDataLoaded: false,
    isStartPageViewed: false,
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
          name: authedUser.username,
          ...authedUser,
          // avatar_url and `name` are backup values that can get overidden:
          avatar_url: authedUser.avatar_url || "/static/css/images/user-50.png",
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
      import("../utils/mixpanel").then(mixpanel => {
        mixpanel.Mixpanel.identify(user.id);
        mixpanel.Mixpanel.track("Successful login");
        mixpanel.Mixpanel.people.set({
          name: user.name,
          username: user.username,
          id: user.id,
        });
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
    i18next.use(initReactI18next as ThirdPartyModule).init({
      lng: resolvedConfig.flavor.defaultLanguage.code,
      resources: resourceBundle,
      // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
      react: {
        // Needed to rerender components after results from Translate API are
        // returned.
        bindI18nStore: "added",
      } as ExtendedReactOptions,
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
        });

        // eslint-disable-next-line require-atomic-updates
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
      const targetAttributes = evt.target.attributes;
      const parentAttributes =
        evt.target.parentElement && evt.target.parentElement.attributes;

      if (
        targetAttributes.getNamedItem("rel") &&
        targetAttributes.getNamedItem("rel").value === "internal"
      ) {
        evt.preventDefault();
        this.props.history.push(targetAttributes.getNamedItem("href").value);
      } else if (
        parentAttributes &&
        parentAttributes.getNamedItem("rel") &&
        parentAttributes.getNamedItem("rel").value === "internal"
      ) {
        evt.preventDefault();
        this.props.history.push(parentAttributes.getNamedItem("href").value);
      }
    });

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

    if (!this.state.isInitialDataLoaded) {
      return <Spinner />;
    }
    return (
      <div
        css={{
          overflow:
            // The report template is a special case, and needs `overflow: visible`
            // for PDFs longer than one page to render.
            this.props.currentTemplate === "report"
              ? "visible"
              : this.props.layout === "desktop"
              ? "hidden"
              : "auto",
          width: "100%",
          height: "100%",

          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        <React.Fragment>
          {this.props.appConfig.enableCookieConsent && <CookieConsentBanner />}
          <Switch>
            <Route
              exact
              path="/"
              render={props => {
                return (
                  <React.Suspense fallback={<Fallback />}>
                    <SiteHeader {...headerProps} />
                    <MapTemplate
                      uiConfiguration="map"
                      {...sharedMapTemplateProps}
                      {...props.match}
                    />
                  </React.Suspense>
                );
              }}
            />
            <Route
              exact
              path="/:zoom(\d*\.\d+)/:lat(-?\d*\.\d+)/:lng(-?\d*\.\d+)"
              render={props => {
                return (
                  <React.Suspense fallback={<Fallback />}>
                    <SiteHeader {...headerProps} />
                    <MapTemplate
                      uiConfiguration="map"
                      {...sharedMapTemplateProps}
                      {...props.match}
                    />
                  </React.Suspense>
                );
              }}
            />
            <Route exact path="/sha" component={ShaTemplate} />
            <Route
              exact
              path="/list"
              render={() => (
                <React.Suspense fallback={<Fallback />}>
                  <SiteHeader {...headerProps} />
                  <ListTemplate />
                </React.Suspense>
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
                    <React.Suspense fallback={<Fallback />}>
                      <SiteHeader {...headerProps} />
                      <MapTemplate
                        uiConfiguration="newPlace"
                        {...sharedMapTemplateProps}
                        {...props.match}
                      />
                    </React.Suspense>
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
              render={props => {
                return (
                  <React.Suspense fallback={<Fallback />}>
                    <SiteHeader {...headerProps} />
                    <DashboardTemplate
                      apiRoot={this.props.appConfig.api_root}
                      {...props.match}
                    />
                  </React.Suspense>
                );
              }}
            />
            <Route
              exact
              path="/print-report/:datasetClientSlug/:placeId"
              render={props => {
                return (
                  <React.Suspense fallback={<Fallback />}>
                    <ReportTemplate {...props.match} />
                  </React.Suspense>
                );
              }}
            />
            <Route
              exact
              path="/page/:pageSlug"
              render={props => {
                if (!this.props.pageExists(props.match.params.pageSlug)) {
                  return (
                    <React.Suspense fallback={<Fallback />}>
                      <SiteHeader {...headerProps} />
                      <MapTemplate
                        uiConfiguration="mapWithInvalidRoute"
                        {...sharedMapTemplateProps}
                        {...props.match}
                      />
                    </React.Suspense>
                  );
                }

                return (
                  <React.Suspense fallback={<Fallback />}>
                    <SiteHeader {...headerProps} />
                    <MapTemplate
                      uiConfiguration="customPage"
                      {...sharedMapTemplateProps}
                      {...props.match}
                    />
                  </React.Suspense>
                );
              }}
            />
            <Route
              exact
              path="/:datasetClientSlug/:placeId"
              render={props => {
                return (
                  <React.Suspense fallback={<Fallback />}>
                    <SiteHeader {...headerProps} />
                    <MapTemplate
                      uiConfiguration="placeDetail"
                      {...sharedMapTemplateProps}
                      {...props.match}
                    />
                  </React.Suspense>
                );
              }}
            />
            <Route
              exact
              path="/:datasetClientSlug/:placeId/response/:responseId"
              render={props => {
                return (
                  <React.Suspense fallback={<Fallback />}>
                    <SiteHeader {...headerProps} />
                    <MapTemplate
                      uiConfiguration="placeDetail"
                      {...sharedMapTemplateProps}
                      {...props.match}
                    />
                  </React.Suspense>
                );
              }}
            />
            <Route
              render={props => {
                return (
                  <React.Suspense fallback={<Fallback />}>
                    <SiteHeader {...headerProps} />
                    <MapTemplate
                      uiConfiguration="mapWithInvalidRoute"
                      {...sharedMapTemplateProps}
                      {...props.match}
                    />
                  </React.Suspense>
                );
              }}
            />
          </Switch>
        </React.Fragment>
      </div>
    );
  }
}

type MapseedReduxState = any;

const mapStateToProps = (state: MapseedReduxState): StateProps => ({
  appConfig: appConfigSelector(state),
  currentTemplate: currentTemplateSelector(state),
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
});

const mapDispatchToProps = {
  createFeaturesInGeoJSONSource,
  loadDatasets,
  loadPlaces,
  updateLayout,
  updatePlacesLoadStatus,
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
  connect<StateProps, DispatchProps>(
    mapStateToProps,
    mapDispatchToProps,
  )(App),
);

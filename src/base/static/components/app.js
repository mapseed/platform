import React, { Component, Suspense, createRef } from "react";
import { findDOMNode } from "react-dom";
import PropTypes from "prop-types";
import { connect, Provider } from "react-redux";
import browserUpdate from "browser-update";
import styled from "@emotion/styled";

import SiteHeader from "./organisms/site-header";
import {
  currentTemplateSelector,
  updateLayout,
  layoutSelector,
} from "../state/ducks/ui";
import {
  ShaTemplate,
  DashboardTemplate,
  MapTemplate,
  ListTemplate,
} from "./templates";

import ThemeProvider from "./theme-provider";
import JSSProvider from "./jss-provider";

import mapseedApiClient from "../client/mapseed-api-client";
import { loadPlaces, updatePlacesLoadStatus } from "../state/ducks/places";
import {
  datasetConfigsSelector,
  datasetConfigPropType,
} from "../state/ducks/datasets-config";
import { loadDatasets } from "../state/ducks/datasets";
import { hasGroupAbilitiesInDatasets } from "../state/ducks/user";
import {
  appConfigSelector,
  appConfigPropType,
} from "../state/ducks/app-config";
import {
  storyConfigSelector,
  storyChaptersSelector,
} from "../state/ducks/story-config";
import {
  createFeaturesInGeoJSONSource,
  updateMapViewport,
} from "../state/ducks/map";

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
  overflow: props.layout === "desktop" ? "auto" : "visible",
  width: "100%",
  // 56px === fixed height of header bar
  height: "calc(100% - 56px)",
}));

class App extends Component {
  templateContainerRef = createRef();

  async componentDidMount() {
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
        this.props.router.navigate(
          evt.target.attributes.getNamedItem("href").value,
          { trigger: true },
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

    // Fetch and load Places.
    this.props.updatePlacesLoadStatus("loading");
    const allPlacePagePromises = [];
    await Promise.all(
      this.props.datasetConfigs.map(async config => {
        // Note that the response here is an array of page Promises.
        const response = await mapseedApiClient.place.get({
          datasetUrl: config.url,
          datasetSlug: config.slug,
          clientSlug: config.clientSlug,
          placeParams: {
            // NOTE: this is to include comments/supports while fetching our place models
            include_submissions: true,
            include_tags: true,
          },
          includePrivate: this.props.hasGroupAbilitiesInDatasets({
            abilities: ["can_access_protected"],
            datasetSlugs: [config.slug],
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
              config.slug,
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
  }

  render() {
    return (
      <Provider store={this.props.store}>
        <JSSProvider>
          <ThemeProvider>
            <SiteHeader
              router={this.props.router}
              languageCode={this.props.languageCode}
            />
            <TemplateContainer
              ref={this.templateContainerRef}
              layout={this.props.layout}
            >
              {this.props.currentTemplate === "sha" && <ShaTemplate />}
              {this.props.currentTemplate === "map" && (
                <Suspense fallback={<div>Loading...</div>}>
                  <MapTemplate
                    setMapDimensions={this.setMapDimensions}
                    router={this.props.router}
                    languageCode={this.props.languageCode}
                  />
                </Suspense>
              )}
              {this.props.currentTemplate === "list" && (
                <Suspense fallback={<div>Loading...</div>}>
                  <ListTemplate router={this.props.router} />
                </Suspense>
              )}
              {this.props.currentTemplate === "dashboard" && (
                <Suspense fallback={<div>Loading...</div>}>
                  <DashboardTemplate
                    router={this.props.router}
                    datasetDownloadConfig={
                      this.props.appConfig.dataset_download
                    }
                    apiRoot={this.props.appConfig.api_root}
                  />
                </Suspense>
              )}
            </TemplateContainer>
          </ThemeProvider>
        </JSSProvider>
      </Provider>
    );
  }
}

App.propTypes = {
  appConfig: appConfigPropType.isRequired,
  createFeaturesInGeoJSONSource: PropTypes.func.isRequired,
  currentTemplate: PropTypes.string.isRequired,
  datasetConfigs: datasetConfigPropType,
  hasGroupAbilitiesInDatasets: PropTypes.func.isRequired,
  languageCode: PropTypes.string.isRequired,
  layout: PropTypes.string.isRequired,
  loadDatasets: PropTypes.func.isRequired,
  loadPlaces: PropTypes.func.isRequired,
  router: PropTypes.instanceOf(Backbone.Router),
  store: PropTypes.object.isRequired,
  // TODO: shape of this:
  storyChapters: PropTypes.array.isRequired,
  // TODO: shape of this:
  storyConfig: PropTypes.object.isRequired,
  updateLayout: PropTypes.func.isRequired,
  updateMapViewport: PropTypes.func.isRequired,
  updatePlacesLoadStatus: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  appConfig: appConfigSelector(state),
  currentTemplate: currentTemplateSelector(state),
  datasetConfigs: datasetConfigsSelector(state),
  hasGroupAbilitiesInDatasets: ({ abilities, datasetSlugs, submissionSet }) =>
    hasGroupAbilitiesInDatasets({
      state,
      abilities,
      datasetSlugs,
      submissionSet,
    }),
  layout: layoutSelector(state),
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
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App);

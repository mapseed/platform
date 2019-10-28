/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import { useSelector } from "react-redux";

import PlaceForm from "./place-form";
import { LoadingBar } from "../atoms/imagery";
import Util from "../../js/utils.js";
import { Mixpanel } from "../../utils/mixpanel";
import {
  FormModule,
  placeFormSelector,
  PlaceForm as MapseedPlaceForm,
} from "../../state/ducks/forms";
import { datasetClientSlugSelector } from "../../state/ducks/datasets-config";
import { hasGroupAbilitiesInDatasets } from "../../state/ducks/user";
import mapseedApiClient from "../../client/mapseed-api-client";

const NewPlaceForm = props => {
  const placeForm: MapseedPlaceForm = useSelector(placeFormSelector);
  //const clientSlug = useSelector(state =>
  //  datasetClientSlugSelector(state, placeForm.slug),
  //);
  const includePrivate = useSelector(state =>
    hasGroupAbilitiesInDatasets({
      state,
      abilities: ["can_access_protected"],
      datasets: [placeForm.dataset],
      submissionSet: "places",
    }),
  );
  const onSubmit = React.useCallback(
    async placeData => {
      Util.log("USER", "new-place", "submit-place-btn-click");
      Mixpanel.track("Clicked place form submit");
      console.log("placeData", placeData)

      // Run geospatial analyses:
      //if (
      //  this.selectedCategoryConfig.geospatialAnalysis &&
      //  attrs.geometry.type === "Point"
      //) {
      //  const geospatialAnalysisAttrs = await geoAnalysisClient.analyze({
      //    analyses: this.selectedCategoryConfig.geospatialAnalysis,
      //    inputGeometry: attrs.geometry,
      //  });

      //  if (geospatialAnalysisAttrs) {
      //    // eslint-disable-next-line require-atomic-updates
      //    attrs = {
      //      ...attrs,
      //      ...geospatialAnalysisAttrs,
      //    };
      //  }
      //}

      const { dataset } = placeForm;
      const placeResponse = await mapseedApiClient.place.create({
        dataset,
        placeData,
        //clientSlug,
        includePrivate,
      });

      // Save attachments.
      //if (this.attachments.length) {
      //  await Promise.all(
      //    this.attachments.map(async attachment => {
      //      const attachmentResponse = await mapseedApiClient.attachments.create(
      //        {
      //          placeUrl: placeResponse.url,
      //          attachment,
      //          includePrivate: this.props.hasGroupAbilitiesInDatasets({
      //            abilities: ["can_access_protected"],
      //            datasetSlugs: [this.props.datasetSlug],
      //            submissionSet: "places",
      //          }),
      //        },
      //      );
      //      if (attachmentResponse) {
      //        placeResponse.attachments.push(attachmentResponse);
      //        Util.log("USER", "dataset", "successfully-add-attachment");
      //      } else {
      //        alert("Oh dear. It looks like an attachment didn't save.");
      //        Util.log("USER", "place", "fail-to-add-attachment");
      //      }
      //    }),
      //  );
      //}

      //// Generate a PDF for the user if configured to do so.
      //if (this.props.datasetReportSelector(this.props.datasetSlug)) {
      //  mapseedPDFServiceClient.getPDF({
      //    url: `${window.location.protocol}//${
      //      window.location.host
      //    }/print-report/${this.props.datasetClientSlugSelector(
      //      this.props.datasetSlug,
      //    )}/${placeResponse.id}`,
      //    filename: this.props.datasetReportSelector(this.props.datasetSlug)
      //      .filename,
      //    jwtPublic: placeResponse.jwt_public,
      //  });
      //}

      // TODO: post-submission routing.

      //if (!placeResponse) {
      //  alert("Oh dear. It looks like that didn't save. Please try again.");
      //  Util.log("USER", "place", "fail-to-create-place");
      //  return;
      //}
      //if (placeResponse.isOffline) {
      //  alert(
      //    "No internet connection detected. Your submission may not be successful until you are back online.",
      //  );
      //  Util.log("USER", "place", "submitted-offline-place");
      //  this.props.history.push("/");
      //  return;
      //}
    },
    [includePrivate],
  );

  return (
    <React.Fragment>
      <PlaceForm onSubmit={onSubmit} placeForm={placeForm} />
    </React.Fragment>
  );
};

export default NewPlaceForm;

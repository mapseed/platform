import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { FormikValues } from "formik";

import PlaceForm from "./place-form";
import Util from "../../js/utils.js";
import { Mixpanel } from "../../utils/mixpanel";
import {
  placeFormSelector,
  PlaceForm as MapseedPlaceForm,
  newPlaceFormInitialValuesSelector,
} from "../../state/ducks/forms";
import { hasGroupAbilitiesInDatasets } from "../../state/ducks/user";
import mapseedApiClient from "../../client/mapseed-api-client";
import { datasetPlaceConfirmationModalSelector } from "../../state/ducks/datasets-config";
import InfoModal from "./info-modal";
import { LoadingBar } from "../atoms/imagery";
import { createPlace } from "../../state/ducks/places";
import { createFeaturesInGeoJSONSource } from "../../state/ducks/map-style";
import { toClientGeoJSONFeature } from "../../utils/place-utils";

type InfoModal = {
  isOpen: boolean;
  header?: string;
  body: string[];
  routeOnClose: string | null;
};

const NewPlaceForm = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const initialValues: FormikValues = useSelector(
    newPlaceFormInitialValuesSelector,
  );
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [infoModalState, setInfoModalState] = React.useState<InfoModal>({
    isOpen: false,
    header: "",
    body: [],
    routeOnClose: null,
  });
  const placeForm: MapseedPlaceForm = useSelector(placeFormSelector);
  const placeConfirmationModal = useSelector(state =>
    datasetPlaceConfirmationModalSelector(
      state,
      placeForm.dataset.split("/").pop(),
    ),
  );
  const includePrivate = useSelector(state =>
    hasGroupAbilitiesInDatasets({
      state,
      abilities: ["can_access_protected"],
      datasets: [placeForm.dataset],
      submissionSet: "places",
    }),
  );
  const onSubmit = React.useCallback(
    async ({ data, attachments }) => {
      Util.log("USER", "new-place", "submit-place-btn-click");
      Mixpanel.track("Clicked place form submit");
      setIsSubmitting(true);

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
      const datasetSlug = dataset.split("/").pop();

      // Save Place.
      const placeResponse = await mapseedApiClient.place.create({
        dataset,
        placeData: data,
        includePrivate,
      });

      if (!placeResponse) {
        alert("Oh dear. It looks like that didn't save. Please try again.");
        Util.log("USER", "place", "fail-to-create-place");

        return;
      }

      if (placeResponse.isOffline) {
        alert(
          "No internet connection detected. Your submission may not be successful until you are back online.",
        );
        Util.log("USER", "place", "submitted-offline-place");
        history.push("/");

        return;
      }

      // Save Place attachments.
      if (attachments.length > 0) {
        await Promise.all(
          attachments.map(async attachment => {
            const attachmentResponse = await mapseedApiClient.attachments.create(
              {
                placeUrl: placeResponse.url,
                attachment,
                includePrivate,
              },
            );

            if (attachmentResponse) {
              placeResponse.attachments.push(attachmentResponse);
              Util.log("USER", "dataset", "successfully-add-attachment");
            } else {
              alert("Oh dear. It looks like an attachment didn't save.");
              Util.log("USER", "place", "fail-to-add-attachment");
            }
          }),
        );
      }

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

      // Post-submission routing:
      const {
        privateNonAdmin,
        privateAdmin,
        nonPrivate,
      } = placeConfirmationModal;
      if (
        placeResponse.private // TEMP
        //this.props.hasGroupAbilitiesInDatasets({
        //  abilities: ["can_access_protected"],
        //  submissionSet: "places",
        //  datasetSlugs: [datasetSlug],
        //})
      ) {
        // Private submission made by an administrator.
        if (privateAdmin) {
          setIsSubmitting(false);
          setInfoModalState({
            isOpen: true,
            header: privateAdmin.header,
            body: privateAdmin.body,
            routeOnClose: `place/${placeResponse.id}`,
          });
        } else {
          history.push(`place/${placeResponse.id}`);
        }

        createPlace(placeResponse);
        dispatch(
          createFeaturesInGeoJSONSource(datasetSlug, [
            toClientGeoJSONFeature(placeResponse),
          ]),
        );
      } else if (placeResponse.private) {
        // Private submission made by a non-admin.
        if (privateNonAdmin) {
          setIsSubmitting(false);
          setInfoModalState({
            isOpen: true,
            header: privateNonAdmin.header,
            body: privateNonAdmin.body,
            routeOnClose: "/",
          });
        } else {
          history.push("/");
        }
      } else {
        // Public ("non-private") submission.
        if (nonPrivate) {
          setIsSubmitting(false);
          setInfoModalState({
            isOpen: true,
            header: nonPrivate.header,
            body: nonPrivate.body,
            routeOnClose: `place/${placeResponse.id}`,
          });
        } else {
          history.push(`place/${placeResponse.id}`);
        }

        dispatch(createPlace(placeResponse));
        createFeaturesInGeoJSONSource(
          // "sourceId" and a place's datasetSlug are the same thing.
          datasetSlug,
          [toClientGeoJSONFeature(placeResponse)],
        );
      }
    },
    [includePrivate, placeForm, history],
  );

  const { isOpen, header, body, routeOnClose } = infoModalState;
  return (
    <React.Fragment>
      <InfoModal
        isModalOpen={isOpen}
        header={header}
        body={body}
        onClose={() => {
          setInfoModalState({ ...infoModalState, isOpen: false });
          routeOnClose && history.push(routeOnClose);
        }}
      />
      {isSubmitting && <LoadingBar />}
      <PlaceForm
        onSubmit={onSubmit}
        placeForm={placeForm}
        initialValues={initialValues}
      />
    </React.Fragment>
  );
};

export default NewPlaceForm;

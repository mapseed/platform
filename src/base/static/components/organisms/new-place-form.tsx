import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { FormikValues } from "formik";

import PlaceForm from "./place-form";
import { Mixpanel } from "../../utils/mixpanel";
import {
  placeFormSelector,
  PlaceForm as MapseedPlaceForm,
  newPlaceFormInitialValuesSelector,
} from "../../state/ducks/forms";
import { datasetsWithAccessProtectedPlacesAbilitySelector } from "../../state/ducks/user";
import mapseedApiClient from "../../client/mapseed-api-client";
import { datasetPlaceConfirmationModalSelector } from "../../state/ducks/datasets";
import InfoModal from "./info-modal";
import { LoadingBar } from "../atoms/imagery";
import { createPlace } from "../../state/ducks/places";
import { updateMapInteractionState } from "../../state/ducks/map";
import { toClientGeoJSONFeature } from "../../utils/place-utils";
import { mapViewportSelector } from "../../state/ducks/map";
import {
  updateUIVisibility,
  updateSpotlightMaskVisibility,
} from "../../state/ducks/ui";

type InfoModal = {
  isOpen: boolean;
  header?: string;
  body: string[];
  routeOnClose: string | null;
};

type NewPlaceFormProps = {
  contentPanelInnerContainerRef: React.RefObject<HTMLDivElement>;
  formId?: string;
};

const NewPlaceForm = (props: NewPlaceFormProps) => {
  const mapViewport = useSelector(mapViewportSelector);
  const history = useHistory();
  const dispatch = useDispatch();
  const initialValues: FormikValues = useSelector((state: any) =>
    newPlaceFormInitialValuesSelector(state, props.formId),
  );
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [infoModalState, setInfoModalState] = React.useState<InfoModal>({
    isOpen: false,
    header: "",
    body: [],
    routeOnClose: null,
  });
  const placeForm: MapseedPlaceForm = useSelector((state: any) =>
    placeFormSelector(state, props.formId),
  );
  const includePrivate =
    placeForm &&
    !!useSelector(datasetsWithAccessProtectedPlacesAbilitySelector).find(
      ({ url }) => url === placeForm.dataset,
    );
  const placeConfirmationModal =
    placeForm &&
    useSelector(state =>
      datasetPlaceConfirmationModalSelector(state, placeForm.dataset),
    );

  React.useEffect(() => {
    dispatch(updateUIVisibility("mapCenterpoint", true));
  }, [dispatch]);

  React.useEffect(() => {
    if (!placeForm) {
      history.push("/");
    }

    return;
  }, [placeForm, history]);

  const onSubmit = React.useCallback(
    async ({ data, attachments }) => {
      Mixpanel.track("Clicked place form submit");
      setIsSubmitting(true);

      // TODO
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
      const { longitude, latitude } = mapViewport;
      const geometry = {
        type: "Point",
        coordinates: [longitude, latitude],
      };

      // Save Place.
      const placeResponse = await mapseedApiClient.place.create({
        dataset,
        placeData: { ...data, geometry },
        includePrivate,
      });

      if (!placeResponse) {
        alert("Oh dear. It looks like that didn't save. Please try again.");

        return;
      }

      if (placeResponse.isOffline) {
        alert(
          "No internet connection detected. Your submission may not be successful until you are back online.",
        );
        history.push("/");

        return;
      }

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
            } else {
              alert("Oh dear. It looks like an attachment didn't save.");
            }
          }),
        );
      }

      // TODO
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
            routeOnClose: `/place/${placeResponse.id}`,
          });
        } else {
          history.push(`/place/${placeResponse.id}`);
        }

        dispatch(createPlace(placeResponse));
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
            routeOnClose: `/place/${placeResponse.id}`,
          });
        } else {
          history.push(`/place/${placeResponse.id}`);
        }

        dispatch(createPlace(placeResponse));
      }
    },
    [placeForm, history, mapViewport, dispatch, placeConfirmationModal],
  );

  const handleChangeStage = React.useCallback(
    currentStage => {
      // Show the drag map overlay on the final stage or any stage configured
      // to validate input geometry.
      if (
        currentStage === placeForm.stages.length - 1 ||
        placeForm.stages[currentStage - 1].validateGeometry
      ) {
        dispatch(updateSpotlightMaskVisibility(true));
        dispatch(
          updateMapInteractionState({
            isMapDraggedOrZoomedByUser: false,
          }),
        );
      }
    },
    [placeForm, dispatch],
  );

  const { isOpen, header, body, routeOnClose } = infoModalState;

  if (!placeForm) {
    return null;
  }

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
        contentPanelInnerContainerRef={props.contentPanelInnerContainerRef}
        onSubmit={onSubmit}
        placeForm={placeForm}
        initialValues={initialValues}
        onChangeStage={handleChangeStage}
      />
    </React.Fragment>
  );
};

export default NewPlaceForm;

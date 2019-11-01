/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { withTranslation, WithTranslation } from "react-i18next";
import Typography from "@material-ui/core/Typography";
import { Formik, FormikValues } from "formik";

import PlaceForm from "./place-form";
import { Mixpanel } from "../../utils/mixpanel";
import {
  placeFormSelector,
  PlaceForm as MapseedPlaceForm,
  formFieldsSelector,
} from "../../state/ducks/forms";
import {
  //hasGroupAbilitiesInDatasets,
  hasAdminAbilities as hasAdminAbilitiesInDataset,
} from "../../state/ducks/user";
import mapseedApiClient from "../../client/mapseed-api-client";
import { LoadingBar } from "../atoms/imagery";
import { removePlace, updatePlace, Place } from "../../state/ducks/places";
import {
  removeFeatureInGeoJSONSource,
  updateFocusedGeoJSONFeatures,
  updateFeatureInGeoJSONSource,
} from "../../state/ducks/map-style";
import { toClientGeoJSONFeature } from "../../utils/place-utils";
import { EditorButton } from "../atoms/buttons";

type PlaceDetailEditorProps = {
  place: Place;
} & WithTranslation;

const getInitialValues = (formFields, place) =>
  formFields.reduce((initialValues, { key }) => {
    return {
      ...initialValues,
      [key]: place[key] || "",
    };
  }, {});

const PlaceDetailEditor = ({ place, t }: PlaceDetailEditorProps) => {
  const baseFormRef = React.useRef<Formik<FormikValues>>(null);
  const dispatch = useDispatch();
  const history = useHistory();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const placeForm: MapseedPlaceForm = useSelector(placeFormSelector);
  const hasAdminAbilities = useSelector(state =>
    hasAdminAbilitiesInDataset(state, place.dataset.split("/").pop() as string),
  );
  const formFields = useSelector(formFieldsSelector);
  const [isFormDirty, setIsFormDirty] = React.useState<boolean>(false);
  const initialValues = getInitialValues(formFields, place);
  //const includePrivate = useSelector(state =>
  //  hasGroupAbilitiesInDatasets({
  //    state,
  //    abilities: ["can_access_protected"],
  //    datasets: [placeForm.dataset],
  //    submissionSet: "places",
  //  }),
  //);

  const onSubmit = React.useCallback(
    async ({ data, attachments }) => {
      const { id, url: placeUrl, dataset, geometry } = place;
      Mixpanel.track("Updating Place", {
        placeUrl,
      });

      setIsSubmitting(true);

      // TODO
      // Replace image data in rich text fields with placeholders built from each
      // image's name.
      // TODO: This logic is better suited for the FormField component,
      // perhaps in an onSave hook.
      //this.categoryConfig.fields
      //  .filter(field => field.type === "rich_textarea")
      //  .forEach(field => {
      //    attrs[field.name] = extractEmbeddedImages(attrs[field.name]);
      //  });

      const placeResponse = await mapseedApiClient.place.update({
        placeUrl,
        placeData: {
          ...place,
          ...data,
          geometry,
        },
        hasAdminAbilities,
      });

      if (placeResponse) {
        // TODO
        //// Save attachments.
        //if (this.attachments.length) {
        //  await Promise.all(
        //    this.attachments.map(async attachment => {
        //      const attachmentResponse = await mapseedApiClient.attachments.create(
        //        {
        //          placeUrl: placeResponse.url,
        //          attachment,
        //          includePrivate: this.props.hasGroupAbilitiesInDatasets({
        //            abilities: ["can_access_protected"],
        //            datasetSlugs: [this.props.place.datasetSlug],
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

        dispatch(updatePlace(placeResponse));
        dispatch(
          updateFeatureInGeoJSONSource({
            sourceId: dataset.split("/").pop() as string,
            featureId: id,
            feature: toClientGeoJSONFeature(placeResponse),
          }),
        );

        // Update the focused feature.
        const { geometry, ...rest } = placeResponse;
        dispatch(
          updateFocusedGeoJSONFeatures([
            {
              type: "Feature",
              geometry: {
                type: geometry.type,
                coordinates: geometry.coordinates,
              },
              properties: rest,
            },
          ]),
        );

        setIsSubmitting(false);
        setIsFormDirty(false);
        //this.props.updateEditModeToggled(false);
        //jumpTo({
        //  contentPanelInnerContainerRef: this.props
        //    .contentPanelInnerContainerRef,
        //  scrollPositon: 0,
        //  layout: this.props.layout,
        //});
      } else {
        alert("Oh dear. It looks like that didn't save. Please try again.");
      }
      //} else {
      //  this.props.onRequestEnd();
      //  this.setState({
      //    formValidationErrors: newValidationErrors,
      //    showValidityStatus: true,
      //    isNetworkRequestInFlight: false,
      //  });
      //  jumpTo({
      //    contentPanelInnerContainerRef: this.props.contentPanelInnerContainerRef,
      //    scrollPositon: 0,
      //    layout: this.props.layout,
      //  });
      //  this.props.setPlaceRequestType(null);
      //}
    },
    [dispatch, hasAdminAbilities, place],
  );

  const onClickRemovePlace = React.useCallback(async () => {
    const { id, url: placeUrl, dataset } = place;
    setIsSubmitting(true);

    Mixpanel.track("Removing place", {
      placeUrl,
    });

    const response = await mapseedApiClient.place.update({
      placeUrl,
      placeData: {
        ...place,
        visible: false,
      },
    });

    if (response) {
      dispatch(removePlace(id));
      dispatch(
        removeFeatureInGeoJSONSource(dataset.split("/").pop() as string, id),
      );
      history.push("/");
    } else {
      alert("Oh dear. It looks like that didn't save. Please try again.");
    }
  }, [dispatch, place, history]);

  const onClickUpdatePlace = React.useCallback(() => {
    baseFormRef.current && baseFormRef.current.submitForm();
  }, [baseFormRef]);

  const handleChange = React.useCallback(() => {
    setIsFormDirty(true);
  }, [setIsFormDirty]);

  return (
    <React.Fragment>
      {isSubmitting && <LoadingBar />}
      <div
        css={css`
          z-index: 100;
          position: absolute;
          top: 15px;
          right: 15px;
        `}
      >
        <EditorButton
          label={t("removeBtn")}
          type="remove"
          onClick={() => {
            if (confirm(t("confirmRemove"))) {
              onClickRemovePlace();
            }
          }}
        />
        <EditorButton
          label={t("saveBtn")}
          type="save"
          onClick={onClickUpdatePlace}
        />
        <Typography
          style={{
            marginRight: "12px",
            lineHeight: "1.8rem",
            fontStyle: "italic",
            color: "#888",
          }}
          variant="caption"
          component="span"
        >
          {isFormDirty
            ? t("placeFormEditorUnsavedChanges", "Unsaved changes")
            : t("placeFormEditorNoUnsavedChanges", "All changes saved")}
        </Typography>
      </div>
      <PlaceForm
        css={css`
          opacity: ${isSubmitting ? 0.4 : 1};
        `}
        onSubmit={onSubmit}
        handleChange={handleChange}
        placeForm={placeForm}
        initialValues={initialValues}
        baseFormRef={baseFormRef}
      />
    </React.Fragment>
  );
};

export default withTranslation("PlaceDetailEditor")(PlaceDetailEditor);

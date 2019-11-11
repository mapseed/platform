/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { withTranslation, WithTranslation } from "react-i18next";
import Typography from "@material-ui/core/Typography";

import PlaceForm from "./place-form";
import { Mixpanel } from "../../utils/mixpanel";
import {
  placeFormSelector,
  PlaceForm as MapseedPlaceForm,
  formFieldsSelector,
} from "../../state/ducks/forms";
import {
  hasGroupAbilitiesInDatasets,
  hasAdminAbilities as hasAdminAbilitiesInDataset,
} from "../../state/ducks/user";
import mapseedApiClient from "../../client/mapseed-api-client";
import {
  removePlace,
  updatePlace,
  removePlaceAttachment,
  Place,
} from "../../state/ducks/places";
import {
  removeFeatureInGeoJSONSource,
  updateFocusedGeoJSONFeatures,
  updateFeatureInGeoJSONSource,
} from "../../state/ducks/map-style";
import { updateMapInteractionState } from "../../state/ducks/map";
import { toClientGeoJSONFeature } from "../../utils/place-utils";
import { EditorButton } from "../atoms/buttons";
import { updateSpotlightMaskVisibility } from "../../state/ducks/ui";
import CoverImage from "../molecules/cover-image";

type PlaceDetailEditorProps = {
  place: Place;
  contentPanelInnerContainerRef: React.RefObject<HTMLDivElement>;
} & WithTranslation;

const getInitialValues = (formFields, place) =>
  formFields.reduce((initialValues, { key }) => {
    return {
      ...initialValues,
      [key]: place[key] || "",
    };
  }, {});

const PlaceDetailEditor = ({
  place,
  t,
  contentPanelInnerContainerRef,
}: PlaceDetailEditorProps) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [isTriggeringSubmit, setIsTriggeringSubmit] = React.useState<boolean>(
    false,
  );
  const [isFormDirty, setIsFormDirty] = React.useState<boolean>(false);
  const placeForm: MapseedPlaceForm = useSelector(placeFormSelector);
  const hasAdminAbilities = useSelector(state =>
    hasAdminAbilitiesInDataset(state, place.dataset.split("/").pop() as string),
  );
  const formFields = useSelector(formFieldsSelector);
  const initialValues = getInitialValues(formFields, place);
  React.useEffect(() => {
    dispatch(updateSpotlightMaskVisibility(true));

    // Prevent BaseForm from performing a drag map validation check:
    dispatch(updateMapInteractionState({ isMapDraggedOrZoomedByUser: true }));
  }, [dispatch]);
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
      const { id, url: placeUrl, dataset, geometry } = place;
      Mixpanel.track("Updating Place", {
        placeUrl,
      });

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

      setIsTriggeringSubmit(false);

      if (placeResponse) {
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

        setIsFormDirty(false);
      } else {
        alert("Oh dear. It looks like that didn't save. Please try again.");
      }
    },
    [dispatch, hasAdminAbilities, place, includePrivate],
  );

  const onClickUpdatePlace = React.useCallback(() => {
    setIsTriggeringSubmit(true);
  }, [setIsTriggeringSubmit]);

  const { id, url: placeUrl, dataset } = place;
  const onClickRemovePlace = React.useCallback(async () => {
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

    setIsTriggeringSubmit(false);

    if (response) {
      dispatch(removePlace(id));
      dispatch(
        removeFeatureInGeoJSONSource(dataset.split("/").pop() as string, id),
      );
      history.push("/");
    } else {
      alert("Oh dear. It looks like that didn't save. Please try again.");
    }
  }, [dispatch, place, history, id, placeUrl, dataset]);

  const handleChange = React.useCallback(() => {
    setIsFormDirty(true);
  }, [setIsFormDirty]);

  const onValidationError = React.useCallback(() => {
    setIsTriggeringSubmit(false);
  }, [setIsTriggeringSubmit]);

  const onClickRemoveAttachment = React.useCallback(
    async attachmentId => {
      const response = mapseedApiClient.attachments.delete(
        placeUrl,
        attachmentId,
      );

      if (response) {
        dispatch(removePlaceAttachment(id, attachmentId));
      } else {
        // TODO: reset relevant form state to re-enable form submission...
        alert("Oh dear. It looks like that didn't save. Please try again.");
      }
    },
    [dispatch, id, placeUrl],
  );

  return (
    <React.Fragment>
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
      {place.attachments
        .filter(({ type }) => type === "CO")
        .map(({ file, id }) => (
          <CoverImage
            key={file}
            isEditable={true}
            imageUrl={file}
            attachmentId={id}
            onClickRemove={onClickRemoveAttachment}
          />
        ))}
      <PlaceForm
        onSubmit={onSubmit}
        handleChange={handleChange}
        placeForm={placeForm}
        initialValues={initialValues}
        contentPanelInnerContainerRef={contentPanelInnerContainerRef}
        isTriggeringSubmit={isTriggeringSubmit}
        onValidationError={onValidationError}
      />
    </React.Fragment>
  );
};

export default withTranslation("PlaceDetailEditor")(PlaceDetailEditor);

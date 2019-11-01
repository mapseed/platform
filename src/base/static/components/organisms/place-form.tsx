import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Formik, FormikValues } from "formik";

import BaseForm from "./base-form";
import { MapseedAttachment, PlaceForm } from "../../state/ducks/forms";
import { mapViewportSelector, MapViewport } from "../../state/ducks/map";
import {
  layerGroupsSelector,
  updateLayerGroupVisibility,
  LayerGroups,
} from "../../state/ducks/map-style";
import eventEmitter from "../../utils/event-emitter";
import { PlaceDataBlob } from "../../models/place";

type MapseedPlaceFormProps = {
  onSubmit: ({
    data,
    attachments,
  }: {
    data: PlaceDataBlob;
    attachments: MapseedAttachment[];
  }) => void;
  placeForm: PlaceForm;
  initialValues: FormikValues;
  baseFormRef?: React.RefObject<Formik<FormikValues>>;
  handleChange?: (event: React.FormEvent<HTMLFormElement>) => void;
};

const layerGroupsEqualityComparator = (a, b) =>
  a.allIds.length === b.allIds.length;

const MapseedPlaceForm = ({
  onSubmit,
  placeForm,
  initialValues,
  baseFormRef,
  handleChange,
}: MapseedPlaceFormProps) => {
  const mapViewport: MapViewport = useSelector(mapViewportSelector);

  // NOTE: Attachments are managed here (instead of in BaseForm) since not all
  // forms may be sent to an endpoint capable of handling attachments.
  const [attachments, setAttachments] = React.useState<MapseedAttachment[]>([]);
  const dispatch = useDispatch();
  const layerGroups: LayerGroups = useSelector(
    layerGroupsSelector,
    layerGroupsEqualityComparator,
  );
  const onChangeStage = React.useCallback(
    currentStage => {
      const stageViewport: MapViewport | undefined =
        placeForm.stages[currentStage].mapViewport;
      stageViewport && eventEmitter.emit("setMapViewport", stageViewport);
      const stageLayerGroups = new Set(
        placeForm.stages[currentStage].visibleLayerGroups,
      );

      if (stageLayerGroups.size > 0) {
        // Set layer visibilities for this stage.
        layerGroups.allIds.forEach(id => {
          dispatch(updateLayerGroupVisibility(id, !!stageLayerGroups.has(id)));
        });
      }
    },
    [placeForm, dispatch, layerGroups],
  );
  const preprocessSubmission = React.useCallback(
    values => {
      const { longitude, latitude } = mapViewport;
      // TODO: this should be moved to NewPlaceForm?
      const geometry = {
        type: "Point",
        coordinates: [longitude, latitude],
      };

      onSubmit({
        data: {
          ...values,
          geometry,
        },
        attachments,
      });
    },
    [mapViewport, onSubmit, attachments],
  );

  return (
    <BaseForm
      onSubmit={preprocessSubmission}
      initialValues={initialValues}
      form={placeForm}
      onChangeStage={onChangeStage}
      attachments={attachments}
      setAttachments={setAttachments}
      baseFormRef={baseFormRef}
      handleChange={handleChange}
    />
  );
};

export default MapseedPlaceForm;

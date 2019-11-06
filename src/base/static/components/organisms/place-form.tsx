import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Formik, FormikValues, FormikConfig } from "formik";

import BaseForm from "./base-form";
import { MapseedAttachment, PlaceForm } from "../../state/ducks/forms";
import {
  layerGroupsSelector,
  updateLayerGroupVisibility,
  LayerGroups,
} from "../../state/ducks/map-style";
import eventEmitter from "../../utils/event-emitter";
import { PlaceDataBlob } from "../../models/place";
import { updateSpotlightMaskVisibility } from "../../state/ducks/ui";
import { updateMapInteractionState, MapViewport } from "../../state/ducks/map";
import { layoutSelector, Layout } from "../../state/ducks/ui";
import { jumpTo } from "../../utils/scroll-helpers";

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
  baseFormRef?: React.RefObject<FormikConfig<FormikValues>>;
  handleChange?: (event: React.FormEvent<HTMLFormElement>) => void;
  contentPanelInnerContainerRef: React.RefObject<HTMLDivElement>;
};

const layerGroupsEqualityComparator = (a, b) =>
  a.allIds.length === b.allIds.length;

const MapseedPlaceForm = ({
  onSubmit,
  placeForm,
  initialValues,
  baseFormRef,
  handleChange,
  contentPanelInnerContainerRef,
}: MapseedPlaceFormProps) => {
  const layout: Layout = useSelector(layoutSelector);
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
      jumpTo({
        contentPanelInnerContainerRef,
        scrollPositon: 0,
        layout,
      });

      const stageViewport: MapViewport | undefined =
        placeForm.stages[currentStage].mapViewport;
      // TODO: Should the viewport transition in editor mode??
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
    [placeForm, dispatch, layerGroups, contentPanelInnerContainerRef, layout],
  );
  const preprocessSubmission = React.useCallback(
    values => {
      onSubmit({
        data: values,
        attachments,
      });
    },
    [onSubmit, attachments],
  );
  const handleValidationError = React.useCallback(() => {
    jumpTo({
      contentPanelInnerContainerRef,
      scrollPositon: 0,
      layout,
    });
  }, [contentPanelInnerContainerRef, layout]);

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
      onValidationError={handleValidationError}
    />
  );
};

export default MapseedPlaceForm;

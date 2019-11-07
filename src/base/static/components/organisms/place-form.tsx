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
import { MapViewport } from "../../state/ducks/map";
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
  isTriggeringSubmit?: boolean;
  placeForm: PlaceForm;
  initialValues: FormikValues;
  handleChange?: (event: React.FormEvent<HTMLFormElement>) => void;
  contentPanelInnerContainerRef: React.RefObject<HTMLDivElement>;
  onValidationError?: () => void;
  onChangeStage?: (newStage: number) => void;
};

const layerGroupsEqualityComparator = (a, b) =>
  a.allIds.length === b.allIds.length;

const MapseedPlaceForm = ({
  onSubmit,
  isTriggeringSubmit,
  placeForm,
  initialValues,
  handleChange,
  contentPanelInnerContainerRef,
  onValidationError = () => null,
  onChangeStage = () => null,
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
  const handleChangeStage = React.useCallback(
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

      onChangeStage(currentStage);
    },
    [
      placeForm,
      dispatch,
      layerGroups,
      contentPanelInnerContainerRef,
      layout,
      onChangeStage,
    ],
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

    onValidationError();
  }, [contentPanelInnerContainerRef, layout, onValidationError]);

  return (
    <BaseForm
      onSubmit={preprocessSubmission}
      initialValues={initialValues}
      isTriggeringSubmit={isTriggeringSubmit}
      form={placeForm}
      onChangeStage={handleChangeStage}
      attachments={attachments}
      setAttachments={setAttachments}
      handleChange={handleChange}
      onValidationError={handleValidationError}
    />
  );
};

export default MapseedPlaceForm;

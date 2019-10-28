import * as React from "react";
import { useSelector, useDispatch } from "react-redux";

import BaseForm from "./base-form";
import { placeFormInitialValuesSelector } from "../../state/ducks/forms";
import { mapViewportSelector, MapViewport } from "../../state/ducks/map";
import {
  layerGroupsSelector,
  updateLayerGroupVisibility,
  LayerGroups,
} from "../../state/ducks/map-style";
import eventEmitter from "../../utils/event-emitter";

const layerGroupsEqualityComparator = (a, b) =>
  a.allIds.length === b.allIds.length;

const MapseedPlaceForm = ({ onSubmit, placeForm }) => {
  const mapViewport: MapViewport = useSelector(mapViewportSelector);
  const initialValues = useSelector(placeFormInitialValuesSelector);
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
        ...values,
        geometry,
      });
    },
    [mapViewport, onSubmit],
  );

  return (
    <BaseForm
      onSubmit={preprocessSubmission}
      initialValues={initialValues}
      form={placeForm}
      onChangeStage={onChangeStage}
      isSubmitting={false}
    />
  );
};

export default MapseedPlaceForm;

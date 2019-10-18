/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import { useSelector, useDispatch } from "react-redux";
import { Formik } from "formik";

import BaseForm from "./base-form";
import FormStageControlBar from "../molecules/form-stage-control-bar";
import {
  PlaceForm,
  FormModule,
  placeFormSelector,
} from "../../state/ducks/forms";
import { MapViewport } from "../../state/ducks/map";
import {
  layerGroupsSelector,
  updateLayerGroupVisibility,
  LayerGroups,
} from "../../state/ducks/map-style";
import { layoutSelector, Layout } from "../../state/ducks/ui";
import eventEmitter from "../../utils/event-emitter";

const calculateInitialValues = (form: PlaceForm) =>
  form.stages
    .reduce(
      (formModules, stage) => formModules.concat(stage.modules),
      [] as FormModule[],
    )
    .reduce((initialValues, { key, defaultValue }) => {
      return {
        ...initialValues,
        // TODO: other default value use cases:
        //   - load from form state dump
        //   - editor
        [key]: defaultValue || "",
      };
    }, {});

const layerGroupsEqualityComparator = (a, b) =>
  a.allIds.length === b.allIds.length;

const MapseedPlaceForm = () => {
  const [currentStage, setCurrentStage] = React.useState<number>(0);
  const layout: Layout = useSelector(layoutSelector);
  const dispatch = useDispatch();
  const placeForm: PlaceForm = useSelector(placeFormSelector);
  const layerGroups: LayerGroups = useSelector(
    layerGroupsSelector,
    layerGroupsEqualityComparator,
  );
  const onClickAdvanceStage = React.useCallback(() => {
    if (currentStage < placeForm.stages.length - 1) {
      setCurrentStage(currentStage + 1);
    }
  }, [currentStage, placeForm]);
  const onClickRetreatStage = React.useCallback(() => {
    if (currentStage > 0) {
      setCurrentStage(currentStage - 1);
    }
  }, [currentStage]);
  React.useEffect(() => {
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
  }, [currentStage, dispatch, placeForm, layerGroups]);
  const onClickSkipStage = stageId => setCurrentStage(stageId - 1);

  return (
    <div
      css={css`
        margin-bottom: ${placeForm.stages.length > 1 ? "112px" : 0};
      `}
    >
      <Formik
        validateOnChange={false}
        validateOnBlur={true}
        onSubmit={() => null}
        initialValues={calculateInitialValues(placeForm)}
        render={formikProps => (
          <BaseForm
            modules={placeForm.stages[currentStage].modules}
            onClickSkipStage={onClickSkipStage}
            {...formikProps}
          />
        )}
      />

      <FormStageControlBar
        layout={layout}
        onClickAdvanceStage={onClickAdvanceStage}
        onClickRetreatStage={onClickRetreatStage}
        currentStage={currentStage}
        numStages={placeForm.stages.length}
      />
    </div>
  );
};

export default MapseedPlaceForm;

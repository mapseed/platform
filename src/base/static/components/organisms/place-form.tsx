/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import { useSelector, useDispatch } from "react-redux";
import { Formik } from "formik";

import BaseForm from "./base-form";
import FormStageControlBar from "../molecules/form-stage-control-bar";
import { PlaceForm, Form, FormModule } from "../../state/ducks/forms";
import { MapViewport } from "../../state/ducks/map";
import {
  layerGroupsSelector,
  updateLayerGroupVisibility,
} from "../../state/ducks/map-style";
import { layoutSelector, Layout } from "../../state/ducks/ui";
import eventEmitter from "../../utils/event-emitter";

type PlaceFormProps = {
  placeForm: PlaceForm;
};

const getModuleName = (id: number, key: string) => (key ? key : `field-${id}`);

const calculateInitialValues = (form: PlaceForm) =>
  form.stages
    .reduce(
      (formModules, stage) => formModules.concat(stage.modules),
      [] as FormModule[],
    )
    .reduce((initialValues, { id, config }) => {
      return {
        ...initialValues,
        // TODO: other default value use cases:
        //   - load from form state dump
        //   - editor
        [getModuleName(id, config.key)]: config.defaultValue || "",
      };
    }, {});

const MapseedPlaceForm = (props: PlaceFormProps) => {
  const [currentStage, setCurrentStage] = React.useState<number>(0);
  const layout: Layout = useSelector(layoutSelector);
  const dispatch = useDispatch();
  const layerGroups = useSelector(layerGroupsSelector);
  const onClickAdvanceStage = React.useCallback(() => {
    if (currentStage < props.placeForm.stages.length - 1) {
      setCurrentStage(currentStage + 1);
    }
  }, [currentStage]);
  const onClickRetreatStage = React.useCallback(() => {
    if (currentStage > 0) {
      setCurrentStage(currentStage - 1);
    }
  }, [currentStage]);
  React.useEffect(() => {
    const stageViewport: MapViewport | undefined =
      props.placeForm.stages[currentStage].mapViewport;
    stageViewport && eventEmitter.emit("setMapViewport", stageViewport);
    const stageLayerGroups =
      props.placeForm.stages[currentStage].visibleLayerGroups;

    if (stageLayerGroups) {
      // Set layer visibilities for this stage.
      const stageLayerGroupIds = new Set(
        stageLayerGroups.map(layerGroup => layerGroup.label),
      );

      layerGroups.allIds.forEach(id => {
        dispatch(updateLayerGroupVisibility(id, !!stageLayerGroupIds.has(id)));
      });
    }
  }, [currentStage]);

  return (
    <div
      css={css`
        margin-bottom: ${props.placeForm.stages.length > 1 ? "112px" : 0};
      `}
    >
      <Formik
        validateOnChange={false}
        validateOnBlur={true}
        onSubmit={() => null}
        initialValues={calculateInitialValues(props.placeForm)}
        render={formikProps => (
          <BaseForm
            modules={props.placeForm.stages[currentStage].modules}
            {...formikProps}
          />
        )}
      />

      <FormStageControlBar
        layout={layout}
        onClickAdvanceStage={onClickAdvanceStage}
        onClickRetreatStage={onClickRetreatStage}
        currentStage={currentStage}
        numStages={props.placeForm.stages.length}
      />
    </div>
  );
};

export default MapseedPlaceForm;

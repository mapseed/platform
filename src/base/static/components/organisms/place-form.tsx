import * as React from "react";
import { useSelector } from "react-redux";
import { Formik } from "formik";

import BaseForm from "./base-form";
import FormStageControlBar from "../molecules/form-stage-control-bar";
import { PlaceForm, Form } from "../../state/ducks/forms";
import { MapViewport } from "../../state/ducks/map";
import { layoutSelector, Layout } from "../../state/ducks/ui";
import eventEmitter from "../../utils/event-emitter";

type PlaceFormProps = {
  placeForm: PlaceForm;
};

const getModuleName = (id: number, key: string) => (key ? key : `field-${id}`);

const calculateInitialValues = (form: Form) =>
  form.stages
    .reduce((formModules, stage) => formModules.concat(stage.modules), [])
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
    //stageConfig.visibleLayerGroupIds &&
    //  this.updateLayerGroupVisibilities(
    //    stageConfig.visibleLayerGroupIds,
    //    true,
    //  );
  }, [currentStage]);

  return (
    <div>
      <Formik
        onSubmit={values => console.log(JSON.stringify(values, null, 2))}
        initialValues={calculateInitialValues(props.placeForm)}
        render={() => (
          <BaseForm modules={props.placeForm.stages[currentStage].modules} />
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

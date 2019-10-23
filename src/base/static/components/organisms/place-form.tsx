/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import { useSelector, useDispatch } from "react-redux";
import { Formik } from "formik";

import BaseForm from "./base-form";
import FormStageControlBar from "../molecules/form-stage-control-bar";
import { PlaceForm, FormModule } from "../../state/ducks/forms";
import { mapViewportSelector, MapViewport } from "../../state/ducks/map";
import {
  layerGroupsSelector,
  updateLayerGroupVisibility,
  LayerGroups,
} from "../../state/ducks/map-style";
import { layoutSelector, Layout } from "../../state/ducks/ui";
import eventEmitter from "../../utils/event-emitter";
import { LoadingBar } from "../atoms/imagery";
import { isFormField } from "../../utils/place-utils";

// Generate initial values for fields only (i.e. not for HTML blocks, submit
// button, etc.)
// TODO: submodule initial values in grouped fields
const calculateInitialValues = (form: PlaceForm) =>
  form.stages
    .reduce(
      (formModules, stage) =>
        formModules.concat(
          stage.modules.filter(formModule => isFormField(formModule.type)),
        ),
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

const MapseedPlaceForm = ({ onSubmit, placeForm }) => {
  const [currentStage, setCurrentStage] = React.useState<number>(0);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const mapViewport: MapViewport = useSelector(mapViewportSelector);
  const layout: Layout = useSelector(layoutSelector);
  const dispatch = useDispatch();
  const layerGroups: LayerGroups = useSelector(
    layerGroupsSelector,
    layerGroupsEqualityComparator,
  );
  const onClickAdvanceStage = React.useCallback(
    validateField => {
      Promise.all(
        placeForm.stages[currentStage].modules
          .filter(({ type }) => isFormField(type))
          .map(({ key }) => validateField(key)),
      ).then(result => {
        if (!result.some(msg => typeof msg === "string")) {
          currentStage < placeForm.stages.length - 1 &&
            setCurrentStage(currentStage + 1);
        }
      });
    },
    [currentStage, placeForm],
  );
  const onClickRetreatStage = React.useCallback(() => {
    currentStage > 0 && setCurrentStage(currentStage - 1);
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
  const preprocessSubmission = React.useCallback(
    values => {
      const { longitude, latitude } = mapViewport;
      const geometry = {
        type: "Point",
        coordinates: [longitude, latitude],
      };

      onSubmit({
        ...values,
        geometry,
      });
    },
    [mapViewport],
  );

  return (
    <div
      css={css`
        margin-bottom: ${placeForm.stages.length > 1 ? "112px" : 0};
      `}
    >
      {isSubmitting && <LoadingBar />}
      <Formik
        validateOnChange={false}
        validateOnBlur={true}
        onSubmit={preprocessSubmission}
        initialValues={calculateInitialValues(placeForm)}
        render={formikProps => {
          return (
            <React.Fragment>
              <BaseForm
                modules={placeForm.stages[currentStage].modules}
                onClickSkipStage={onClickSkipStage}
                {...formikProps}
              />
              <FormStageControlBar
                layout={layout}
                onClickAdvanceStage={() =>
                  onClickAdvanceStage(formikProps.validateField)
                }
                onClickRetreatStage={onClickRetreatStage}
                currentStage={currentStage}
                numStages={placeForm.stages.length}
              />
            </React.Fragment>
          );
        }}
      />
    </div>
  );
};

export default MapseedPlaceForm;

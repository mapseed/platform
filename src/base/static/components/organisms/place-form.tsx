import * as React from "react";
import { useSelector } from "react-redux";

import Form from "./form";
import FormStageControlBar from "../molecules/form-stage-control-bar";
import { PlaceForm } from "../../state/ducks/forms";
import { layoutSelector, Layout } from "../../state/ducks/ui";
import eventEmitter from "../../utils/event-emitter";

type PlaceFormProps = {
  placeForm: PlaceForm;
};

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
      <Form modules={props.placeForm.stages[currentStage].modules} />
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

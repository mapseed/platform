/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";
import { useSelector, useDispatch } from "react-redux";

import {
  updateLayerAggregators,
  layerGroupsSelector,
  layersSelector,
  LayerGroups,
  Layer,
} from "../../state/ducks/map-style";
import {
  RadioMenuConfig,
  RadioMenuOption,
  mapRadioMenuConfigSelector,
} from "../../state/ducks/map";
import FormLabel from "@material-ui/core/FormLabel";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import MapWidgetWrapper from "./map-widget-wrapper";

const MapRadioMenu: React.FunctionComponent<WithStyles<typeof styles>> = ({
  classes,
}) => {
  const {
    layerId,
    layerGroupId,
    options,
    defaultSelectedOption,
    label,
  }: RadioMenuConfig = useSelector(mapRadioMenuConfigSelector);
  const layerGroups: LayerGroups = useSelector(layerGroupsSelector);
  const layerGroup = layerGroups.byId[layerGroupId];
  const layers: Layer[] = useSelector(layersSelector);
  const dispatch = useDispatch();
  const [selectedOption, setSelectedOption] = React.useState<RadioMenuOption>(
    options.find(option => option.id === defaultSelectedOption)!,
  );

  React.useEffect(() => {
    const layer = layers.find(layer => layer.id === layerId)!;
    dispatch(updateLayerAggregators(layer.id, [selectedOption.aggregator!]));
  }, [layerId, selectedOption]);

  if (!layerGroup.isVisible) {
    return null;
  }

  const handleChange = (event: React.ChangeEvent<unknown>): void => {
    const selectedOptionId = (event.target as HTMLInputElement).value;
    const newSelectedOption = options.find(
      option => option.id === selectedOptionId,
    )!;
    setSelectedOption(newSelectedOption);
  };

  return (
    <MapWidgetBackground color="black">
      {classes => (
        <React.Fragment>
          <FormLabel classes={{ root: classes.label, focused: classes.label }}>
            {label}
          </FormLabel>
          <RadioGroup
            aria-label="nitrogen-deposition"
            name="Nitrogen Deposition"
            value={selectedOption.id}
            onChange={handleChange}
          >
            {options.map((option, i) => (
              <FormControlLabel
                key={i}
                control={<Radio style={{ padding: "4px 12px" }} />}
                label={option.label}
                classes={{
                  label: classes.label,
                }}
                value={option.id}
              />
            ))}
          </RadioGroup>
        </React.Fragment>
      )}
    </MapWidgetBackground>
  );
};

export default MapRadioMenu;

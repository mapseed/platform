/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";

import { withStyles } from "@material-ui/core/styles";
import {
  LayerGroup,
  updateLayerGroupVisibility,
  updateLayerAggregators,
  LayerGroups,
  Layer,
} from "../../state/ducks/map";
import {
  CheckboxMenuConfig,
  CheckboxMenuOption,
} from "../../state/ducks/map-config";
// import Radio from "@material-ui/core/Radio";
import FormLabel from "@material-ui/core/FormLabel";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormHelperText from "@material-ui/core/FormHelperText";
import Checkbox from "@material-ui/core/Checkbox";

// import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { lighten } from "@material-ui/core/styles/colorManipulator";

type CheckboxMenuProps = {
  checkboxMenuConfig: CheckboxMenuConfig;
  // layerGroups: LayerGroup[];
  layerGroups: LayerGroups;
  layers: Layer[];
  updateLayerGroupVisibility: typeof updateLayerGroupVisibility;
  updateLayerAggregators: typeof updateLayerAggregators;
  classes: any;
};

const BACKGROUND_COLOR = "rgba(0, 0, 0, 0.6)";
const TEXT_COLOR = lighten(BACKGROUND_COLOR, 1);

const styles = {
  label: {
    color: TEXT_COLOR,
  },
};

const MapCheckboxMenu: React.FunctionComponent<CheckboxMenuProps> = ({
  checkboxMenuConfig: checkboxMenuConfig,
  layerGroups,
  layers,
  updateLayerGroupVisibility,
  updateLayerAggregators,
  classes,
}) => {
  // const visibleLayerGroups = layerGroups.filter(
  //   layerGroup => layerGroup.isVisible,
  // );
  // let currentSelectedLayerGroup: LayerGroup | null = null;
  // if (visibleLayerGroups.length > 1) {
  //   console.warn(
  //     "more than one layer groups selected for the MapRadioMenu: ",
  //     visibleLayerGroups.map(group => group.id),
  //   );
  // } else if (visibleLayerGroups.length === 1) {
  //   currentSelectedLayerGroup = visibleLayerGroups[0] || null;
  // } else {
  //   const defaultSelectedOption = checkboxMenuConfig.options.find(
  //     option => !!option.defaultSelected,
  //   );
  //   currentSelectedLayerGroup =
  //     layerGroups.find(
  //       group => group.id === defaultSelectedOption!.layerGroupId,
  //     ) || null;
  // }

  // const handleChange = (event: React.ChangeEvent<unknown>) => {
  //   const id = (event.target as HTMLInputElement).value;
  //   // if (layerGroups.some(group => id === group.id)) {
  //   //   updateLayerGroupVisibility(id, true);
  //   // }
  //   // if (currentSelectedLayerGroup) {
  //   //   updateLayerGroupVisibility(currentSelectedLayerGroup.id, false);
  //   // }
  //   updateLayerGroupVisibility(id, true);
  //   updateLayerGroupVisibility(currentSelectedLayerGroup.id, false);
  // };

  // <RadioGroup
  //   aria-label="map layer selector"
  //   name="map radio menu"
  //   value={currentSelectedLayerGroup.id}
  //   onChange={handleChange}
  // >
  //   {checkboxMenuConfig.options.map(option => (
  //     <FormControlLabel
  //       key={option.layerGroupId}
  //       value={option.layerGroupId}
  //       control={<Radio style={{ padding: "4px 12px" }} />}
  //       label={option.label}
  //       classes={{
  //         label: classes.label,
  //       }}
  //     />
  //   ))}
  // </RadioGroup>
  const isOptionChecked = (option: CheckboxMenuOption): boolean => {
    if (option.aggregator) {
      // When the checkbox toggles aggregators within a layer:
      const layer = layers.find(layer => layer.id === option.layerId);
      return (
        layerGroups.byId[option.layerGroupId].isVisible &&
        layer!.aggregators.includes(option.aggregator)
      );
    } else {
      // When the checkbox only toggles visibility of the layer group:
      return layerGroups.byId[option.layerGroupId].isVisible;
    }
  };

  const handleChange = (option: CheckboxMenuOption) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    // const checked = event.target.checked;
    // setState({ ...state, [name]:  });
    const id = (event.target as HTMLInputElement).value;
    const isChecked = event.target.checked;
    const layerGroup = layerGroups.byId[option.layerGroupId];
    console.log("map checkbox: layerGroup:", layerGroup);
    console.log("map checkbox: isChecked:", isChecked);
    if (!option.aggregator) {
      // all we have to do is toggle the layer group's visibility:
      updateLayerGroupVisibility(layerGroup.id, isChecked);
      return;
    }

    // Update the aggregators for the layer, and update the layerGroup
    // visibility as needed:
    const layer = layers.find(layer => layer.id === option.layerId);
    // layerGroups.byId[option.layerGroupId].isVisible
    if (!layerGroup.isVisible && isChecked) {
      updateLayerAggregators(layer!.id, [option.aggregator]);
      updateLayerGroupVisibility(layerGroup.id, true);
    } else if (!layerGroup.isVisible && !isChecked) {
      console.warn(
        "unchedking a layer group that is not visible:",
        layerGroup.id,
      );
    } else if (layerGroup.isVisible && isChecked) {
      if (layer!.aggregators.includes(option.aggregator)) {
        console.error("should not have aggregator!");
      }
      // add the option's agregator:
      const newAggregators = [...layer!.aggregators, option.aggregator];
      updateLayerAggregators(layer!.id, newAggregators);
    } else {
      // (layerGroup.isVisible && !isChecked)
      if (!layer!.aggregators.includes(option.aggregator)) {
        console.error("should have the aggregator!");
      }
      // remove the aggregator
      const newAggregators = layer!.aggregators.filter(
        aggregator => aggregator !== option.aggregator,
      );

      updateLayerAggregators(layer!.id, newAggregators);
      if (newAggregators.length === 0) {
        updateLayerGroupVisibility(layerGroup.id, false);
      }
    }
  };
  return (
    <div
      css={css`
        background-color: ${BACKGROUND_COLOR};
        padding: 8px;
        border-radius: 8px;
        color: #fff;
        margin-top: 8px;
      `}
    >
      <FormLabel classes={{ root: classes.label, focused: classes.label }}>
        {checkboxMenuConfig.label}
      </FormLabel>
      <FormGroup>
        {checkboxMenuConfig.options.map((option, i) => (
          <FormControlLabel
            key={i}
            control={
              <Checkbox
                style={{ padding: "4px 12px" }}
                checked={isOptionChecked(option)}
                onChange={handleChange(option)}
              />
            }
            label={option.label}
            classes={{
              label: classes.label,
            }}
          />
        ))}
      </FormGroup>
    </div>
  );
};

export default withStyles(styles)(MapCheckboxMenu);

/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";

import { withStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import { WithStyles, createStyles } from "@material-ui/core";
import {
  updateLayerAggregators,
  LayerGroups,
  Layer,
} from "../../state/ducks/map-style";
import { RadioMenuConfig, RadioMenuOption } from "../../state/ducks/map";
import FormLabel from "@material-ui/core/FormLabel";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";

import { getReadableColor } from "../../utils/color";

const BACKGROUND_COLOR = "rgba(0, 0, 0, 0.6)";
const TEXT_COLOR = getReadableColor(BACKGROUND_COLOR);

const styles = (theme: Theme) =>
  createStyles({
    label: {
      color: TEXT_COLOR,
    },
  });

interface Props extends WithStyles<typeof styles> {
  radioMenuConfig: RadioMenuConfig;
  layerGroups: LayerGroups;
  layers: Layer[];
  updateLayerAggregators: typeof updateLayerAggregators;
}

const MapRadioMenu: React.FunctionComponent<Props> = ({
  radioMenuConfig,
  layerGroups,
  layers,
  updateLayerAggregators,
  classes,
}) => {
  const [selectedOption, setSelectedOption] = React.useState<RadioMenuOption>(
    radioMenuConfig.options.find(
      option => option.id === radioMenuConfig.defaultSelectedOption,
    )!,
  );

  React.useEffect(
    () => {
      const layer = layers.find(layer => layer.id === radioMenuConfig.layerId)!;
      updateLayerAggregators(layer.id, [selectedOption.aggregator!]);
    },
    [radioMenuConfig.layerId, selectedOption],
  );

  const handleChange = (event: React.ChangeEvent<unknown>): void => {
    const selectedOptionId = (event.target as HTMLInputElement).value;
    const newSelectedOption = radioMenuConfig.options.find(
      option => option.id === selectedOptionId,
    )!;
    setSelectedOption(newSelectedOption);
  };
  const layerGroup = layerGroups.byId[radioMenuConfig.layerGroupId];
  if (!layerGroup.isVisible) {
    return null;
  }
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
        {radioMenuConfig.label}
      </FormLabel>
      <RadioGroup
        aria-label="nitrogen-deposition"
        name="Nitrogen Deposition"
        value={selectedOption.id}
        onChange={handleChange}
      >
        {radioMenuConfig.options.map((option, i) => (
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
    </div>
  );
};

export default withStyles(styles)(MapRadioMenu);

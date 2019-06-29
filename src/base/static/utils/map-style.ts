import { LayerGroup, Layer, AggregatorOption } from "../state/ducks/map";
import { LeftSidebarOption } from "../state/ducks/left-sidebar";
import { Expression } from "mapbox-gl";

const AGGREGATOR_EXPRESSION_INDEX = 2;

export const isSidebarOptionToggled = (
  option: LeftSidebarOption,
  layerGroup: LayerGroup,
  layers: Layer[],
): boolean => {
  if (
    !layerGroup.isVisible ||
    !option.aggregationOptionId ||
    !layerGroup.aggregationSelector
  ) {
    // If the layer group isn't configured to be aggregated, then the option
    // represents whether the entire layerGroup is visible.
    return layerGroup.isVisible;
  }

  // query for the aggretorOption:
  const aggregatorOption = layerGroup.aggregationSelector.options.find(
    aggregatorOption => aggregatorOption.id === option.aggregationOptionId,
  );

  // query the layer:
  const layerId = layerGroup.aggregationSelector.layerId;
  const layer = layers.find(layer => layer.id === layerId);

  // Return whether the aggregation option is already added on the layer:
  return (layer!.paint![
    layerGroup.aggregationSelector.paintProperty
  ][2] as Aggregator).some(
    aggregator => aggregator[1] === aggregatorOption!.property,
  );
};
export const clearAndSetAggregator = (
  layer: Layer,
  aggregatorOption: AggregatorOption,
  layerGroup: LayerGroup,
): Layer => {
  return {
    ...layer,
    paint: {
      ...layer.paint,
      [layerGroup.aggregationSelector!.paintProperty]: layer.paint![
        layerGroup.aggregationSelector!.paintProperty
      ].map((item, i) => {
        if (i !== AGGREGATOR_EXPRESSION_INDEX) {
          return item;
        }
        return ["+", ["get", aggregatorOption.property]];
      }),
    },
  };
};

export const hasNoAggregators = (
  layer: Layer,
  layerGroup: LayerGroup,
): boolean =>
  (layer.paint![layerGroup.aggregationSelector!.paintProperty][2] as Aggregator)
    .length <= 1;

export const toggleAggregator = (
  layer: Layer,
  aggregatorOption: AggregatorOption,
  layerGroup: LayerGroup,
): Layer => {
  const aggregator = layer.paint![
    layerGroup.aggregationSelector!.paintProperty
  ][2];
  if (isOptionInAggregator(aggregator, aggregatorOption)) {
    // If visible, and the filter is present, then remove the aggregator:
    return {
      ...layer,
      paint: {
        ...layer.paint,
        [layerGroup.aggregationSelector!.paintProperty]: layer.paint![
          layerGroup.aggregationSelector!.paintProperty
        ].map((item, i) => {
          if (i !== AGGREGATOR_EXPRESSION_INDEX) {
            return item;
          }
          return removeOptionFromAggregator(aggregator, aggregatorOption);
        }) as Expression,
      },
    };
  } else {
    // If visible, and the filter's not present, we should add our aggregator
    return {
      ...layer,
      paint: {
        ...layer.paint,
        [layerGroup.aggregationSelector!.paintProperty]: layer.paint![
          layerGroup.aggregationSelector!.paintProperty
        ].map((item, i) => {
          if (i !== AGGREGATOR_EXPRESSION_INDEX) {
            return item;
          }
          return addOptionToAggregator(aggregator, aggregatorOption);
        }) as Expression,
      },
    };
  }
};

type Aggregator =
  // NOTE: the first element is always a "+", but couldn't figure out the typing
  // here
  ("+" | ["get", string])[];

const isOptionInAggregator = (
  aggregator: Aggregator,
  aggregatorOption: AggregatorOption,
): boolean =>
  aggregator.slice(1).some(option => option[1] === aggregatorOption.property);

const removeOptionFromAggregator = (
  aggregator: Aggregator,
  aggregatorOption: AggregatorOption,
): Aggregator => {
  const filteredAggregator = aggregator.filter(
    option => option[1] !== aggregatorOption.property,
  );
  return [aggregator[0], ...filteredAggregator!];
};

const addOptionToAggregator = (
  aggregator: Aggregator,
  aggregatorOption: AggregatorOption,
): Aggregator => {
  return aggregator.concat([["get", aggregatorOption.property]]);
};

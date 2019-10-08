/* eslint-disable @typescript-eslint/no-explicit-any */
import { Feature, Point, LineString, Polygon } from "geojson";

type MapseedGeometry = Point | LineString | Polygon;

export const mapViewportPropType: any;

export type FilterSlider = {
  initialValue?: number;
  min: number;
  max: number;
  step?: number;
  label?: string;
  property: string;
  comparator: string;
};

export type FilterableLayerGroup = {
  layerIds: string[];
  filterSlider: FilterSlider;
};

export type MapContainerDimensions = {
  width: number;
  height: number;
};
export type Layer = {
  id: string;
  type: string;
  source: string;
  "source-layer": string;
  paint: any;

  // Non-mapbox attrs:
  groupId: string;
  aggregators: string[];
};

export const mapSourcesPropType: any;

export const mapStylePropType: any;

export const layerGroupsPropType: any;

export type LegendItem = {
  icon?: string;
  swatch?: string;
  label: string;
};

export type LayerGroup = {
  id: string;
  popupContent: string;
  // TODO: move this into it's own MapWidget config
  filterSlider?: FilterSlider;
  isBasemap: boolean;
  isVisible: boolean;
  isVisibleDefault: boolean;
  // Mapbox layer ids which make up this layerGroup:
  layerIds: string[];
  // Source ids which this layerGroup consumes:
  sourceIds: string[];
  legend?: LegendItem[];
};

export type LayerGroups = {
  byId: {
    [id: string]: LayerGroup;
  };
  allIds: string[];
};

export const sourcesMetadataPropType: any;
export type SourcesMetadata = {
  [id: string]: {
    layerGroupIds: string[];
  };
};

export const layerGroupsSelector: (state: any) => LayerGroups;
export const layersSelector: any;
export const mapStyleSelector: any;
export const mapSourcesSelector: any;
export const sourcesMetadataSelector: any;
export const interactiveLayerIdsSelector: any;
export const setMapSizeValiditySelector: any;
export const mapDraggingOrZoomingSelector: any;
export const mapDraggedOrZoomedSelector: any;
export const mapContainerDimensionsSelector: any;
export const mapLayerPopupSelector: any;
export const isWithMapLegendWidgetSelector: (state: any) => boolean;
// Return information about visible layer groups which are configured to be
// filterable with a slider.
export const filterableLayerGroupsSelector: any;

export const updateLayerFilters: any;

export const removeFocusedGeoJSONFeatures: any;

export const updateLayers: any;

export const updateLayerAggregators: (
  layerId: string,
  aggregators: string[],
) => void;

declare type Action = {
  type: string;
  payload: any;
};

export const updateFocusedGeoJSONFeatures: (
  features: Feature<MapseedGeometry>[],
) => Action;

export const updateLayerGroupVisibility: (
  id: string,
  isVisible: boolean,
) => void;

export const updateMapContainerDimensions: any;

export const updateMapStyle: any;

export const updateFeaturesInGeoJSONSource: any;

export const updateFeatureInGeoJSONSource: any;

export const createFeaturesInGeoJSONSource: any;

export const removeFeatureInGeoJSONSource: any;

export const loadMapStyle: any;

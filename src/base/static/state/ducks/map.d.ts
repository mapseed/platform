import { Layer } from "mapbox-gl";

export const mapViewportPropType: any;

type filterSliderPropType = {
  initialValue?: number;
  min: number;
  max: number;
  step?: number;
  label?: string;
  property: string;
  comparator: string;
};

export const filterableLayerGroupPropType: any;

export const mapSourcesPropType: any;

export const mapStylePropType: any;

export const layerGroupsPropType: any;

export type AggregatorOption = {
  id: string;
  property: string;
  defaultSelected: boolean;
};

export type LayerGroup = {
  id: string;
  popupContent: string;
  filterSlider: any;
  isBasemap: boolean;
  isVisible: boolean;
  isVisibleDefault: boolean;
  // Mapbox layer ids which make up this layerGroup:
  layerIds: string[];

  aggregationSelector?: {
    layerId: string;
    paintProperty: string;
    options: AggregatorOption[];
  };
  // Source ids which this layerGroup consumes:
  sourceIds: string[];
};

export type Layer = Layer;


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

export const layersSelector: any;
export const layerGroupsSelector: any;
export const mapStyleSelector: any;
export const mapSourcesSelector: any;
export const sourcesMetadataSelector: any;
export const interactiveLayerIdsSelector: any;
export const setMapSizeValiditySelector: any;
export const mapDraggingOrZoomingSelector: any;
export const mapDraggedOrZoomedSelector: any;
export const mapContainerDimensionsSelector: any;
export const mapLayerPopupSelector: any;
// Return information about visible layer groups which are configured to be
// filterable with a slider.
export const filterableLayerGroupsMetadataSelector: any;

export const updateLayerFilters: any;

export const removeFocusedGeoJSONFeatures: any;

export const updateLayer: any;

export const updateFocusedGeoJSONFeatures: any;

export const updateLayerGroupVisibility: any;

export const updateMapContainerDimensions: any;

export const updateMapStyle: any;

export const updateFeaturesInGeoJSONSource: any;

export const updateFeatureInGeoJSONSource: any;

export const createFeaturesInGeoJSONSource: any;

export const removeFeatureInGeoJSONSource: any;

export const loadMapStyle: any;

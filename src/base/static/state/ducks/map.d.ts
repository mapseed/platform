import { Feature, Geometry, GeoJsonProperties } from "geojson";

export const UPDATE_MAPVIEWPORT: string;

export type MapViewport = {
  minZoom: number;
  maxZoom: number;
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
  transitionDuration: number;
};

export type MapViewportDiff = {
  minZoom?: number;
  maxZoom?: number;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  bearing?: number;
  pitch?: number;
  transitionDuration?: number;
};

export type InteractionStateDiff = {
  isMapTransitioning?: boolean;
  isMapDraggingOrZooming?: boolean;
  isMapDraggedOrZoomedByUser?: boolean;
};

export interface LayerFeature<
  G extends Geometry | null = Geometry,
  P = GeoJsonProperties
> extends Feature {
  layer: {
    id: string;
  };
}

export type FilterSliderConfig = {
  layerGroupId: string;
  initialValue: number;
  min: number;
  max: number;
  step: number;
  label: string;
  property: string;
  comparator: string;
};

export type RadioMenuOption = {
  aggregator?: string;
  label: string;
  id: string;
};

export type RadioMenuConfig = {
  label: string;
  layerGroupId: string;
  layerId: string;
  options: RadioMenuOption[];
  defaultSelectedOption: string;
};

export type MapWidgetsConfig = {
  filterSlider?: FilterSliderConfig;
  radioMenu?: RadioMenuConfig;
};

export type OfflineConfig = {
  southWest: {
    lat: number;
    lng: number;
  };
  northEast: {
    lat: number;
    lng: number;
  };
};

export type MapConfig = {
  geolocationEnabled: boolean;
  geocodingBarEnabled: boolean;
  geocodingEngine: string;
  geocodeFieldLabel: string;
  geocodeHint: number[];
  geocodeBoundingBox: number[];
  offlineBoundingBox?: OfflineConfig;
  scrollZoomAroundCenter: boolean;
  defaultMapViewport: MapViewport;
  mapWidgets: MapWidgetsConfig;
};

export type MapSourcesLoadStatus = {
  [groupName: string]: string;
};

export const mapConfigSelector: any;
export const mapViewportSelector: (state: any) => MapViewport;
export const loadMapConfig: (mapConfig: MapConfig) => void;
export const geocodeAddressBarEnabledSelector: any;
export const mapConfigPropType: any;
export const defaultMapViewportSelector: any;
export const mapWidgetsSelector: any;
export const measurementToolEnabledSelector: any;
export const isMapTransitioning: (state: any) => boolean;
export const isMapDraggingOrZooming: (state: any) => boolean;
export const isMapDraggedOrZoomedByUser: (state: any) => boolean;

declare type Action = {
  type: string;
  payload: any;
};
export const loadMapViewport: (mapViewportDiff: MapViewportDiff) => Action;
export const updateMapViewport: (mapViewport: MapViewport) => Action;
export const updateMapInteractionState: (
  newInteractionState: InteractionStateDiff,
) => Action;

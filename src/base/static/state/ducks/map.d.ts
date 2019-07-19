import { MapViewport } from "./map-viewport";

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
export const loadMapConfig: (mapConfig: MapConfig) => void;
export const geocodeAddressBarEnabledSelector: any;
export const mapConfigPropType: any;
export const defaultMapViewportSelector: any;
export const mapWidgetsSelector: any;
export const measurementToolEnabledSelector: any;

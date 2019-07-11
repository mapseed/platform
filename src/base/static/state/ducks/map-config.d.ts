import { EasingFunction } from "react-map-gl";

export type InitialMapViewport = {
  minZoom: number;
  maxZoom: number;
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
  transitionDuration: number;
  transitionEasing: EasingFunction;
};

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

export type RadioMenuConfig = {
  label: string;
  options: {
    layerGroupId: string;
    label: string;
    defaultSelected?: string;
  }[];
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
  defaultMapViewport: InitialMapViewport;
  mapWidgets: MapWidgetsConfig;
};

export type MapSourcesLoadStatus = {
  [groupName: string]: string;
};
export interface MapViewport extends InitialMapViewport {
  transitionInterpolator: any;
}

export const mapConfigSelector: any;
export const loadMapConfig: any;
export const geocodeAddressBarEnabledSelector: any;
export const mapConfigPropType: any;
export const defaultMapViewportSelector: any;
export const mapWidgetsSelector: any;
export const measurementToolEnabledSelector: any;

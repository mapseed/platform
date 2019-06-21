import { EasingFunction } from "react-map-gl";

export interface InitialMapViewport {
  minZoom: number;
  maxZoom: number;
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
  transitionDuration: number;
  transitionEasing: EasingFunction;
}
export interface MapViewport extends InitialMapViewport {
  transitionInterpolator: any;
}

export const mapConfigSelector: any;
export const loadMapConfig: any;
export const geocodeAddressBarEnabledSelector: any;
export const mapConfigPropType: any;
export const defaultMapViewportSelector: any;

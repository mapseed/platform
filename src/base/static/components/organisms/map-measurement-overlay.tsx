/** @jsx jsx */
// @ts-nocheck
// TODO: figure out why this widget broke
import * as React from "react";
import { jsx } from "@emotion/core";
import { useSelector } from "react-redux";
import WebMercatorViewport from "viewport-mercator-project";
import { CanvasOverlay } from "react-map-gl";
import {
  FeatureCollection,
  Point,
  LineString,
  Polygon,
  Position,
} from "geojson";

import { MapViewport, mapViewportSelector } from "../../state/ducks/map";
import {
  mapContainerDimensionsSelector,
  MapContainerDimensions,
} from "../../state/ducks/map-style";
import { measurementToolVisibilitySelector } from "../../state/ducks/ui";
import { redraw } from "../../utils/geo";

const getNewViewport = ({
  latitude,
  longitude,
  zoom,
  pitch,
  bearing,
  altitude,
  width,
  height,
}): WebMercatorViewport =>
  new WebMercatorViewport({
    latitude,
    longitude,
    zoom,
    pitch,
    bearing,
    altitude,
    width,
    height,
  });

type MapMeasurementOverlayProps = {
  handleOverlayClick: (unprojected: Position) => void;
  featureCollection: FeatureCollection<Point | LineString | Polygon>;
  positions: Position[];
  selectedTool: string | null;
};

const MapMeasurementOverlay = (props: MapMeasurementOverlayProps) => {
  const isMeasurementToolVisible: boolean = useSelector(
    measurementToolVisibilitySelector,
  );
  const mapContainerDimensions: MapContainerDimensions = useSelector(
    mapContainerDimensionsSelector,
  );
  const mapViewport: MapViewport = useSelector(mapViewportSelector);
  const webMercatorViewport = React.useRef<WebMercatorViewport>();
  const overlayRef = React.useRef(null);
  const selectedTool = React.useRef<string | null>(null);
  // NOTE: We memoize `props.handleOverlayClick` to maintain referential
  // equality between renders, since `handleOverlayClickMemo` is a dependecy of
  // the effect that attaches the click listener to the overlay's underlying
  // canvas element.
  // TODO: This all feels convoluted, and it's due to the need to attach a
  // listener directly to the canvas element. Maybe there is a better way that
  // doesn't involve direct manipulation of the overlay's canvas?
  const handleOverlayClickMemo = React.useCallback(
    props.handleOverlayClick,
    [],
  );

  React.useEffect(() => {
    selectedTool.current = props.selectedTool;
  }, [props.selectedTool]);

  const handleOverlayClick = React.useCallback(
    evt => {
      if (!selectedTool.current) {
        return;
      }

      const { left, top } = evt.currentTarget.getBoundingClientRect();
      // Get unprojected (i.e. lng/lat) coordinates from the x/y click position,
      // relative to the overlay canvas element.
      const unprojected =
        webMercatorViewport.current &&
        webMercatorViewport.current.unproject([evt.x - left, evt.y - top]);

      unprojected && handleOverlayClickMemo(unprojected);
    },
    [handleOverlayClickMemo],
  );

  React.useEffect(() => {
    // Unless I'm missing the right way to use overlays, it seems necessary
    // to attach a click listener here to capture clicks on the overlay.
    // See: https://github.com/uber/react-map-gl/issues/470
    if (
      isMeasurementToolVisible &&
      overlayRef &&
      overlayRef.current &&
      overlayRef.current._canvas
    ) {
      overlayRef.current._canvas.addEventListener("click", handleOverlayClick);
      // This direct manipulation of the `pointer-events` style property feels
      // like a hack, but the goal is to enable clicks on the underlying map
      // when no measurement tool is selected.
      overlayRef.current._canvas.style.pointerEvents = "none";
    } else if (isMeasurementToolVisible) {
      // eslint-disable-next-line no-console
      console.error(`Measurement overlay: failed to attach click listener`);
    }
  }, [isMeasurementToolVisible, handleOverlayClick]);

  React.useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current._canvas.style.pointerEvents = "initial";
    }
  }, [props.selectedTool]);

  React.useEffect(() => {
    const overlayRefCopy = overlayRef.current;

    return () => {
      if (overlayRefCopy && overlayRefCopy._canvas) {
        overlayRefCopy._canvas.removeEventListener("click", handleOverlayClick);
      }
    };
  }, [handleOverlayClick]);

  React.useEffect(() => {
    webMercatorViewport.current = getNewViewport({
      ...mapViewport,
      width: mapContainerDimensions.width,
      height: mapContainerDimensions.height,
    });
  }, [
    mapViewport,
    mapContainerDimensions.width,
    mapContainerDimensions.height,
  ]);

  if (!isMeasurementToolVisible) {
    return null;
  }

  return (
    <CanvasOverlay
      ref={overlayRef}
      captureClick={!!props.selectedTool}
      redraw={canvasProps =>
        redraw({
          ...canvasProps,
          featureCollection: props.featureCollection,
        })
      }
    />
  );
};

export default MapMeasurementOverlay;

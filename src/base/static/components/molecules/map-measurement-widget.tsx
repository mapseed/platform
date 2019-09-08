/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import { useSelector } from "react-redux";
import { CanvasOverlay } from "react-map-gl";

import {
  CreatePolygonIcon,
  CreatePolylineIcon,
  DeleteGeometryIcon,
  UndoIcon,
} from "../atoms/icons";
import MapWidgetWrapper from "./map-widget-wrapper";
import { RegularText } from "../atoms/typography";
import { measurementToolVisibilitySelector } from "../../state/ducks/ui";

type MapMeasurementWidgetProps = {
  selectedTool: string | null;
  handleUndoLastPoint: Function;
  handleSelectTool: Function;
  handleReset: Function;
  units: string | null;
  measurement: number | null;
};

interface ExposedCanvasOverlay extends CanvasOverlay {
  _canvas: HTMLCanvasElement;
}

type MeasurementToolIconProps = {
  isEnabled: boolean;
  isSelected?: boolean;
  children: React.ReactNode;
  onClick: Function;
};

const MeasurementToolIcon = (props: MeasurementToolIconProps) => (
  <span
    onClick={() => props.onClick()}
    css={css`
      border: 2px solid transparent;
      border-radius: 4px;
      padding: 4px 4px 0 4px;
      margin-right: 8px;
      background-color: ${props.isSelected ? "#999" : "initial"};

      &:hover {
        border-color: ${props.isEnabled ? "#999" : "transparent"};
        cursor: ${props.isEnabled ? "pointer" : "unset"};
      }
    `}
  >
    {props.children}
  </span>
);

MeasurementToolIcon.defaultProps = {
  isEnabled: true,
};

const measurementFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const formatMeasurement = measurement =>
  isNaN(measurement) ? null : measurementFormatter.format(measurement);

const MapMeasurementWidget = (props: MapMeasurementWidgetProps) => {
  const {
    selectedTool,
    handleUndoLastPoint,
    handleSelectTool,
    handleReset,
    units,
    measurement,
  } = props;
  const isMeasurementToolVisible: boolean = useSelector(
    measurementToolVisibilitySelector,
  );

  if (!isMeasurementToolVisible) {
    return null;
  }

  return (
    <MapWidgetWrapper color="black">
      {() => (
        <React.Fragment>
          <RegularText
            css={css`
              display: block;
              margin-bottom: 8px;
              font-family: courier, sans-serif;
            `}
          >
            {selectedTool
              ? `Total ${units}: ${formatMeasurement(measurement)}`
              : "Measurement tools"}
          </RegularText>
          <div
            css={css`
              display: flex;
              align-items: center;
            `}
          >
            <div
              css={css`
                border-right: 1px solid #999;
                display: flex;
                align-items: center;
                margin-right: 8px;
              `}
            >
              <MeasurementToolIcon
                isSelected={selectedTool === "create-polyline"}
                onClick={() => {
                  selectedTool !== "create-polyline" &&
                    handleSelectTool("create-polyline");
                }}
              >
                <CreatePolylineIcon />
              </MeasurementToolIcon>
              <MeasurementToolIcon
                isSelected={selectedTool === "create-polygon"}
                onClick={() => {
                  selectedTool !== "create-polygon" &&
                    handleSelectTool("create-polygon");
                }}
              >
                <CreatePolygonIcon />
              </MeasurementToolIcon>
            </div>
            <div
              css={css`
                display: flex;
                align-items: center;
              `}
            >
              <MeasurementToolIcon
                onClick={handleUndoLastPoint}
                isEnabled={!!selectedTool}
              >
                <UndoIcon color={selectedTool ? "#000" : "#999"} />
              </MeasurementToolIcon>
              <MeasurementToolIcon
                onClick={handleReset}
                isEnabled={!!selectedTool}
              >
                <DeleteGeometryIcon color={selectedTool ? "#000" : "#999"} />
              </MeasurementToolIcon>
            </div>
          </div>
        </React.Fragment>
      )}
    </MapWidgetWrapper>
  );
};

export default MapMeasurementWidget;

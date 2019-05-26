import React, { Fragment } from "react";
import PropTypes from "prop-types";

const ColoredMeterChart = props => {
  const numSegments = props.segments.length;
  const segmentDashSize = 100 / numSegments;
  const segmentAngle = Math.PI / numSegments;
  const halfSegmentAngle = segmentAngle / 2;
  const segmentAngleDegrees = 180 / numSegments;
  const threeHalvesPI = (3 / 2) * Math.PI;
  // 31.83... === 200/2PI; based on a chart circumference of 200.
  const radius = 31.8309886184;
  const centerX = 65;
  const centerY = 65;

  // Get the X and Y coordinates of the centerpoint of the arc of the meter
  // chart segment denoted by `index`. index 0 is the leftmost segment.
  const getXPos = (index, multiplier) =>
    centerX +
    radius *
      multiplier *
      Math.sin(threeHalvesPI - index * segmentAngle - halfSegmentAngle);
  const getYPos = (index, multiplier) =>
    centerY +
    radius *
      multiplier *
      Math.cos(threeHalvesPI - index * segmentAngle - halfSegmentAngle);

  const arrowEndX = getXPos(props.selectedSegmentIndex, 1.4);
  const arrowEndY = getYPos(props.selectedSegmentIndex, 1.4);

  return (
    <svg width="225px" height="125px" viewBox="0 0 130 65">
      <defs>
        <marker
          id="arrowhead"
          orient="auto"
          markerWidth="2"
          markerHeight="4"
          refX="0.1"
          refY="2"
        >
          <path d="M0,0 V4 L2,2 Z" fill="#fff" />
        </marker>
      </defs>
      {props.segments.map((segment, i) => {
        const labelX = getXPos(i, 1.7);
        const labelY = getYPos(i, 1.7);

        return (
          <Fragment key={i}>
            <circle
              cx="65"
              cy="65"
              r={radius}
              fill="transparent"
              stroke={segment.color}
              strokeDasharray={`${segmentDashSize} ${200 - segmentDashSize}`}
              strokeDashoffset={`${-100 - i * segmentDashSize}`}
              strokeWidth={2 * radius}
            />
            <text
              transform={`translate(${labelX}, ${labelY}) rotate(${-90 +
                (i * segmentAngleDegrees + segmentAngleDegrees / 2)})`}
              style={{
                fontFamily: "sans-serif",
                fontSize: "6px",
                fill: "#fff",
                textAnchor: "middle",
              }}
            >
              {segment.label}
            </text>
          </Fragment>
        );
      })}
      <circle cx="65" cy="65" r="5" fill="#fff" />
      <path
        d={`M${centerX} ${centerY} L${arrowEndX} ${arrowEndY}`}
        markerEnd="url('#arrowhead')"
        stroke="#fff"
        strokeWidth="3"
      />
    </svg>
  );
};

ColoredMeterChart.propTypes = {
  segments: PropTypes.arrayOf(
    PropTypes.shape({
      color: PropTypes.string.isRequired,
      label: PropTypes.string,
    }).isRequired,
  ).isRequired,
  selectedSegmentIndex: PropTypes.number.isRequired,
};

export { ColoredMeterChart };

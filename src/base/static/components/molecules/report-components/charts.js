import React from "react";
import PropTypes from "prop-types";

const donutSettings = {
  Low: { color: "#ffffb2", dashSegment: 25, text: "LOW" },
  Moderate: { color: "#fecc5c", dashSegment: 50, text: "MODERATE" },
  High: { color: "#fd8d3c", dashSegment: 75, text: "HIGH" },
  Extreme: { color: "#e31a1c", dashSegment: 95, text: "EXTREME" },
};

const SimpleDonutChart = props => {
  const settings = donutSettings[props.hazardRating] || {
    color: "#888",
    dashSegment: 0,
    text: "N/A",
  };

  return (
    <svg width="175px" height="175px" viewBox="0 0 42 42">
      <circle cx="21" cy="21" r="15.91549430918954" fill="#fff" />
      <circle
        cx="21"
        cy="21"
        r="15.91549430918954"
        fill="transparent"
        stroke="#eee"
        strokeWidth="5"
      />
      <circle
        cx="21"
        cy="21"
        r="15.91549430918954"
        fill="transparent"
        stroke={settings.color}
        strokeWidth="5"
        strokeDasharray={`${settings.dashSegment} ${100 -
          settings.dashSegment}`}
        strokeDashoffset="-25"
      />
      <text
        x="21"
        y="23"
        style={{
          fontFamily: "PTSansBold, sans-serif",
          fontSize: "6px",
          fill: settings.color,
          textAnchor: "middle",
        }}
      >
        {settings.text}
      </text>
    </svg>
  );
};

SimpleDonutChart.propTypes = {
  hazardRating: PropTypes.string.isRequired,
};

export { SimpleDonutChart };

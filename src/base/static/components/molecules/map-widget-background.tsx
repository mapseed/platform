/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";

type MapWidgetBackgroundProps = {
  color: "black" | "white";
  children: React.ReactNode;
};

const COLORS = {
  black: {
    background: "rgba(0,0,0,0.6)",
    text: "#fff",
  },
  white: {
    background: "rgba(255,255,255,0.85)",
    text: "#222",
  },
};

const MapWidgetBackground = (props: MapWidgetBackgroundProps) => (
  <div
    onClick={evt => evt.stopPropagation()}
    css={css`
      background-color: ${COLORS[color].background};
      color: ${COLORS[color].text};
      padding: 8px;
      border-radius: 8px;
      width: 400px;
      margin-top: 8px;
    `}
  >
    {props.children}
  </div>
);

export default MapWidgetBackground;

/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";

type MapWidgetContainerProps = {
  position: string;
  children: React.ReactNode[];
};

const getPositionInfo = position => {
  switch (position) {
    case "lower-right":
      return {
        left: "unset",
        right: "8px",
      };
    case "lower-left":
    default:
      return {
        left: "8px",
        right: "unset",
      };
  }
};

const MapWidgetContainer = (props: MapWidgetContainerProps) => {
  const positionInfo = getPositionInfo(props.position);

  return (
    <div
      css={css`
        z-index: 2;
        position: absolute;
        bottom: 8px;
        right: ${positionInfo.right};
        left: ${positionInfo.left};
      `}
    >
      {props.children}
    </div>
  );
};

export default MapWidgetContainer;

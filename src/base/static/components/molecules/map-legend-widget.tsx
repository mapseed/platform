/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";
import { useSelector } from "react-redux";

import { layerGroupsSelector, LayerGroups } from "../../state/ducks/map-style";
import MapWidgetWrapper from "./map-widget-wrapper";
import { RegularText } from "../atoms/typography";

const MapLegendWidget = () => {
  const layerGroups: LayerGroups = useSelector(layerGroupsSelector);
  const legendGroups = Object.values(layerGroups.byId)
    .filter(layerGroup => layerGroup.isVisible && layerGroup.legend)
    .map(layerGroup => layerGroup.legend);

  if (legendGroups.length === 0) {
    return null;
  }

  return (
    <MapWidgetWrapper color="black">
      {() => (
        <React.Fragment>
          {legendGroups.map((legendGroup, i) => (
            <div key={i}>
              {legendGroup.map(legendItem => (
                <div
                  css={css`
                    display: flex;
                    align-items: center;
                    margin-bottom: 4px;
                  `}
                  key={legendItem.swatch}
                >
                  <div
                    css={css`
                      margin-right: 8px;
                      width: 20px;
                      height: 20px;
                      background-color: ${legendItem.swatch};
                    `}
                  />
                  <RegularText>{legendItem.label}</RegularText>
                </div>
              ))}
            </div>
          ))}
        </React.Fragment>
      )}
    </MapWidgetWrapper>
  );
};

export default MapLegendWidget;

/** @jsx jsx */
import * as React from "react";
import { connect } from "react-redux";
import { css, jsx } from "@emotion/core";
import { uiVisibilitySelector } from "../../state/ducks/ui";
type StateProps = {
  isMapCenterpointVisible: boolean;
};

type Props = {
  isMapDraggedOrZoomed: boolean;
  isMapDraggingOrZooming: boolean;
} & StateProps;

const MapCenterpoint: React.FunctionComponent<Props> = props => {
  if (!props.isMapCenterpointVisible) {
    return null;
  }
  return (
    <span
      css={css`
        overflow: visible;
        position: absolute;
        top: 50%;
        left: 50%;
        pointer-events: none;
        z-index: 400;
        width: 100px;
        height: 100px;
        margin: -44px 0 0 -12px;
      `}
    >
      <span
        css={css`
          display: block;
          height: 47px;
          width: 47px;
          position: absolute;
          top: 0;
          left: 0;
          opacity: ${props.isMapDraggingOrZooming ? "0.5" : "1"};
          background: transparent url(/static/css/images/marker-shadow.png) 0
            3px no-repeat scroll;
          background-position: ${props.isMapDraggingOrZooming
            ? "6px -9px"
            : "0 0"};
          transition: opacity 0s, background-position 0.3s ease;
        `}
      />
      {props.isMapDraggingOrZooming && (
        <span
          css={{
            display: "block",
            position: "absolute",
            width: "18px",
            height: "12px",
            background:
              "transparent url(/static/css/images/marker-x.png) 0 0 no-repeat scroll",
            left: "4px",
            top: "37px",
            transition: "opacity 0.25s",
          }}
        />
      )}
      <span
        css={css`
          display: block;
          width: 25px;
          height: 41px;
          background: transparent url(/static/css/images/marker-plus.png) 0 0
            no-repeat scroll;
          position: relative;
          top: ${props.isMapDraggingOrZooming ? "-20px" : "3px"};
          transition: top 0.4s ease;
        `}
      />
      {!props.isMapDraggedOrZoomed && (
        <span
          css={theme => ({
            width: "175px",
            height: "175px",
            display: "block",
            position: "absolute",
            top: "-85px",
            left: "-64px",
            background:
              "url(/static/css/images/marker-arrow-overlay.png) no-repeat",
            backgroundSize: "150px",
            textAlign: "center",
            fontFamily: theme.text.bodyFontFamily,

            "&:before": {
              // TODO: translate this string, when react-i18next is ported over:
              content: `"${"Drag the map"}"`,
              textTransform: "uppercase",
              fontWeight: 800,
              color: "#ffff00",
              textShadow:
                "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
              position: "absolute",
              top: "20px",
              left: 0,
              right: 0,
            },
          })}
        />
      )}
    </span>
  );
};

const mapStateToProps = (state: any): StateProps => ({
  isMapCenterpointVisible: uiVisibilitySelector("mapCenterpoint", state),
});

export default connect(mapStateToProps)(MapCenterpoint);

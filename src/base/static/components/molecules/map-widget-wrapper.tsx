/** @jsx jsx */
import * as React from "react";
import { jsx } from "@emotion/core";
import Card from "@material-ui/core/Card";
import { makeStyles } from "@material-ui/styles";

import { getReadableColor } from "../../utils/color";

type MapWidgetBackgroundProps = {
  color: "black" | "white";
  children: React.ReactNode;
};

const COLORS = {
  black: "rgba(0,0,0,0.7)",
  white: "rgba(255,255,255,0.85)",
};

const useStyles = makeStyles({
  root: props => ({
    backgroundColor: COLORS[props.color],
    color: getReadableColor(COLORS[props.color]),
    width: "400px",
    padding: "8px",
    borderRadius: "8px",
    marginTop: "8px",
  }),
  label: props => ({
    color: getReadableColor(COLORS[props.color]),
  }),
});

const MapWidgetBackground = (props: MapWidgetBackgroundProps) => {
  const classes = useStyles(props);

  return (
    <Card classes={{ root: classes.root }}>{props.children(classes)}</Card>
  );
};

export default MapWidgetBackground;

/** @jsx jsx */
import * as React from "react";
import { jsx } from "@emotion/core";
import Card from "@material-ui/core/Card";
import { makeStyles } from "@material-ui/styles";

import { getReadableColor } from "../../utils/color";

type MapWidgetWrapperProps = {
  color: "black" | "white";
  children: Function;
};

const COLORS = {
  black: "rgba(0,0,0,0.7)",
  white: "rgba(255,255,255,0.85)",
};

const useStyles = makeStyles({
  root: (props: { color: string }) => ({
    backgroundColor: COLORS[props.color],
    color: getReadableColor(COLORS[props.color]),
    padding: "8px",
    borderRadius: "8px",
    marginTop: "8px",
  }),
  label: props => ({
    color: getReadableColor(COLORS[props.color]),
  }),
});

const MapWidgetWrapper = (props: MapWidgetWrapperProps) => {
  const classes = useStyles(props);

  return (
    <Card classes={{ root: classes.root }}>{props.children(classes)}</Card>
  );
};

export default MapWidgetWrapper;

/** @jsx jsx */
import * as React from "react";
import { jsx } from "@emotion/core";
import { StylesProvider } from "@material-ui/styles";

// This provider re-orders the CSS injections from material-ui so that
// they can be overridden by our CSS-in-JS libs, like emotion.
// References:
// We are following this approach, but with the V4 changes:
// https://medium.com/sipios/use-styled-components-with-material-ui-react-e0759f9a15ce
// https://material-ui.com/customization/css-in-js/#css-injection-order
// https://stackoverflow.com/questions/48791796/material-ui-overrides-react-emotion-rules

type Props = {
  children: React.ReactNode;
};

const Provider: React.FunctionComponent<Props> = props => {
  return <StylesProvider injectFirst>{props.children}</StylesProvider>;
};

export default Provider;

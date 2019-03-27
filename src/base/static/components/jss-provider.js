import React from "react";
import PropTypes from "prop-types";
import { create } from "jss";
import JssProvider from "react-jss/lib/JssProvider";
import { createGenerateClassName, jssPreset } from "@material-ui/core";

// This provider re-orders the CSS injections from material-ui so that
// they can be overridden by our CSS-in-JS libs, like emotion.
// References:
// https://material-ui.com/customization/css-in-js/#css-injection-order
// https://stackoverflow.com/questions/48791796/material-ui-overrides-react-emotion-rules

const jssOptions = jssPreset();
const jss = create({
  ...jssOptions,
  insertionPoint: "mui-jss-insertion-point",
});

const generateClassName = createGenerateClassName();

const Provider = props => {
  return (
    <JssProvider jss={jss} generateClassName={generateClassName}>
      {props.children}
    </JssProvider>
  );
};

Provider.propTypes = {
  children: PropTypes.node,
};

export default Provider;

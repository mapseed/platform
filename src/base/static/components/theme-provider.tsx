/** @jsx jsx */
import * as React from "react";
import { jsx } from "@emotion/core";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { ThemeProvider as EmotionThemeProvider } from "emotion-theming";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { themePropType, themeSelector } from "../state/ducks/app-config";
import { Global } from "@emotion/core";

import baseTheme, { globalStyles, baseMuiTheme } from "../../../theme";
import { lighten, darken, getReadableColor } from "../utils/color";

const lookup = (path, obj) =>
  path.reduce((memo, key) => (memo && memo[key] ? memo[key] : null), obj);

const ThemeProvider = ({ flavorTheme, children }) => {
  const theme = {
    ...baseTheme,
    ...flavorTheme,
    brand: { ...baseTheme.brand, ...flavorTheme.brand },
    bg: {
      ...baseTheme.bg,
      ...flavorTheme.bg,
    },
    text: { ...baseTheme.text, ...flavorTheme.text },
  };

  // TODO: When Emotion themeing is gone, restructure flavor themes to match
  // the MUI schema.
  const flavorPalettePrimary = lookup(["brand", "primary"], flavorTheme);
  const flavorPaletteSecondary = lookup(["brand", "secondary"], flavorTheme);
  const flavorPaletteAccent = lookup(["brand", "accent"], flavorTheme);
  const flavorPaletteError = lookup(["brand", "error"], flavorTheme);
  const flavorTitleFontFamily = lookup(
    ["text", "titleFontFamily"],
    flavorTheme,
  );
  const flavorBodyFontFamily = lookup(["text", "bodyFontFamily"], flavorTheme);
  const muiTheme = createMuiTheme({
    ...baseMuiTheme,
    pallette: {
      ...baseMuiTheme.palette,
      primary: {
        ...baseMuiTheme.palette.primary,
        main: flavorPalettePrimary,
        light: lighten(flavorPalettePrimary, 10),
        dark: darken(flavorPalettePrimary, 10),
        contrastText: getReadableColor(flavorPalettePrimary),
      },
      secondary: {
        ...baseMuiTheme.palette.secondary,
        main: flavorPaletteSecondary,
        light: lighten(flavorPaletteSecondary, 10),
        dark: darken(flavorPaletteSecondary, 10),
        contrastText: getReadableColor(flavorPaletteSecondary),
      },
      accent: {
        ...baseMuiTheme.palette.accent,
        main: flavorPaletteAccent,
        light: lighten(flavorPaletteAccent, 10),
        dark: darken(flavorPaletteAccent, 10),
        contrastText: getReadableColor(flavorPaletteAccent),
      },
      error: {
        ...baseMuiTheme.palette.error,
        main: flavorPaletteError,
        light: lighten(flavorPaletteError, 10),
        dark: darken(flavorPaletteError, 10),
        contrastText: getReadableColor(flavorPaletteError),
      },
    },
    typography: {
      ...baseMuiTheme.typography,
      h1: {
        ...baseMuiTheme.typography.h1,
        fontFamily: flavorTitleFontFamily,
      },
      h2: {
        ...baseMuiTheme.typography.h2,
        fontFamily: flavorTitleFontFamily,
      },
      h3: {
        ...baseMuiTheme.typography.h3,
        fontFamily: flavorTitleFontFamily,
      },
      h4: {
        ...baseMuiTheme.typography.h4,
        fontFamily: flavorTitleFontFamily,
      },
      h5: {
        ...baseMuiTheme.typography.h5,
        fontFamily: flavorTitleFontFamily,
      },
      h6: {
        ...baseMuiTheme.typography.h6,
        fontFamily: flavorTitleFontFamily,
      },
      body1: {
        ...baseMuiTheme.typography.body1,
        fontFamily: flavorBodyFontFamily,
      },
      body2: {
        ...baseMuiTheme.typography.body2,
        fontFamily: flavorBodyFontFamily,
      },
    },
  });

  console.log("muiTheme", muiTheme)

  return (
    <EmotionThemeProvider theme={theme}>
      <MuiThemeProvider theme={muiTheme}>
        <Global styles={globalStyles} />
        {children}
      </MuiThemeProvider>
    </EmotionThemeProvider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
  flavorTheme: themePropType,
};

const mapStateToProps = state => ({
  flavorTheme: themeSelector(state),
});

export default connect(mapStateToProps)(ThemeProvider);

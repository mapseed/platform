/** @jsx jsx */
import * as React from "react";
import { jsx } from "@emotion/core";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { ThemeProvider as EmotionThemeProvider } from "emotion-theming";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import {
  PaletteColor,
  PaletteColorOptions,
} from "@material-ui/core/styles/createPalette";
import { themePropType, themeSelector } from "../state/ducks/app-config";
import { Global } from "@emotion/core";

import baseTheme, { globalStyles, baseMuiTheme } from "../../../theme";
import { lighten, darken, getReadableColor } from "../utils/color";

// Customizations for Material's base Theme object:
declare module "@material-ui/core/styles/createPalette" {
  interface Palette {
    accent: PaletteColor;
  }

  interface PaletteOptions {
    accent: PaletteColorOptions;
  }
}

declare module "@material-ui/core/styles/createTypography" {
  type ExtendedThemeStyle =
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "subtitle1"
    | "subtitle2"
    | "body1"
    | "body2"
    | "caption"
    | "button"
    | "overline"
    | "strong";

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface TypographyOptions
    extends Partial<
      Record<ExtendedThemeStyle, TypographyStyleOptions> & FontStyleOptions
    > {}
}

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
  const {
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    body1,
    body2,
    strong,
  } = baseMuiTheme.typography;
  const { primary, secondary, accent, error } = baseMuiTheme.palette;
  const primaryColor = lookup(["brand", "primary"], flavorTheme) || primary;
  const secondaryColor =
    lookup(["brand", "secondary"], flavorTheme) || secondary;
  const accentColor = lookup(["brand", "accent"], flavorTheme) || accent;
  const errorColor = lookup(["brand", "error"], flavorTheme) || error;
  const flavorTitleFontFamily = lookup(
    ["text", "titleFontFamily"],
    flavorTheme,
  );
  const flavorBodyFontFamily = lookup(["text", "bodyFontFamily"], flavorTheme);
  const muiTheme = createMuiTheme({
    palette: {
      primary: {
        main: primaryColor,
        light: lighten(primaryColor, 10),
        dark: darken(primaryColor, 10),
        contrastText: getReadableColor(primaryColor),
      },
      secondary: {
        main: secondaryColor,
        light: lighten(secondaryColor, 10),
        dark: darken(secondaryColor, 10),
        contrastText: getReadableColor(secondaryColor),
      },
      accent: {
        main: accentColor,
        light: lighten(accentColor, 10),
        dark: darken(accentColor, 10),
        contrastText: getReadableColor(accentColor),
      },
      error: {
        main: errorColor,
        light: lighten(errorColor, 10),
        dark: darken(errorColor, 10),
        contrastText: getReadableColor(errorColor),
      },
    },
    typography: {
      ...baseMuiTheme.typography,
      h1: {
        ...h1,
        fontFamily: flavorTitleFontFamily || h1.fontFamily,
      },
      h2: {
        ...h2,
        fontFamily: flavorTitleFontFamily || h2.fontFamily,
      },
      h3: {
        ...h3,
        fontFamily: flavorTitleFontFamily || h3.fontFamily,
      },
      h4: {
        ...h4,
        fontFamily: flavorTitleFontFamily || h4.fontFamily,
      },
      h5: {
        ...h5,
        fontFamily: flavorTitleFontFamily || h5.fontFamily,
      },
      h6: {
        ...h6,
        fontFamily: flavorTitleFontFamily || h6.fontFamily,
      },
      body1: {
        ...body1,
        fontFamily: flavorBodyFontFamily || body1.fontFamily,
      },
      body2: {
        ...body2,
        fontFamily: flavorBodyFontFamily || body2.fontFamily,
      },
      strong: {
        ...strong,
      },
    },
  });

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

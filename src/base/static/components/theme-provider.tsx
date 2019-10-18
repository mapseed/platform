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
import {
  lighten,
  darken,
  getReadableColor,
  makePaletteColors,
} from "../utils/color";

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
  const flavorPrimaryColor = lookup(["brand", "primary"], flavorTheme);
  const flavorSecondaryColor = lookup(["brand", "secondary"], flavorTheme);
  const flavorAccentColor = lookup(["brand", "accent"], flavorTheme);
  const flavorErrorColor = lookup(["brand", "error"], flavorTheme);
  const flavorTitleFontFamily = lookup(
    ["text", "titleFontFamily"],
    flavorTheme,
  );
  const flavorBodyFontFamily = lookup(["text", "bodyFontFamily"], flavorTheme);
  const muiTheme = createMuiTheme({
    palette: {
      primary: flavorPrimaryColor
        ? makePaletteColors(flavorPrimaryColor)
        : primary,
      secondary: flavorSecondaryColor
        ? makePaletteColors(flavorSecondaryColor)
        : secondary,
      accent: flavorAccentColor ? makePaletteColors(flavorAccentColor) : accent,
      error: flavorErrorColor ? makePaletteColors(flavorErrorColor) : error,
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

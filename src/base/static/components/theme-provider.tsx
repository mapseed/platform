/** @jsx jsx */
import * as React from "react";
import { jsx } from "@emotion/core";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { ThemeProvider as EmotionThemeProvider } from "emotion-theming";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { themePropType, themeSelector } from "../state/ducks/app-config";
import { Global } from "@emotion/core";

import baseTheme, { globalStyles } from "../../../theme";

export interface MuiTheme {
  palette: {
    primary: {
      main: string;
    };
    secondary: {
      light: string;
      main: string;
      contrastText: string;
    };
  };
  typography: {
    h1: {};
    h2: {};
    h3: {};
    h4: {};
    h5: {};
    h6: {};
    body1: {};
    body2: {};
    fontFamily: {};
  };
}

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

  const muiTheme = createMuiTheme({
    // TODO: Start using this schema in our Config and our Emotion
    // theme provider
    palette: {
      primary: {
        // light: will be calculated from palette.primary.main,
        main: theme.brand.primary,
        // dark: will be calculated from palette.primary.main,
        // contrastText: will be calculated to contrast with palette.primary.main
      },
      secondary: {
        light: theme.text.highlighted,
        main: theme.brand.secondary,
        // dark: will be calculated from palette.secondary.main,
        contrastText: theme.text.primary,
      },
      // error: will use the default color
    },
    typography: {
      // Fonts configured like so:
      // https://material-ui.com/customization/typography/#font-family
      fontFamily: [
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(","),
      // Fonts, font sizes, etc, can be configured here:
      // https://material-ui.com/customization/typography/#font-size
      h5: {
        fontFamily: "Raleway",
      },
      body1: {
        fontFamily: "Raleway",
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

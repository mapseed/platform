import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { ThemeProvider as EmotionThemeProvider } from "emotion-theming";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { themePropType, themeSelector } from "../state/ducks/app-config";
import { Global } from "@emotion/core";

import baseTheme, { globalStyles } from "../../../theme";

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
      useNextVariants: true,
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

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

  const muiTheme = createMuiTheme(baseMuiTheme);

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

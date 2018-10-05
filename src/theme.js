import PropTypes from "prop-types";
import { injectGlobal } from "emotion";

// Add font faces:
injectGlobal`
  @font-face {
    font-family: "Lithos";
    src: url("/static/css/lithos.ttf");
  }
  @font-face {
    font-family: "Bowlby";
    src: url("/static/css/BowlbyOneSC-Regular.ttf");
  }
  @font-face {
    font-family: "Josefin Sans";
    src: url("/static/css/JosefinSans-Regular.ttf")
  }
  @font-face {
    font-family: "Montserrat";
    src: url("/static/css/Montserrat-Regular.ttf")
  }
`;

export const themePropTypes = PropTypes.shape({
  brand: PropTypes.shape({
    primary: PropTypes.string.isRequired,
    secondary: PropTypes.string.isRequired,
  }).isRequired,
}).isRequired;

// This `theme` module should not be imported directly. Instead, it
// should be imported and used with emotion-theming's ThemeProvider:
//
//  ```
//  <ThemeProvider theme={theme}>
//    <MyPage/>
//  </ThemeProvider>,
//  ```
//
// Then we can access the theme directly within an emotion component:
//
// ```
// const Headline = styled('h1')(props => {
//   color: ${props => props.theme.brand.primary};
//   font: 20px/1.5 sans-serif;
// })
// ```
//
// https://github.com/emotion-js/emotion/tree/8537adc317edfbe5068b91a0e2685a4aa5822309/packages/emotion-theming#usage
//
// Or we can access the theme from our own components using the withTheme HOC:
//
// ```
// import { withTheme } from "emotion-theming"
// const MyComponent = props => {
//   console.log(props.theme.brand.primary) // this will print out "#007fbf"
// }
// export default withTheme(MyComponent)
// ```
//
// https://github.com/emotion-js/emotion/tree/8537adc317edfbe5068b91a0e2685a4aa5822309/packages/emotion-theming#withthemecomponent-reactcomponent-function

// TODO: Not sure if this is the right structure for our theme. We
// made need to shuffle it around, or research a better heuristic, until
// we find one that works:
const theme = {
  brand: {
    accent: "#0af",
    primary: "#007fbf",
    secondary: "#a3c7d9",
  },
  bg: {
    default: "#007fbf",
    light: "#a3c7d9",
  },
  text: {
    primary: "#fff",
    secondary: "#a3c7d9",
    headerFontFamily: "Roboto,sans-serif",
    bodyFontFamily: "Roboto,sans-serif",
    textTransform: "uppercase",
  },
  boxShadow: "-0.25em 0.25em 0 rgba(0, 0, 0, 0.1)",
};

export default theme;

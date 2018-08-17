import PropTypes from "prop-types";

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
    primary: "#007fbf",
    secondary: "#e41c62",
    tertiary: "#a3c7d9",
  },
};

export default theme;

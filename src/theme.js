import { css } from "@emotion/core";

// Add font faces and other global styles:
export const globalStyles = theme => css`
  // We support five fonts that can be used throughout Mapseed flavors.
  @font-face {
    font-family: "Raleway-Light";
    src: url("https://s3-us-west-2.amazonaws.com/assets.mapseed.org/fonts/Raleway-Light.ttf");
  }
  @font-face {
    font-family: "Raleway-Regular";
    src: url("https://s3-us-west-2.amazonaws.com/assets.mapseed.org/fonts/Raleway-Regular.ttf");
  }
  @font-face {
    font-family: "Raleway-ExtraBold";
    src: url("https://s3-us-west-2.amazonaws.com/assets.mapseed.org/fonts/Raleway-ExtraBold.ttf");
  }
  @font-face {
    font-family: "PTSans-Regular";
    src: url("https://s3-us-west-2.amazonaws.com/assets.mapseed.org/fonts/PTSans-Regular.ttf");
  }
  @font-face {
    font-family: "PTSans-Bold";
    src: url("https://s3-us-west-2.amazonaws.com/assets.mapseed.org/fonts/PTSans-Bold.ttf");
  }
  // These styles are intended to mimic the styling of our Atoms on custom
  // pages.
  #mapseed-custom-page-container {
    height: 100%;

    h1 {
      font-family: ${theme.text.titleFontFamily};
      font-size: 2rem;
      margin: 0 0 16px 0;
    }
    h2 {
      font-family: ${theme.text.titleFontFamily};
      font-size: 1.8rem;
      margin: 0 0 16px 0;
    }
    h3 {
      font-family: ${theme.text.titleFontFamily};
      font-size: 1.5rem;
      margin: 0 0 16px 0;
    }
    h4 {
      font-family: ${theme.text.titleFontFamily};
      font-size: 1.1rem;
      margin: 0 0 16px 0;
    }
    h5 {
      font-family: ${theme.text.titleFontFamily};
      font-size: 1rem;
      margin: 0 0 16px 0;
    }
    h6 {
      font-family: ${theme.text.titleFontFamily};
      font-size: 1rem;
      margin: 0 0 16px 0;
    }
    img {
      width: 100%;
      max-width: 100%;
      margin: 0 0 10px 0;
    }
    a {
      font-family: ${theme.text.bodyFontFamily};
      text-decoration: none;
    }
    p,
    strong,
    em {
      font-family: ${theme.text.bodyFontFamily};
      font-size: 1.16rem;
      margin: 0 0 16px 0;
    }
    &:after {
      content: " ";
      display: block;
      height: 0;
      clear: both;
    }
  }
`;

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
    default: "#fff",
    light: "#a3c7d9",
    highlighted: "#007fbf",
  },
  input: {
    border: "0.25em solid #a3c7d9",
    padding: "0.5em",
    autofillBgColor: "#ffffe0",
    defaultBgColor: "#ffffff",
  },
  text: {
    primary: "#36454f",
    secondary: "#fff",
    highlighted: "#fff",
    headerFontFamily: "Raleway-Regular,sans-serif",
    bodyFontFamily: "Raleway-Light,sans-serif",
    navBarFontFamily: "Raleway-Regular,sans-serif",
    textTransform: "uppercase",
    titleColor: "#aaa",
    titleFontFamily: "Raleway-Regular,sans-serif",
  },
  map: {
    addPlaceButtonBackgroundColor: "rgba(242,82,24,0.89)",
    addPlaceButtonHoverBackgroundColor: "#ff8b61",
  },
  boxShadow: "-0.25em 0.25em 0 rgba(0, 0, 0, 0.1)",
};

export default theme;

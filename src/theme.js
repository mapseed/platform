import { css } from "@emotion/core";

// Add font faces and other global styles:
export const globalStyles = css`
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
    src: url("/static/css/JosefinSans-Regular.ttf");
  }
  @font-face {
    font-family: "Montserrat";
    src: url("/static/css/Montserrat-Regular.ttf");
  }
  @font-face {
    font-family: "AlfaSlabOne-Regular";
    src: url("/static/css/AlfaSlabOne-Regular.ttf");
  }
  @font-face {
    font-family: "Quicksand Regular";
    src: url("/static/css/Quicksand-Regular.otf");
  }
  @font-face {
    font-family: "proxima-nova";
    src: url("/static/css/proximanova-regular.otf");
  }
  @font-face {
    font-family: "Palanquin";
    src: url("/static/css/palanquindark-regular.ttf");
  }
  @font-face {
    font-family: "Raleway";
    src: url("/static/css/Raleway-Regular.ttf");
  }
  @font-face {
    font-family: "Raleway-ExtraLight";
    src: url("/static/css/Raleway-ExtraLight.ttf");
  }
  @font-face {
    font-family: "PTSans";
    src: url("/static/css/PT-Sans-Regular.ttf");
  }
  @font-face {
    font-family: "PTSansBold";
    src: url("/static/css/PT-Sans-Bold.ttf");
  }

  // These styles are intended to mimic the styling of our Atoms on custom
  // pages.
  #mapseed-custom-page-container {
    h1 {
      font-size: 2rem;
      margin: 0 0 16px 0;
    }
    h2 {
      font-size: 1.8rem;
      margin: 0 0 16px 0;
    }
    h3 {
      font-size: 1.5rem;
      margin: 0 0 16px 0;
    }
    h4 {
      font-size: 1.1rem;
      margin: 0 0 16px 0;
    }
    h5 {
      font-size: 1rem;
      margin: 0 0 16px 0;
    }
    h6 {
      font-size: 1rem;
      margin: 0 0 16px 0;
    }
    img {
      width: 100%;
      max-width: 100%;
      margin: 0 0 10px 0;
    }
    a {
      text-decoration: none;
    }
    p {
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
    headerFontFamily: "Roboto,sans-serif",
    bodyFontFamily: "Roboto,sans-serif",
    navBarFontFamily: "Roboto,sans-serif",
    textTransform: "uppercase",
    titleColor: "#aaa",
    titleFontFamily: "Roboto,sans-serif",
  },
  map: {
    addPlaceButtonBackgroundColor: "rgba(242,82,24,0.89)",
    addPlaceButtonHoverBackgroundColor: "#ff8b61",
  },
  boxShadow: "-0.25em 0.25em 0 rgba(0, 0, 0, 0.1)",
};

export default theme;

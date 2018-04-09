import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import "raf/polyfill";

// https://github.com/i18next/react-i18next/issues/417
jest.mock("react-i18next", () => ({
  // this mock makes sure any components using the translate HoC receive the t function as a prop
  translate: () => Component => {
    Component.defaultProps = { ...Component.defaultProps, t: () => "" };
    return Component;
  },
}));

Enzyme.configure({ adapter: new Adapter() });

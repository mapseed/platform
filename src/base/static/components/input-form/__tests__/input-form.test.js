import React from "react";
import { shallow } from "enzyme";
import InputForm from "../index.js";
import FormField from "../../form-fields/form-field";
import constants from "../../../constants";

describe("InputForm", () => {
  const eventMock = { preventDefault: () => {} };
  test("renders input form", () => {
    const props = {
      container: {},
      hideCenterPoint: () => {},
      hideSpotlightMask: () => {},
      selectedCategoryConfig: {
        fields: [{ name: "test1" }, { name: "test2" }],
      },
      map: {
        on: () => {},
        off: () => {},
        getCenter: () => {},
      },
      mapConfig: {},
      places: {},
      router: {},
      showNewPin: () => {},
    };

    const wrapper = shallow(<InputForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
  test("renders form fields", () => {
    const props = {
      container: {},
      hideCenterPoint: () => {},
      hideSpotlightMask: () => {},
      selectedCategoryConfig: {
        fields: [{ name: "test1" }, { name: "test2" }],
      },
      map: {
        on: () => {},
        off: () => {},
        getCenter: () => {},
      },
      mapConfig: {},
      places: {},
      router: {},
      showNewPin: () => {},
    };

    const wrapper = shallow(<InputForm {...props} />);
    expect(wrapper.find(FormField)).toHaveLength(2);
  });


});

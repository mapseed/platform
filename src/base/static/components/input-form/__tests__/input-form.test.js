import React from "react";
import { shallow } from "enzyme";
import InputForm from "../index.js";
import FormField from "../../form-fields/form-field";

describe("InputForm", () => {
  // TODO: consider generalizing this stub into a mock:
  const eventStub = { preventDefault: () => {} };
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

  test("renders form validation errors", () => {
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
    wrapper.instance().onSubmit(eventStub);
    expect(wrapper.find(FormField)).toHaveLength(2);
  });
});

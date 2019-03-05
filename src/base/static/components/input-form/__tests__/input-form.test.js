import React from "react";
import { shallow } from "enzyme";
import { InputForm } from "../index.js";
import FormField from "../../form-fields/form-field";
import WarningMessagesContainer from "../../ui-elements/warning-messages-container";
import { OrderedMap, Map } from "immutable";

import { place as placeConfig } from "config";

jest.mock("../../../utils/scroll-helpers");

describe("InputForm", () => {
  // TODO: consider generalizing this stub into a mock:
  const eventStub = { preventDefault: () => {} };
  const defaultProps = {
    containers: {},
    hideCenterPoint: () => {},
    hideSpotlightMask: () => {},
    selectedCategory: "someCategory",
    setActiveDrawingTool: () => {},
    map: {
      on: () => {},
      off: () => {},
      getCenter: () => {},
    },
    placeConfig: placeConfig,
    places: {},
    router: {
      on: () => {},
    },
    showNewPin: () => {},
  };
  test("renders input form", () => {
    const wrapper = shallow(<InputForm {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  test("renders form validation errors", () => {
    const wrapper = shallow(<InputForm {...defaultProps} />);
    wrapper.setState({
      formValidationErrors: new Set(["asdf", "asdf2"]),
    });

    expect(wrapper.find(WarningMessagesContainer)).toHaveLength(1);
  });

  test("renders form fields", () => {
    const wrapper = shallow(<InputForm {...defaultProps} />);
    expect(wrapper.find(FormField)).toHaveLength(3);
  });

  test("onSubmit creates form validation errors", () => {
    const fieldName1 = "test1";
    const fieldName2 = "test2";
    const fieldName3 = "test3";
    const props = {
      ...defaultProps,
    };

    const wrapper = shallow(<InputForm {...props} />);
    const errorMessage1 = "error1";
    const errorMessage2 = "error2";
    const errorMessage3 = "error3";
    const mapNotDraggedError = "mapNotDragged";
    wrapper.setState({
      fields: OrderedMap({
        [fieldName1]: Map({
          isVisible: true,
          isValid: true,
          message: errorMessage1,
          config: Map(),
        }),
        [fieldName2]: Map({
          isVisible: true,
          isValid: true,
          message: errorMessage2,
          config: Map(),
        }),
        [fieldName3]: Map({
          isVisible: true,
          isValid: false,
          message: errorMessage3,
          config: Map(),
        }),
      }),
    });

    wrapper.instance().onSubmit(eventStub);
    expect(wrapper.state("formValidationErrors")).toEqual(
      new Set([errorMessage3, mapNotDraggedError]),
    );
  });

  test("multi stage forms render fields correctly", () => {
    const categoryName = "someMultiStageCategory";
    const fieldName1 = "test1";
    const fieldName2 = "test2";
    const fieldName3 = "test3";
    const fieldName4 = "test4";
    const props = {
      ...defaultProps,
      selectedCategory: categoryName,
    };

    const wrapper = shallow(<InputForm {...props} />);
    wrapper.setState({
      fields: OrderedMap({
        [fieldName1]: Map({
          isVisible: true,
          value: "",
          isValid: true,
          config: Map(),
        }),
        [fieldName2]: Map({
          isVisible: true,
          value: "",
          isValid: true,
          config: Map(),
        }),
        [fieldName3]: Map({
          isVisible: true,
          value: "",
          isValid: true,
          config: Map(),
        }),
        [fieldName4]: Map({
          isVisible: true,
          value: "",
          isValid: true,
          config: Map(),
        }),
      }),
    });

    expect(wrapper.find(FormField)).toHaveLength(3);
    wrapper.setState({
      currentStage: 2,
    });
    expect(wrapper.find(FormField)).toHaveLength(1);
  });
});

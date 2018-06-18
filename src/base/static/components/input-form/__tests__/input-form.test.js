import React from "react";
import { shallow } from "enzyme";
import InputForm from "../index.js";
import FormField from "../../form-fields/form-field";
import constants from "../../../constants";
import WarningMessagesContainer from "../../ui-elements/warning-messages-container";
import { OrderedMap, Map } from "immutable";

jest.mock("../../../utils/scroll-helpers");

describe("InputForm", () => {
  // TODO: consider generalizing this stub into a mock:
  const eventStub = { preventDefault: () => {} };
  const defaultProps = {
    containers: {},
    hideCenterPoint: () => {},
    hideSpotlightMask: () => {},
    selectedCategory: "someCategory",
    map: {
      on: () => {},
      off: () => {},
      getCenter: () => {},
    },
    places: {},
    router: {},
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
    wrapper.setState({
      fields: OrderedMap({
        [fieldName1]: Map({
          [constants.FIELD_VISIBILITY_KEY]: true,
          [constants.FIELD_VALIDITY_KEY]: true,
          [constants.FIELD_VALIDITY_MESSAGE_KEY]: errorMessage1,
        }),
        [fieldName2]: Map({
          [constants.FIELD_VISIBILITY_KEY]: true,
          [constants.FIELD_VALIDITY_KEY]: true,
          [constants.FIELD_VALIDITY_MESSAGE_KEY]: errorMessage2,
        }),
        [fieldName3]: Map({
          [constants.FIELD_VISIBILITY_KEY]: true,
          [constants.FIELD_VALIDITY_KEY]: false,
          [constants.FIELD_VALIDITY_MESSAGE_KEY]: errorMessage3,
        }),
      }),
    });

    wrapper.instance().onSubmit(eventStub);
    expect(wrapper.state("formValidationErrors")).toEqual(
      new Set([errorMessage3]),
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
          [constants.FIELD_VISIBILITY_KEY]: true,
          [constants.FIELD_VALUE_KEY]: "",
          [constants.FIELD_VALIDITY_KEY]: true,
        }),
        [fieldName2]: Map({
          [constants.FIELD_VISIBILITY_KEY]: true,
          [constants.FIELD_VALUE_KEY]: "",
          [constants.FIELD_VALIDITY_KEY]: true,
        }),
        [fieldName3]: Map({
          [constants.FIELD_VISIBILITY_KEY]: true,
          [constants.FIELD_VALUE_KEY]: "",
          [constants.FIELD_VALIDITY_KEY]: true,
        }),
        [fieldName4]: Map({
          [constants.FIELD_VISIBILITY_KEY]: true,
          [constants.FIELD_VALUE_KEY]: "",
          [constants.FIELD_VALIDITY_KEY]: true,
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

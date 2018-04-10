import React from "react";
import { shallow } from "enzyme";
import InputForm from "../index.js";
import FormField from "../../form-fields/form-field";
import constants from "../../../constants";
import WarningMessagesContainer from "../../ui-elements/warning-messages-container";
import { OrderedMap, Map } from "immutable";

describe("InputForm", () => {
  // TODO: consider generalizing this stub into a mock:
  const categoryName = "someCategory";
  const eventStub = { preventDefault: () => {} };
  const defaultProps = {
    container: {},
    hideCenterPoint: () => {},
    hideSpotlightMask: () => {},
    selectedCategoryConfig: {
      category: categoryName,
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
    expect(wrapper.find(FormField)).toHaveLength(2);
  });

  test("onSubmit creates form validation errors", () => {
    const fieldName1 = "test1";
    const fieldName2 = "test2";
    const fieldName3 = "test3";
    const props = {
      ...defaultProps,
      selectedCategoryConfig: {
        fields: [
          { name: fieldName1, [constants.FIELD_VALIDITY_KEY]: "error1" },
          { name: fieldName2 },
          { name: fieldName3, [constants.FIELD_VALIDITY_KEY]: "error3" },
        ],
      },
    };

    const wrapper = shallow(<InputForm {...props} />);
    const errorKey1 = "error1";
    const errorKey2 = "error2";
    const errorKey3 = "error3";
    wrapper.setState({
      fields: OrderedMap({
        [fieldName1]: Map({
          [constants.FIELD_RENDER_KEY]: categoryName + fieldName1,
          [constants.FIELD_VALUE_KEY]: "",
          [constants.FIELD_VALIDITY_KEY]: true,
          [constants.FIELD_VALIDITY_MESSAGE_KEY]: errorKey1,
        }),
        [fieldName2]: Map({
          [constants.FIELD_RENDER_KEY]: categoryName + fieldName2,
          [constants.FIELD_VALUE_KEY]: "",
          [constants.FIELD_VALIDITY_KEY]: false,
          [constants.FIELD_VALIDITY_MESSAGE_KEY]: errorKey2,
        }),
        [fieldName3]: Map({
          [constants.FIELD_RENDER_KEY]: categoryName + fieldName3,
          [constants.FIELD_VALUE_KEY]: "",
          [constants.FIELD_VALIDITY_KEY]: false,
          [constants.FIELD_VALIDITY_MESSAGE_KEY]: errorKey3,
        }),
      }),
      updatingField: null,
      isFormSubmitting: false,
      formValidationErrors: new Set(),
      showValidityStatus: false,
      isMapPositioned: false,
    });

    wrapper.instance().onSubmit(eventStub);
    expect(wrapper.state("formValidationErrors")).toEqual(
      new Set([errorKey2, errorKey3]),
    );
  });
});

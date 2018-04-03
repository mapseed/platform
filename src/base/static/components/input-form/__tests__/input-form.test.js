import React from "react";
import { shallow } from "enzyme";
import InputForm from "../index.js";
import FormField from "../../form-fields/form-field";
import { ErrorMessage } from "../../atoms/typography";
import constants from "../../../constants";
import { OrderedMap, Map } from "immutable";

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
        fields: [
          { name: "test1", [constants.FIELD_VALIDITY_KEY]: "error1" },
          { name: "test2" },
          { name: "test3", [constants.FIELD_VALIDITY_KEY]: "error3" },
        ],
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
    wrapper.setState({
      fields: OrderedMap({
        test1: Map({
          [constants.FIELD_RENDER_KEY]: 0,
          [constants.FIELD_VALUE_KEY]: "",
          [constants.FIELD_VALIDITY_KEY]: true,
          [constants.FIELD_VALIDITY_MESSAGE_KEY]: "asdf1",
        }),
        test2: Map({
          [constants.FIELD_RENDER_KEY]: 1,
          [constants.FIELD_VALUE_KEY]: "",
          [constants.FIELD_VALIDITY_KEY]: false,
          [constants.FIELD_VALIDITY_MESSAGE_KEY]: "asdf2",
        }),
        test3: Map({
          [constants.FIELD_RENDER_KEY]: 2,
          [constants.FIELD_VALUE_KEY]: "",
          [constants.FIELD_VALIDITY_KEY]: false,
          [constants.FIELD_VALIDITY_MESSAGE_KEY]: "asdf3",
        }),
      }),
      updatingField: null,
      isFormSubmitting: false,
      formValidationErrors: new Set(),
      showValidityStatus: false,
      isMapPositioned: false,
    });

    wrapper.instance().onSubmit(eventStub);
    expect(wrapper.find(ErrorMessage)).toHaveLength(2);
  });
});

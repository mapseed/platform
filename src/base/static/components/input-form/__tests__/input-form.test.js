import React from "react";
import { shallow } from "enzyme";
import InputForm from "../index.js";
import { OrderedMap } from "immutable";

describe("InputForm", () => {
  test("renders form", () => {
    const props = {
      container: {},
      hideCenterPoint: () => {},
      hideSpotlightMask: () => {},
      selectedCategoryConfig: { fields: [] },
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
    const component = wrapper.dive();
    component.setState({
      fields: OrderedMap(),
      isFormSubmitting: false,
      isMapPositioned: false,
      formValidationErrors: new Set(),
      showValidityStatus: false,
    });
    expect(component).toMatchSnapshot();
  });

  // test("without access token it renders null", () => {
  //   const props = {
  //     isOpen: false,
  //     onCloseDialog() {},
  //     onGoogleSheetIdSelected() {},
  //   };

  //   const wrapper = shallow(<ImportGoogleSheetDialog {...props} />, {
  //     context: { store: mockStore(initialReduxState) },
  //   });
  //   expect(wrapper.dive()).toMatchSnapshot();
  // });
});

import React from "react";
import { shallow } from "enzyme";
const Util = require("../../../../js/utils.js");
jest.mock("../../../../js/utils.js");

import AddAttachmentButton from "../add-attachment-button";
import FileField from "../file-field";
import constants from "../../../../constants";

describe("AddAttachmentButton", () => {
  const defaultProps = {
    id: "foo",
    name: "bar",
    label: "FooBar",
    onChange: () => {},
    onAddAttachment: () => {},
  };

  test("renders add attachment button", () => {
    const wrapper = shallow(<AddAttachmentButton {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  test("converts file to blob format", () => {
    let timesCalled = 0;
    const onChangeProp = jest.fn();
    const onAddAttachmentProp = jest.fn();
    const props = {
      ...defaultProps,
      onChange: onChangeProp,
      onAddAttachment: onAddAttachmentProp,
    };
    const wrapper = shallow(<AddAttachmentButton {...props} />);
    const mockFile = new File(["My file contents"], "myFile");

    const fileToCanvasMock = jest.fn((file, callback, options) => {
      callback({
        toBlob: canvasToBlobMock,
        toDataURL: canvasToDataUrlMock,
      });
    });

    Util.fileToCanvas.mockImplementation(fileToCanvasMock);

    const canvasToBlobMock = jest.fn(cb => {
      cb("blob");
    });

    const canvasToDataUrlMock = jest.fn(fileType => "data-url");

    wrapper
      .find(FileField)
      .first()
      .props()
      .onChange({
        persist: () => {},
        target: {
          name: "target-name",
          files: [mockFile],
        },
      });

    // Internally used functions
    const toBlobCalls = canvasToBlobMock.mock.calls;
    expect(toBlobCalls.length).toEqual(1);

    const toDataUrlCalls = canvasToDataUrlMock.mock.calls;
    expect(toDataUrlCalls.length).toEqual(1);
    const toDataUrlCall = toDataUrlCalls[0];
    expect(toDataUrlCall[0]).toEqual("image/jpeg");

    const toCanvasCalls = fileToCanvasMock.mock.calls;
    expect(toCanvasCalls.length).toEqual(1);
    const toCanvasCall = toCanvasCalls[0];
    expect(toCanvasCall[0]).toEqual(mockFile);
    expect(toCanvasCall[2].maxHeight).toEqual(800);
    expect(toCanvasCall[2].maxHeight).toEqual(800);
    expect(toCanvasCall[2].canvas).toEqual(true);

    // Prop hooks
    const onAddAttachmentCalls = onAddAttachmentProp.mock.calls;
    expect(onAddAttachmentCalls.length).toEqual(1);
    const onAddAttachmentCall = onAddAttachmentCalls[0];
    expect(onAddAttachmentCall[0].name).toEqual("bar");
    expect(onAddAttachmentCall[0].type).toEqual("CO");
    expect(onAddAttachmentCall[0].blob).toEqual("blob");
    expect(onAddAttachmentCall[0].file).toEqual("data-url");

    const onChangeCalls = onChangeProp.mock.calls;
    expect(onChangeCalls.length).toEqual(1);
    const onChangeCall = onChangeCalls[0];
    expect(onChangeCall[0]).toEqual("target-name");
    expect(onChangeCall[1]).toEqual("");
  });
});

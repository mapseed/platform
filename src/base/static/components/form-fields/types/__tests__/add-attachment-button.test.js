import React from "react";
import { shallow } from "enzyme";
const Util = require("../../../../js/utils.js");
jest.mock("../../../../js/utils.js");

import AddAttachmentButton from "../add-attachment-button";
import FileField from "../file-field";
import constants from "../../../../constants";

describe("AddAttachmentButton", () => {
  const defaultProps = {
    id: "test-id",
    name: "test-name",
    label: "test-label",
    onChange: () => {},
    onAddAttachment: () => {},
  };

  test("renders add attachment button", () => {
    const wrapper = shallow(<AddAttachmentButton {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  test("converts file to blob format", () => {
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
    expect(canvasToBlobMock).toHaveBeenCalledTimes(1);

    expect(canvasToDataUrlMock).toHaveBeenCalledTimes(1);
    expect(canvasToDataUrlMock).toHaveBeenCalledWith("image/jpeg");

    expect(fileToCanvasMock).toHaveBeenCalledTimes(1);
    expect(fileToCanvasMock).toHaveBeenCalledWith(
      mockFile,
      expect.any(Function),
      expect.objectContaining({
        maxHeight: 800,
        maxWidth: 800,
        canvas: true,
      }),
    );

    // Prop hooks
    expect(onAddAttachmentProp).toHaveBeenCalledTimes(1);
    expect(onAddAttachmentProp).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "test-name",
        type: "CO",
        blob: "blob",
        file: "data-url",
      }),
    );

    expect(onChangeProp).toHaveBeenCalledTimes(1);
    expect(onChangeProp).toHaveBeenCalledWith("target-name", "");
  });
});

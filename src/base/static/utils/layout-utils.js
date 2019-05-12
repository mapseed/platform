import { findDOMNode } from "react-dom";

import constants from "../constants";

const getMainContentAreaWidth = ({
  isContentPanelVisible,
  isRightSidebarVisible,
  layout,
}) => {
  switch (layout) {
    case "desktop":
      // UI widths which resize the main content area:
      //  - ContentPanel: 40%
      //  - RightSidebar: 15%
      if (!isContentPanelVisible && !isRightSidebarVisible) {
        return "100%";
      } else if (isContentPanelVisible && !isRightSidebarVisible) {
        return "60%";
      } else if (!isContentPanelVisible && isRightSidebarVisible) {
        return "85%";
      } else if (isContentPanelVisible && isRightSidebarVisible) {
        return "45%";
      }
      break;
    case "mobile":
      return "100%";
  }
};

const getMainContentAreaHeight = ({
  isContentPanelVisible,
  isGeocodeAddressBarEnabled,
  layout,
  isAddPlaceButtonVisible,
  addPlaceButtonRef,
}) => {
  switch (layout) {
    case "desktop":
      return isGeocodeAddressBarEnabled
        ? `calc(100% - ${constants.GEOCODE_ADDRESS_BAR_HEIGHT}px - ${
            constants.DESKTOP_HEADER_HEIGHT
          }px)`
        : `calc(100% - ${constants.DESKTOP_HEADER_HEIGHT}px)`;
    case "mobile":
      // UI heights which resize the main content area:
      //  - ContentPanel: 40%
      if (
        isContentPanelVisible &&
        isGeocodeAddressBarEnabled &&
        !isAddPlaceButtonVisible
      ) {
        return `calc(60% - ${constants.GEOCODE_ADDRESS_BAR_HEIGHT}px)`;
      } else if (
        isContentPanelVisible &&
        !isGeocodeAddressBarEnabled &&
        !isAddPlaceButtonVisible
      ) {
        return "60%";
      } else if (
        !isContentPanelVisible &&
        isGeocodeAddressBarEnabled &&
        !isAddPlaceButtonVisible
      ) {
        return `calc(100% - ${constants.GEOCODE_ADDRESS_BAR_HEIGHT}px)`;
      } else if (
        !isContentPanelVisible &&
        !isGeocodeAddressBarEnabled &&
        !isAddPlaceButtonVisible
      ) {
        return "100%";
      } else if (
        !isContentPanelVisible &&
        !isGeocodeAddressBarEnabled &&
        isAddPlaceButtonVisible
      ) {
        const addPlaceButtonDims = findDOMNode(
          addPlaceButtonRef.current,
        ).getBoundingClientRect();

        return `calc(100% - ${addPlaceButtonDims.height}px)`;
      } else if (
        !isContentPanelVisible &&
        isGeocodeAddressBarEnabled &&
        isAddPlaceButtonVisible
      ) {
        const addPlaceButtonDims = findDOMNode(
          addPlaceButtonRef.current,
        ).getBoundingClientRect();

        return `calc(100% - ${constants.GEOCODE_ADDRESS_BAR_HEIGHT}px - ${
          addPlaceButtonDims.height
        }px)`;
      }
  }
};

const getLayout = () => (window.innerWidth <= 960 ? "mobile" : "desktop");

export { getMainContentAreaWidth, getMainContentAreaHeight, getLayout };

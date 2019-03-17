import { findDOMNode } from "react-dom";

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
      // 42px === fixed height of geocode address bar
      return isGeocodeAddressBarEnabled ? "calc(100% - 42px)" : "100%";
    case "mobile":
      // UI heights which resize the main content area:
      //  - ContentPanel: 40%
      if (isContentPanelVisible && isGeocodeAddressBarEnabled) {
        return "calc(60% - 42px)";
      } else if (isContentPanelVisible && !isGeocodeAddressBarEnabled) {
        return "60%";
      } else if (
        !isContentPanelVisible &&
        isGeocodeAddressBarEnabled &&
        !isAddPlaceButtonVisible
      ) {
        return "calc(100% - 42px)";
      } else if (isContentPanelVisible && !isGeocodeAddressBarEnabled) {
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

        return `calc(100% - 42px - ${addPlaceButtonDims.height}px)`;
      }
  }
};

const getLayout = () => (window.innerWidth <= 960 ? "mobile" : "desktop");

export { getMainContentAreaWidth, getMainContentAreaHeight, getLayout };

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
  layout,
  isGeocodeAddressBarEnabled,
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
      } else if (!isContentPanelVisible && isGeocodeAddressBarEnabled) {
        return "calc(100% - 42px)";
      } else if (isContentPanelVisible && !isGeocodeAddressBarEnabled) {
        return "100%";
      }
  }
};

const getLayout = () => (window.innerWidth <= 960 ? "mobile" : "desktop");

export { getMainContentAreaWidth, getMainContentAreaHeight, getLayout };

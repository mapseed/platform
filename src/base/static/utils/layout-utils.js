const getMainContentAreaWidth = (
  isContentPanelVisible,
  isRightSidebarVisible,
) => {
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
};

const getLayout = () => {}; // TODO

export { getMainContentAreaWidth, getLayout };

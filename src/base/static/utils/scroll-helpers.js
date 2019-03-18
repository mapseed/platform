import { findDOMNode } from "react-dom";

const jumpTo = ({ contentPanelInnerContainerRef, scrollPosition, layout }) => {
  if (layout === "desktop") {
    findDOMNode(
      contentPanelInnerContainerRef.current,
    ).scrollTop = scrollPosition;
  } else if (layout === "mobile") {
    document.getElementsByTagName("html")[0].scrollTop = scrollPosition;
  }
};

export { jumpTo };

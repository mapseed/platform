import { findDOMNode } from "react-dom";

const jumpTo = ({ contentPanelInnerContainerRef, scrollPosition, layout }) => {
  let node;
  if (layout === "desktop") {
    node = findDOMNode(contentPanelInnerContainerRef.current);
  } else if (layout === "mobile") {
    node = document.getElementsByTagName("html")[0];
  }
  if (node) {
    node.scrollTop = scrollPosition;
  } else {
    // eslint-disable-next-line
    console.warn("scroll helpers: no node!");
  }
};

export { jumpTo };

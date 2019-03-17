import { findDOMNode } from "react-dom";

const jumpTo = (ref, topPosition) =>
  (findDOMNode(ref.current).scrollTop = topPosition);

export { jumpTo };

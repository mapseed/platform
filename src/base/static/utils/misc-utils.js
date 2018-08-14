import modernizr from "../../../../.modernizrrc.js";

const isTouchDevice = () => modernizr.touchevents;

export { isTouchDevice };

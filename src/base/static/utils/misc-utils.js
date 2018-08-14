const isTouchDevice = () => {
  if (
    window.ontouchstart ||
    // eslint-disable-next-line no-undef
    (window.DocumentTouch && document instanceof DocumentTouch)
  ) {
    return true;
  }

  return false;
};

export { isTouchDevice };

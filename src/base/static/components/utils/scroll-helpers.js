// Due to https://stackoverflow.com/questions/8917921/cross-browser-javascript-not-jquery-scroll-to-top-animation
const scrollTo = (elt, to, duration) => {
  const difference = to - elt.scrollTop;
  const perTick = difference / duration;
  setTimeout(() => {
    elt.scrollTop = elt.scrollTop + perTick;
    if (elt.scrollTop === to) return;
    scrollTo(elt, to, duration - 10);
  }, 10);
};

const scrollDownTo = (elt, to, jump = 0) => {
  setTimeout(() => {
    elt.scrollTop = elt.scrollTop + jump;
    if (elt.scrollTop >= to) return;
    scrollDownTo(elt, to, jump + 0.5);
  }, 10);
};

export { scrollTo, scrollDownTo };

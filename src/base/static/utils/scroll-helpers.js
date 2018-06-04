// Due to https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
const easeInOutCubic = (t, b, c, d) => {
  if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
  return c / 2 * ((t -= 2) * t * t + 2) + b;
};

// TODO: I think these scrolling functions could probably be improved. They
// feel a little hacky...
const scrollDownTo = (elt, beginning, diff, time, step, to) => {
  requestAnimationFrame(() => {
    elt.scrollTop = Math.ceil(easeInOutCubic(time, beginning, diff, 300));
    if (elt.scrollTop + elt.clientHeight === elt.scrollHeight) return;
    if (elt.scrollTop >= to) return;
    scrollDownTo(elt, beginning, diff, time + step, step, to);
  });
};

const scrollUpTo = (elt, beginning, diff, time, step, to) => {
  requestAnimationFrame(() => {
    elt.scrollTop = Math.ceil(easeInOutCubic(time, beginning, diff, 300));
    if (elt.scrollTop <= to) return;
    scrollUpTo(elt, beginning, diff, time + step, step, to);
  });
};

// elts should be a NodeList.
const scrollTo = (elts, to) => {
  elts.forEach(elt => {
    if (elt.scrollTop < to) {
      scrollDownTo(elt, elt.scrollTop, to - elt.scrollTop, 1, 5, to);
    } else {
      scrollUpTo(elt, elt.scrollTop, to - elt.scrollTop, 1, 5, to);
    }
  });
};

export { scrollTo };

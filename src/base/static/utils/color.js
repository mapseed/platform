import tinycolor from "tinycolor2";

export const OFF_WHITE = "#f8f8ff";
export const CHARCOAL = "#36454f";

export const getReadableColor = color => {
  const tc = tinycolor(color);
  return tc.isLight() ? tc.darken(40).toString() : tc.lighten(40).toString();
};

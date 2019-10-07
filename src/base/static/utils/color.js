import tinycolor from "tinycolor2";

export const OFF_WHITE = "#f8f8ff";
export const CHARCOAL = "#36454f";

export const getReadableColor = color => {
  const tc = tinycolor(color);
  return tc.isLight()
    ? tc
        .darken(70)
        .setAlpha(1)
        .toString()
    : tc
        .brighten(70)
        .setAlpha(1)
        .toString();
};

export const lighten = (color, lightness) => {
  const tc = tinycolor(color);
  return tc.lighten(lightness).toString();
};

export const darken = (color, darkness) => {
  const tc = tinycolor(color);
  return tc.darken(darkness).toString();
};

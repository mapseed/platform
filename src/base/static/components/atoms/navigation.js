import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./navigation.scss";

const Link = ({ children, ...props }) => {
  return (
    <a
      className={classNames("mapseed__link", props.classes, {
        "mapseed__link--rounded": props.variant.includes("rounded"),
        "mapseed__link--raised": props.variant.includes("raised"),
        "mapseed__link--depressable": props.variant.includes("depressable"),
        "mapseed__link--color-primary": props.color === "primary",
        "mapseed__link--color-secondary": props.color === "secondary",
        "mapseed__link--color-accent": props.color === "accent",
        "mapseed__link--size-large": props.size === "large",
        "mapseed__link--size-regular": props.size === "regular",
        "mapseed__link--disabled": !!props.disabled,
      })}
      {...props}
    >
      {children}
    </a>
  );
};

Link.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.string,
  disabled: PropTypes.bool,
  variant: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.string,
};

Link.defaultProps = {
  variant: "flat",
  color: "primary",
  size: "regular",
};

export { Link };

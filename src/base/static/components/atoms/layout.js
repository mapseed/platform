import PropTypes from "prop-types";
import styled from "react-emotion";

const HorizontalRule = styled("hr")(props => {
  const styles = {
    marginTop: "4px",
    marginBottom: "4px",

    borderTopWidth: "1px",
    borderBottomWidth: "0px",
    borderLeftWidth: "0px",
    borderRightWidth: "0px",
    borderStyle: "solid",
    borderColor: "rgba(0, 0, 0, 0.2)",
  };
  if (props.margin === "large") {
    styles.marginTop = "16px";
    styles.marginBottom = "16px";
  }
  if (props.color === "light") {
    styles.borderColor = "#eee";
  }
  return styles;
});

HorizontalRule.propTypes = {
  classes: PropTypes.string,
};

export { HorizontalRule };

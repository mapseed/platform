import PropTypes from "prop-types";
import styled from "react-emotion";

const HorizontalRule = styled("hr")(props => {
  const styles = {
    marginTop: "12px",
    marginBottom: "12px",

    borderTopWidth: "1px",
    borderBottomWidth: "0px",
    borderLeftWidth: "0px",
    borderRightWidth: "0px",
    borderStyle: "solid",
    borderColor: "rgba(0, 0, 0, 0.2)",
  };

  if (props.spacing === "small") {
    styles.marginTop = "8px";
    styles.marginBottom = "8px";
  } else if (props.spacing === "tiny") {
    styles.marginTop = "4px";
    styles.marginBottom = "4px";
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

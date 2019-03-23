import PropTypes from "prop-types";
import styled from "@emotion/styled";
import { RegularTitle } from "./typography";

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

const ModalWrapper = styled("div")({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  justifyContent: "space-between",
});

const ModalHeading = styled("div")({
  display: "flex",
});
const ModalTitle = styled(RegularTitle)({
  textAlign: "center",
  marginLeft: "auto",
  marginRight: "auto",
});
const ModalBody = styled("div")({
  display: "flex",
  flexDirection: "column",
  marginTop: "16px",
  height: "100%",
  flex: "1 0",
});
const ModalFooter = styled("div")({
  display: "flex",
  marginTop: "16px",
  justifyContent: "flex-end",
});

const modalStyles = {
  content: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#fff",
    borderRadius: "8px",
    outline: "none",
    boxShadow: "0 1px 5px rgba(0, 0, 0, 0.65)",
    wordWrap: "break-word",
    maxWidth: "95%",
    maxHeight: "95%",
    height: "160px",
    width: "360px",
  },
  overlay: {
    position: "fixed",
    top: "0px",
    left: "0px",
    right: "0px",
    bottom: "0px",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 99,
  },
};

export {
  HorizontalRule,
  ModalWrapper,
  ModalHeading,
  ModalTitle,
  ModalBody,
  ModalFooter,
  modalStyles,
};

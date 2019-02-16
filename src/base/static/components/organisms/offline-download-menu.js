import React, { Fragment, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "../atoms/typography";

import Modal from "react-modal";
Modal.setAppElement("#main");

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

const OfflineDownloadMenu = props => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <Fragment>
      <Link onClick={() => setIsModalOpen(() => true)}>
        {"Download app for offline use"}
      </Link>
      <Modal
        style={modalStyles}
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(() => false)}
        contentLabel="offline download menu"
      >
        {`offline download menu content`}
      </Modal>
    </Fragment>
  );
};

OfflineDownloadMenu.propTypes = {
  button: PropTypes.element,
};

export default OfflineDownloadMenu;

import React from "react";
import PropTypes from "prop-types";
import Modal from "react-modal";

import "./info-modal.scss";

Modal.setAppElement("#site-wrap");

const InfoModal = props => {
  const body = Array.isArray(props.body) ? props.body : [props.body];

  return (
    <Modal
      className="mapseed-info-modal"
      overlayClassName="mapseed-info-modal__overlay"
      isOpen={props.isModalOpen}
    >
      <div className="mapseed-info-modal__header-bar">
        <h3 className="mapseed-info-modal__header-content">{props.header}</h3>
        <button
          className="mapseed-info-modal__close-btn"
          onClick={props.onClose}
        >
          &#10005;
        </button>
      </div>
      <div className="mapseed-info-modal__body">
        {body.map((content, i) => {
          return (
            <div
              key={i}
              dangerouslySetInnerHTML={{
                __html: content,
              }}
            />
          );
        })}
      </div>
    </Modal>
  );
};

InfoModal.propTypes = {
  body: PropTypes.oneOfType(
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ).isRequired,
  header: PropTypes.string.isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

InfoModal.defaultProps = {
  body: [],
  header: "",
};

export default InfoModal;

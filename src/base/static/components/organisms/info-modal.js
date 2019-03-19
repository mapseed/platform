import React from "react";
import PropTypes from "prop-types";
import Modal from "react-modal";

import "./info-modal.scss";

Modal.setAppElement("#site-wrap");

const InfoModal = props => (
  <Modal
    className="mapseed-info-modal"
    overlayClassName="mapseed-info-modal__overlay"
    isOpen={props.isModalOpen}
  >
    <div className="mapseed-info-modal__header-bar">
      <h3 className="mapseed-info-modal__header-content">{props.header}</h3>
      <button className="mapseed-info-modal__close-btn" onClick={props.onClose}>
        &#10005;
      </button>
    </div>
    <div className="mapseed-info-modal__body">
      {props.body.map((paragraph, i) => {
        return (
          <p className="mapseed-info-modal__paragraph" key={i}>
            {paragraph}
          </p>
        );
      })}
    </div>
  </Modal>
);

InfoModal.propTypes = {
  body: PropTypes.arrayOf(PropTypes.string).isRequired,
  header: PropTypes.string.isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

InfoModal.defaultProps = {
  body: [],
  header: "",
};

export default InfoModal;

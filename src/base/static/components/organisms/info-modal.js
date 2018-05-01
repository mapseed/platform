import React, { Component } from "react";
import PropTypes from "prop-types";
import Modal from "react-modal";

import "./info-modal.scss";

Modal.setAppElement("#main");

class InfoModal extends Component {
  constructor(props) {
    super(props);

    // TODO: This state should be pushed higher once we port the AppView,
    // and we'll make this a stateless component.
    this.state = {
      isModalOpen: true,
    };
  }

  onClickCloseBtn(evt) {
    this.setState({
      isModalOpen: false,
    });
  }

  render() {
    return (
      <Modal
        className="mapseed-info-modal"
        overlayClassName="mapseed-info-modal__overlay"
        isOpen={this.state.isModalOpen}
        parentSelector={() => document.getElementById("info-modal-container")}
      >
        <div className="mapseed-info-modal__header-bar">
          <h3 className="mapseed-info-modal__header-content">
            {this.props.headerImgSrc && (
              <img
                className="mapseed-info-modal__header-img"
                src={this.props.headerImgSrc}
              />
            )}
            {this.props.header}
          </h3>
          <span
            className="mapseed-info-modal__close-btn"
            onClick={this.onClickCloseBtn.bind(this)}
          >
            &#10005;
          </span>
        </div>
        <div className="mapseed-info-modal__body">
          {this.props.body.map((paragraph, i) => {
            return (
              <p className="mapseed-info-modal__paragraph" key={i}>
                {paragraph}
              </p>
            );
          })}
        </div>
      </Modal>
    );
  }
}

InfoModal.propTypes = {
  header: PropTypes.string,
  body: PropTypes.arrayOf(PropTypes.string),
  headerImgSrc: PropTypes.string,
};

export default InfoModal;

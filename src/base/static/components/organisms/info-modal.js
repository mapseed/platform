import React, { Component } from "react";
import PropTypes from "prop-types";
import Modal from "react-modal";
import { connect } from "react-redux";

import {
  infoModalContentSelector,
  updateUIVisibility,
  uiVisibilitySelector,
} from "../../state/ducks/ui";

import "./info-modal.scss";

Modal.setAppElement("#site-wrap");

class InfoModal extends Component {
  render() {
    return (
      <Modal
        className="mapseed-info-modal"
        overlayClassName="mapseed-info-modal__overlay"
        isOpen={this.props.isInfoModalVisible}
      >
        <div className="mapseed-info-modal__header-bar">
          <h3 className="mapseed-info-modal__header-content">
            {this.props.infoModalContent.header}
          </h3>
          <button
            className="mapseed-info-modal__close-btn"
            onClick={() => this.props.updateInfoModalVisibility(false)}
          >
            &#10005;
          </button>
        </div>
        <div className="mapseed-info-modal__body">
          {this.props.infoModalContent.body.map((paragraph, i) => {
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
  infoModalContent: PropTypes.object.isRequired,
  isInfoModalVisible: PropTypes.bool.isRequired,
  updateInfoModalVisibility: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  infoModalContent: infoModalContentSelector(state),
  isInfoModalVisible: uiVisibilitySelector("infoModal", state),
});

const mapDispatchToProps = dispatch => ({
  updateInfoModalVisibility: isVisible =>
    dispatch(updateUIVisibility("infoModal", isVisible)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(InfoModal);

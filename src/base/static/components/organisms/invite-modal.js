import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { RegularText } from "../atoms/typography";
import { CloseButton } from "../atoms/buttons";
import { Button } from "../atoms/buttons";
import {
  ModalWrapper,
  ModalHeading,
  ModalTitle,
  ModalBody,
  ModalFooter,
  modalStyles,
} from "../atoms/layout";
import mixpanel from "mixpanel-browser";

import { userSelector, userPropType } from "../../state/ducks/user";

import Modal from "react-modal";
Modal.setAppElement("#site-wrap");

class InviteModal extends Component {
  state = {
    phase: this.props.currentUser.isLoaded ? "invited" : "unloaded",
    isModalOpen: this.props.isOpen,
  };

  onClose = () => {
    this.setState({ isModalOpen: false });
    this.props.router.navigate(`/`, { trigger: true });
  };

  setPhase = phase => {
    this.setState({ phase });
  };

  inviteUser() {
    mixpanel.track("user invited", {
      id: this.props.currentUser.id,
      name: this.props.currentUser.name,
      username: this.props.currentUser.username,
      provider_id: this.props.currentUser.provider_id,
      provider_type: this.props.currentUser.provider_type,
      email: new URLSearchParams(window.location.search).get("email"),
    });
  }

  componentDidMount() {
    if (!this.state.isModalOpen) {
      return;
    }
    if (this.props.currentUser.isLoaded) {
      if (this.props.currentUser.isAuthenticated) {
        this.inviteUser();
      } else {
        this.setState({
          phase: "unauthenticated",
        });
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.state.isModalOpen) {
      return;
    }

    if (!prevProps.currentUser.isLoaded && this.props.currentUser.isLoaded) {
      if (
        !prevProps.currentUser.isAuthenticated &&
        this.props.currentUser.isAuthenticated
      ) {
        this.inviteUser();
        this.setState({
          phase: "invited",
        });
      } else {
        this.setState({
          phase: "unauthenticated",
        });
      }
    }
  }

  render() {
    return (
      <Modal
        style={modalStyles}
        isOpen={this.state.isModalOpen}
        onRequestClose={this.onClose}
        contentLabel="invite link"
      >
        <ModalWrapper>
          <>
            <ModalHeading>
              <ModalTitle>{"Invitation"}</ModalTitle>
              <CloseButton onClick={this.onClose} />
            </ModalHeading>
            {this.state.phase === "invited" && (
              <>
                <ModalBody>
                  <RegularText textAlign="center">
                    {`Your request to join the team has been received! You will be added to the team shortly.`}
                  </RegularText>
                </ModalBody>
                <ModalFooter>
                  <Button
                    size={"full-width"}
                    color={"primary"}
                    onClick={this.onClose}
                  >
                    {"Ok"}
                  </Button>
                </ModalFooter>
              </>
            )}
            {this.state.phase === "unauthenticated" && (
              <ModalBody>
                <RegularText textAlign="center">{`You must first log in before requesting access to the team. Please click 'sign in' in the upper right corner, then click the invite link again.`}</RegularText>
                <ModalFooter>
                  <Button
                    size={"full-width"}
                    color={"primary"}
                    onClick={this.onClose}
                  >
                    {"Ok"}
                  </Button>
                </ModalFooter>
              </ModalBody>
            )}
          </>
        </ModalWrapper>
      </Modal>
    );
  }
}

InviteModal.propTypes = {
  currentUser: userPropType,
  isOpen: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  currentUser: userSelector(state),
});

export default connect(mapStateToProps)(InviteModal);

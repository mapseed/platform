import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import SecondaryButton from "./secondary-button";

const Util = require("../../js/utils.js");

import "./support-button.scss";

class SupportButton extends Component {
  componentDidMount() {
    this.props.collection.on("reset", this.onCollectionChange, this);
    this.props.collection.on("add", this.onCollectionChange, this);
    this.props.collection.on("remove", this.onCollectionChange, this);
  }

  onCollectionChange() {
    this.forceUpdate();
  }

  getSupportModel() {
    return this.props.collection.find(model => {
      return model.get("user_token") === this.props.userToken;
    });
  }

  onClick(evt) {
    const userSupport = this.getSupportModel();

    if (userSupport) {
      // If we already have user support for the current user token, we should
      // unsupport.
      userSupport.destroy({
        wait: true,
        success: () => {
          Util.log(
            "USER",
            "place",
            "successfully-unsupport",
            this.props.collection.options.placeModel.getLoggingDetails()
          );
        },
        error: () => {
          this.props.collection.add(userSupport);
          alert("Oh dear. It looks like that didn't save.");
          Util.log(
            "USER",
            "place",
            "fail-to-unsupport",
            this.props.collection.options.placeModel.getLoggingDetails()
          );
        },
      });
    } else {
      // Otherwise, we're supporting.
      this.props.collection.create(
        { user_token: this.props.userToken, visible: true },
        {
          wait: true,
          beforeSend: xhr => {
            // Do not generate activity for anonymous supports
            if (!Shareabouts.bootstrapped.currentUser) {
              xhr.setRequestHeader("X-Shareabouts-Silent", "true");
            }
          },
          success: () => {
            Util.log(
              "USER",
              "place",
              "successfully-support",
              this.props.collection.options.placeModel.getLoggingDetails()
            );
          },
          error: () => {
            self.getSupportStatus(self.props.userToken).destroy();
            alert("Oh dear. It looks like that didn't save.");
            Util.log(
              "USER",
              "place",
              "fail-to-support",
              this.props.collection.options.placeModel.getLoggingDetails()
            );
          },
        }
      );
    }
  }

  render() {
    return (
      <SecondaryButton
        className={classNames("support-button", this.props.className, {
          "support-button--supported": this.getSupportModel(),
        })}
        onClick={this.onClick.bind(this)}
      >
        {this.props.collection.size() || ""} {this.props.label}
      </SecondaryButton>
    );
  }
}

SupportButton.propTypes = {
  className: PropTypes.string,
  collection: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  userToken: PropTypes.string.isRequired,
};

export default SupportButton;

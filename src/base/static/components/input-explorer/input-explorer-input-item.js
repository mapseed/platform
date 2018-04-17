import React, { Component } from "react";
import PropTypes from "prop-types";
const cn = require("classnames");
import moment from "moment";

import constants from "./constants";
import "./input-explorer-input-item.scss";

class InputExplorerInputItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isStickyToggled: this.props.model.get(constants.IS_STICKY_FIELDNAME)
        ? true
        : false,
    };
    this.onStickyToggleChange = this.onStickyToggleChange.bind(this);
  }

  onStickyToggleChange() {
    if (this.props.isAdmin) {
      let newStickyState = !this.state.isStickyToggled;

      // Update sticky state on server
      this.props.model.save(
        {
          [constants.IS_STICKY_FIELDNAME]: newStickyState,
        },
        {
          success: () => {
            this.setState({ isStickyToggled: newStickyState });
            this.props.parent.forceUpdate();
          },
          error: (model, response) => {
            console.error("Error saving sticky state:", response);
          },
        },
      );
    }

    // If the user is not an admin, do nothing
    return false;
  }

  render() {
    const classNames = {
      stickyToggleLabel: cn("input-explorer-input-item__sticky-toggle-label", {
        "input-explorer-input-item__sticky-toggle-label--toggled": this.state
          .isStickyToggled,
        "input-explorer-input-item__sticky-toggle-label--toggleable": this.props
          .isAdmin,
      }),
    };

    return (
      <div className="input-explorer-input-item">
        <p className="input-explorer-input-item__response-text">
          {this.props.inputText}
        </p>
        <p className="input-explorer-input-item__response-time">
          {moment(this.props.createdDatetime).format("MMMM Do YYYY, h:mm a")}
        </p>
        <span className="input-explorer-input-item__sticky-toggle-container">
          <input
            className="input-explorer-input-item__sticky-toggle-input"
            type="checkbox"
            id={"input-item-" + this.props.model.id}
            checked={this.state.isStickyToggled}
            onChange={this.onStickyToggleChange}
          />
          <label
            htmlFor={"input-item-" + this.props.model.id}
            className={classNames.stickyToggleLabel}
          />
        </span>
      </div>
    );
  }
}

InputExplorerInputItem.propTypes = {
  createdDatetime: PropTypes.string.isRequired,
  inputText: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  model: PropTypes.object.isRequired,
  parent: PropTypes.object.isRequired,
};

export default InputExplorerInputItem;

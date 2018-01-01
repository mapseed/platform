import React, { Component } from "react";
const cn = require("classnames");

import constants from "./constants";
import "./input-explorer-input-item.scss";

class InputExplorerInputItem extends Component {

  constructor(props) {
    super(props);
    this.state = {
      stickyIsToggled: (this.props.model.get(constants.IS_STICKY_FIELDNAME)) ? true : false
    };
    this.onStickyToggleChange = this.onStickyToggleChange.bind(this);
  }

  onStickyToggleChange(evt) {
    const { isAdmin, model, parent } = this.props;

    if (isAdmin) {
      let newStickyState = !this.state.stickyIsToggled;

      // Update sticky state on server
      model.save(
        {
          [constants.IS_STICKY_FIELDNAME]: newStickyState
        },
        {
          success: (model, response) => {
            this.setState({ stickyIsToggled: newStickyState });
            parent.forceUpdate();
          },
          error: (model, response) => {
            console.error("Error saving sticky state:", response);
          }
        }
      );
    }

    // If the user is not an admin, do nothing
    return false;
  }

  render() {
    const { createdDatetime, inputText, isAdmin, model } = this.props;
    const { stickyIsToggled } = this.state;
    const classNames = {
      stickyToggleLabel: cn("input-explorer-input-item__sticky-toggle-label", {
        "input-explorer-input-item__sticky-toggle-label--toggled": stickyIsToggled,
        "input-explorer-input-item__sticky-toggle-label--untoggled": !stickyIsToggled,
        "input-explorer-input-item__sticky-toggle-label--toggleable": isAdmin
      })
    };

    return (
      <div className="input-explorer-input-item">
        <p className="input-explorer-input-item__response-text">
          {inputText}
        </p>
        <p className="input-explorer-input-item__response-time">
          {moment(createdDatetime).format("MMMM Do YYYY, h:mm a")}
        </p>
        <span className="input-explorer-input-item__sticky-toggle-container">
          <input
            className="input-explorer-input-item__sticky-toggle-input"
            type="checkbox"
            id={"input-item-" + model.id}
            checked={stickyIsToggled}
            onChange={this.onStickyToggleChange}
          />
          <label
            htmlFor={"input-item-" + model.id}
            className={classNames.stickyToggleLabel}
          />
        </span>
      </div>
    );
  }

}

export default InputExplorerInputItem;

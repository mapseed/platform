import React, { Component } from "react";
import cx from "bem-classnames";

const baseClass = "mapseed-input-explorer-input-item";

class InputExplorerInputItem extends Component {

  constructor() {
    super(...arguments);
    this.state = {
      stickyIsToggled: (this.props.model.get("is_sticky")) ? true : false
    };
    this.classes = {
      responseText: {
        name: baseClass + "__response-text"
      },
      responseTime: {
        name: baseClass + "__response-time"
      },
      subcatgories: {
        name: baseClass + "__subcategory"
      },
      stickyToggleContainer: {
        name: baseClass + "__sticky-toggle-container"
      },
      stickyToggleLabel: {
        name: baseClass + "__sticky-toggle-label",
        modifiers: ["toggled", "toggleable", "updating"]
      }
    };
  }

  onStickyToggleChange(evt) {
    if (this.props.isAdmin) {
      let newStickyState = !this.state.stickyIsToggled;

      // Update sticky state on server
      this.props.model.save(
        {
          "is_sticky": newStickyState
        },
        {
          success: (model, response) => {
            this.setState({ stickyIsToggled: newStickyState });
            this.props.parent.forceUpdate();
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

    return (
      <div className={baseClass}>
        <p className={cx(this.classes.responseText)}>{this.props.inputText}</p>
        <p className={cx(this.classes.responseTime)}>{moment(this.props.createdDatetime).format('MMMM Do YYYY, h:mm a')}</p>
        <span className={cx(this.classes.stickyToggleContainer)}>
          <input 
            type="checkbox" 
            id={"mapseed-input-item-" + this.props.model.id}
            checked={this.state.stickyIsToggled} 
            onChange={this.onStickyToggleChange.bind(this)} />
          <label
            htmlFor={"mapseed-input-item-" + this.props.model.id}
            className={cx(this.classes.stickyToggleLabel, {
              toggled: (this.state.stickyIsToggled) ? "toggled" : "untoggled",
              toggleable: (this.props.isAdmin) ? "toggleable" : ""
            })}>
          </label>
        </span>
        {this.props.subcategories.map(subcategory => 
          <span
            key={subcategory} 
            className={cx(this.classes.subcatgories)}>{subcategory}</span>
        )}
      </div>
    );
  }
}

export default InputExplorerInputItem;

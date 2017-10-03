import React, { Component } from "react";
import cx from "bem-classnames";

import { LabelWithInlineImage } from "../ui-elements/label-with-inline-image";

const baseClass = "input-form-category-button";

class InputFormCategoryButton extends Component {

  constructor() {
    super();
  }

  getClassname(classname) {
    if (classname === "categoryButtonContainerClass") {
      return {
        name: baseClass,
        modifiers: ["visibility"]
      };
    }

    return null;
  }

  onCategoryChange(evt) {
    this.props.onCategoryChange(evt);

    // evt.nativeEvent.path[1].className = 
    // 	cx(this.getClassname("categoryButtonContainerClass"), { visibility: "hidden" });
  }

  render() {
    let visibility = "visible";
    let categoryButtonContainerClass = {
          name: baseClass,
          modifiers: ["visibility"]
        };

    return (
      <div className={cx(categoryButtonContainerClass, { visibility: visibility })}>
        <input 
          id={this.props.categoryConfig.category}
          type="radio"
          name="input-form-category-buttons"
          value={this.props.categoryConfig.category}
          onChange={this.onCategoryChange.bind(this)} />
        <LabelWithInlineImage 
          labelText={this.props.categoryConfig.label}
          imageSrc={this.props.categoryConfig.icon_url} 
          imageAlignment="left"
          inputId={this.props.categoryConfig.category} />
      </div>
    );
  }
}

export { InputFormCategoryButton }

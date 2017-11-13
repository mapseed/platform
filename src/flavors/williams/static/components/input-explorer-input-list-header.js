import React, { Component } from "react";
import cx from "bem-classnames";

const baseClass = "mapseed-input-explorer-input-list-header";

class InputExplorerInputListHeader extends Component {

  constructor() {
    super(...arguments);
    this.classes = {
      header: {
        name: baseClass + "__header"
      },
      subcategoryMenu: {
        name: baseClass + "__subcategory-menu"
      }
    };
  }

  render() {

    return (
      <div className={baseClass}>
        <h5 className={cx(this.classes.header)}>What concerns do you have about this garden or its future development?</h5>
        <div className={cx(this.classes.subcategoryMenu)}>
          {this.props.subcategoryNames.map(subcategory => 
            <span key={subcategory.value}>
              <input 
                type="checkbox" name="input-explorer-subcategory-menu" id={"input-explorer-subcategory-menu-" + subcategory.value} 
                value={subcategory.value}
                checked={this.props.selectedSubcategories.includes(subcategory.value)} 
                onChange={this.props.onChange} />
              <label htmlFor={"input-explorer-subcategory-menu-" + subcategory.value}>
                {subcategory.label}
              </label>
            </span>
          )}
        </div>
      </div>
    );
  }
}

export default InputExplorerInputListHeader;

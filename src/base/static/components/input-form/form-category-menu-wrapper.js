import React, { Component } from "react";
import PropTypes from "prop-types";

import InputFormCategorySelector from "./input-form-category-selector";

const Util = require("../../js/utils.js");

class FormCategoryMenuWrapper extends Component {
  constructor(props) {
    super(props);
    this.visibleCategoryConfigs = this.props.placeConfig.place_detail
      .filter(config => config.includeOnForm)
      .filter(config => {
        return !(
          config.admin_only &&
          !Util.getAdminStatus(config.dataset, config.admin_groups)
        );
      });
    this.state = {
      selectedCategoryConfig:
        this.visibleCategoryConfigs.length === 1
          ? this.visibleCategoryConfigs[0]
          : false,
    };
  }

  onCategoryChange(selectedCategory) {
    this.setState({
      selectedCategoryConfig: this.visibleCategoryConfigs.find(
        config => config.category === selectedCategory,
      ),
    });
  }

  render() {
    return (
      <div className="input-form-category-menu-container">
        <InputFormCategorySelector
          onCategoryChange={this.onCategoryChange.bind(this)}
          selectedCategoryConfig={this.state.selectedCategoryConfig}
          visibleCategoryConfigs={this.visibleCategoryConfigs}
        />
        {this.state.selectedCategoryConfig
          ? this.props.render(this.state, this.props)
          : null}
      </div>
    );
  }
}

FormCategoryMenuWrapper.propTypes = {
  mapConfig: PropTypes.shape({
    geolocation_enabled: PropTypes.bool,
    geolocation_onload: PropTypes.bool,
    cartodb_enabled: PropTypes.bool,
    geocode_field_label: PropTypes.string,
    geocode_bounding_box: PropTypes.arrayOf(PropTypes.number),
    options: PropTypes.shape({
      center: PropTypes.shape({
        lat: PropTypes.number.isRequired,
        lng: PropTypes.number.isRequired,
      }),
      zoom: PropTypes.number,
      minZoom: PropTypes.number,
      maxZoom: PropTypes.number,
    }),
    layer: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
        attribution: PropTypes.string,
        type: PropTypes.string,
      }),
    ),
  }),
  hideSpotlightMask: PropTypes.func.isRequired,
  hideCenterPoint: PropTypes.func.isRequired,
  showNewPin: PropTypes.func.isRequired,
  hideNewPin: PropTypes.func.isRequired,
  hidePanel: PropTypes.func.isRequired,
  map: PropTypes.instanceOf(L.Map),
  places: PropTypes.objectOf(PropTypes.instanceOf(Backbone.Collection)),
  router: PropTypes.instanceOf(Backbone.Router),
  customHooks: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.objectOf(PropTypes.func),
  ]),
  container: PropTypes.instanceOf(HTMLElement),
  render: PropTypes.func.isRequired,
  customComponents: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  placeConfig: PropTypes.shape({
    adding_supported: PropTypes.bool.isRequired,
    add_button_label: PropTypes.string.isRequired,
    show_list_button_label: PropTypes.string.isRequired,
    show_map_button_label: PropTypes.string.isRequired,
    action_text: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    anonymous_name: PropTypes.string.isRequired,
    submit_button_label: PropTypes.string.isRequired,
    location_item_name: PropTypes.string.isRequired,
    default_basemap: PropTypes.string,
    place_detail: PropTypes.arrayOf(
      PropTypes.shape({
        category: PropTypes.string.isRequired,
        includeOnForm: PropTypes.bool,
        name: PropTypes.string.isRequired,
        dataset: PropTypes.string.isRequired,
        icon_url: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        fields: PropTypes.arrayOf(
          PropTypes.shape({
            name: PropTypes.string.isRequired,
            type: PropTypes.string.isRequired,
            autocomplete: PropTypes.bool,
            prompt: PropTypes.string,
            display_prompt: PropTypes.string,
            placeholder: PropTypes.string,
            optional: PropTypes.bool,
          }),
        ),
      }),
    ),
  }).isRequired,
};

export default FormCategoryMenuWrapper;

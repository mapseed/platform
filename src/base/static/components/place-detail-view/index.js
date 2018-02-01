import React, { Component } from "react";
import PropTypes from "prop-types";

import FieldResponse from "../form-response";
const Util = require("../../js/utils.js");

import constants from "../constants";

import "./place-detail-view.scss";

class PlaceDetailView extends Component {
  componentWillMount() {
    this.categoryConfig = this.props.placeConfig.place_detail.find(
      config =>
        config.category ===
        this.props.model.get(constants.LOCATION_TYPE_PROPERTY_NAME)
    );

    this.fields = Util.buildFieldListForRender({
      exclusions: [
        "submitter_name",
        "name",
        constants.LOCATION_TYPE_PROPERTY_NAME,
        "title",
        "my_image", // TODO
      ],
      model: this.props.model,
      fields: this.categoryConfig.fields,
      commonFormElements: this.props.placeConfig.common_form_elements,
      isEditingToggled: false, // TODO
    });
  }

  render() {
    // TODO: cover images

    return this.fields.map(field => (
      <FieldResponse
        key={field.name}
        field={field}
        model={this.props.model}
        placeConfig={this.props.placeConfig}
      />
    ));
  }
}

PlaceDetailView.propTypes = {
  model: PropTypes.object.isRequired,
  placeConfig: PropTypes.object.isRequired,
};

export default PlaceDetailView;

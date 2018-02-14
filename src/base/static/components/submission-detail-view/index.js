import React, { Component } from "react";
import PropTypes from "prop-types";

import FieldResponse from "../form-response";
import SubmissionPromotionBar from "./submission-promotion-bar";
import SubmissionMetadataBar from "./submission-metadata-bar";
const Util = require("../../js/utils.js");

import constants from "../constants";

import "./submission-detail-view.scss";

// TODO: We make a lot of assumptions here about certain fields existing in the
// model with certain names ("my_image", "title", etc.). Rather than rely on
// arbitrary names we should come up with a better convention for structuring
// parts of the detail view.

class SubmissionDetailView extends Component {
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
        "my_image",
      ],
      model: this.props.model,
      fields: this.categoryConfig.fields,
      commonFormElements: this.props.placeConfig.common_form_elements,
      isEditingToggled: false, // TODO: add editor
    });
  }

  render() {
    // This is an unfortunate series of checks, but needed at the moment.
    // TODO: We should revisit why this is necessary in the first place and see
    // if we can refactor.
    const title = this.props.model.get("fullTitle")
      ? this.props.model.get("fullTitle")
      : this.props.model.get("title")
        ? this.props.model.get("title")
        : this.props.model.get("name");

    return (
      <div className="detail-view">
        <SubmissionPromotionBar
          model={this.props.model}
          supportConfig={this.props.supportConfig}
          userToken={this.props.userToken}
        />
        <h1 className="detail-view__header">{title}</h1>
        <SubmissionMetadataBar />

        {/* TODO: cover images */}
        {this.fields.map(field => (
          <FieldResponse
            key={field.name}
            field={field}
            model={this.props.model}
            placeConfig={this.props.placeConfig}
          />
        ))}
      </div>
    );
  }
}

SubmissionDetailView.propTypes = {
  model: PropTypes.object.isRequired,
  placeConfig: PropTypes.object.isRequired,
  supportConfig: PropTypes.object.isRequired,
  userToken: PropTypes.string.isRequired,
};

export default SubmissionDetailView;

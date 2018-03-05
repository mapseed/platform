import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import FieldResponse from "../form-response";
import PlaceDetailPromotionBar from "./place-detail-promotion-bar";
import PlaceDetailMetadataBar from "./place-detail-metadata-bar";
import PlaceDetailSurvey from "./place-detail-survey";
import CoverImage from "../ui-elements/cover-image";
import PlaceDetailEditorBar from "./place-detail-editor-bar";

const Util = require("../../js/utils.js");
const SubmissionCollection = require("../../js/models/submission-collection.js");

import constants from "../constants";

import "./place-detail-view.scss";

class PlaceDetailView extends Component {
  constructor(props) {
    super(props);
    this.categoryConfig = this.props.placeConfig.place_detail.find(
      categoryConfig =>
        categoryConfig.category === this.props.model.get("datasetId")
    );

    this.state = {
      isEditingToggled: false,
      isEditable: Util.getAdminStatus(
        this.props.model.get("datasetId"),
        this.categoryConfig.admin_groups
      ),
    };
  }

  componentWillMount() {
    const surveyType = this.props.surveyConfig.submission_type;
    const supportType = this.props.supportConfig.submission_type;

    this.props.model.submissionSets[surveyType] =
      this.props.model.submissionSets[surveyType] ||
      new SubmissionCollection(null, {
        submissionType: surveyType,
        placeModel: this.props.model,
      });

    this.props.model.submissionSets[supportType] =
      this.props.model.submissionSets[supportType] ||
      new SubmissionCollection(null, {
        submissionType: supportType,
        placeModel: this.props.model,
      });

    this.categoryConfig = this.props.placeConfig.place_detail.find(
      config =>
        config.category ===
        this.props.model.get(constants.LOCATION_TYPE_PROPERTY_NAME)
    );

    // TODO: We make a lot of assumptions here about certain fields existing in the
    // model with certain names ("my_image", "title", etc.). Rather than rely on
    // arbitrary names we should come up with a better convention for structuring
    // parts of the detail view.
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
    const submitter = this.props.model.get("submitter") || {};

    return (
      <div className="place-detail-view">
        {this.state.isEditable ? <PlaceDetailEditorBar /> : null}
        <PlaceDetailPromotionBar
          model={this.props.model}
          supportConfig={this.props.supportConfig}
          userToken={this.props.userToken}
          isEditable={this.state.isEditable}
        />
        <h1
          className={classNames("place-detail-view__header", {
            "place-detail-view__header--with-top-margin": this.state.isEditable,
          })}
        >
          {title}
        </h1>
        <PlaceDetailMetadataBar
          submitter={submitter}
          model={this.props.model}
          placeConfig={this.props.placeConfig}
          placeTypes={this.props.placeTypes}
          surveyConfig={this.props.surveyConfig}
          isEditable={this.state.isEditable}
        />
        <div className="clearfix" />
        {this.props.model.attachmentCollection
          .toJSON()
          .filter(attachment => attachment.type === "CO")
          .map((attachment, i) => (
            <CoverImage key={title + "-" + i} src={attachment.file} />
          ))}

        {this.fields.map(field => (
          <FieldResponse
            key={title + "-" + field.name}
            field={field}
            model={this.props.model}
            placeConfig={this.props.placeConfig}
          />
        ))}
        <PlaceDetailSurvey
          apiRoot={this.props.apiRoot}
          currentUser={this.props.currentUser}
          model={this.props.model}
          placeConfig={this.props.placeConfig}
          submitter={submitter}
          surveyConfig={this.props.surveyConfig}
        />
      </div>
    );
  }
}

PlaceDetailView.propTypes = {
  apiRoot: PropTypes.string.isRequired,
  currentUser: PropTypes.object,
  model: PropTypes.object.isRequired,
  placeConfig: PropTypes.object.isRequired,
  placeTypes: PropTypes.object.isRequired,
  supportConfig: PropTypes.object.isRequired,
  surveyConfig: PropTypes.object.isRequired,
  userToken: PropTypes.string.isRequired,
};

export default PlaceDetailView;

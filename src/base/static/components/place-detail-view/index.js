import React, { Component } from "react";
import PropTypes from "prop-types";
import { fromJS, List as ImmutableList } from "immutable";
import emitter from "../utils/emitter";

import FormFieldResponse from "../form-field-response";
import PlaceDetailPromotionBar from "./place-detail-promotion-bar";
import PlaceDetailMetadataBar from "./place-detail-metadata-bar";
import PlaceDetailSurvey from "./place-detail-survey";
import CoverImage from "../ui-elements/cover-image";

const SubmissionCollection = require("../../js/models/submission-collection.js");

import fieldResponseFilter from "../utils/field-response-filter";
import constants from "../constants";

const Util = require("../../js/utils.js");

import "./place-detail-view.scss";

const serializeBackboneCollection = collection => {
  let serializedCollection = ImmutableList();
  collection.each(model => {
    serializedCollection = serializedCollection.push(fromJS(model.attributes));
  });

  return serializedCollection;
};

class PlaceDetailView extends Component {
  constructor(props) {
    super(props);

    this.surveyType = this.props.surveyConfig.submission_type;
    this.supportType = this.props.supportConfig.submission_type;
    this.props.model.submissionSets[this.surveyType] =
      this.props.model.submissionSets[this.surveyType] ||
      new SubmissionCollection(null, {
        submissionType: this.surveyType,
        placeModel: this.props.model,
      });
    this.props.model.submissionSets[this.supportType] =
      this.props.model.submissionSets[this.supportType] ||
      new SubmissionCollection(null, {
        submissionType: this.supportType,
        placeModel: this.props.model,
      });

    this.categoryConfig = this.props.placeConfig.place_detail.find(
      config =>
        config.category ===
        this.props.model.get(constants.LOCATION_TYPE_PROPERTY_NAME)
    );

    this.state = {
      backbonePlaceModelAttributes: fromJS(this.props.model.attributes),
      backboneSupportModelsAttributes: serializeBackboneCollection(
        this.props.model.submissionSets[this.supportType]
      ),
      backboneSurveyModelsAttributes: serializeBackboneCollection(
        this.props.model.submissionSets[this.surveyType]
      ),
      backboneAttachmentModelsAttributes: serializeBackboneCollection(
        this.props.model.attachmentCollection
      ),
    };
  }

  onClickSupport() {
    const userSupportModel = this.props.model.submissionSets[
      this.supportType
    ].find(model => {
      return model.get("user_token") === this.props.userToken;
    });

    if (userSupportModel) {
      // If we already have user support for the current user token, we should
      // unsupport.
      userSupportModel.destroy({
        wait: true,
        success: () => {
          Util.log(
            "USER",
            "place",
            "successfully-unsupport",
            this.props.model.getLoggingDetails()
          );
          this.setState({
            backboneSupportModelsAttributes: serializeBackboneCollection(
              this.props.model.submissionSets[this.supportType]
            ),
          });
        },
        error: () => {
          this.props.model.submissionSets[this.supportType].add(
            userSupportModel
          );
          alert("Oh dear. It looks like that didn't save.");
          Util.log(
            "USER",
            "place",
            "fail-to-unsupport",
            this.props.model.getLoggingDetails()
          );
        },
      });
    } else {
      // Otherwise, we're supporting.
      this.props.model.submissionSets[this.supportType].create(
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
              this.props.model.getLoggingDetails()
            );
            this.setState({
              backboneSupportModelsAttributes: serializeBackboneCollection(
                this.props.model.submissionSets[this.supportType]
              ),
            });
          },
          error: () => {
            userSupportModel.destroy();
            alert("Oh dear. It looks like that didn't save.");
            Util.log(
              "USER",
              "place",
              "fail-to-support",
              this.props.model.getLoggingDetails()
            );
          },
        }
      );
    }

    this.setState({
      backboneSupportModelsAttributes: serializeBackboneCollection(
        this.props.model.submissionSets[this.supportType]
      ),
    });
  }

  onSubmitSurvey(attrs) {
    Util.log(
      "USER",
      "place",
      "submit-reply-btn-click",
      this.props.model.getLoggingDetails(),
      this.state.backboneSurveyModelsAttributes.size
    );

    this.props.model.submissionSets[this.surveyType].create(attrs, {
      wait: true,
      success: () => {
        Util.log(
          "USER",
          "place",
          "successfully-reply",
          this.props.model.getLoggingDetails()
        );

        this.setState({
          backboneSurveyModelsAttributes: serializeBackboneCollection(
            this.props.model.submissionSets[this.surveyType]
          ),
        });
        emitter.emit("place-detail-survey:save");
      },
      error: () => {
        Util.log(
          "USER",
          "place",
          "fail-to-reply",
          this.props.model.getLoggingDetails()
        );
      },
    });
  }

  render() {
    // This is an unfortunate series of checks, but needed at the moment.
    // TODO: We should revisit why this is necessary in the first place and see
    // if we can refactor.
    const title = this.state.backbonePlaceModelAttributes.get("fullTitle")
      ? this.state.backbonePlaceModelAttributes.get("fullTitle")
      : this.state.backbonePlaceModelAttributes.get("title")
        ? this.state.backbonePlaceModelAttributes.get("title")
        : this.state.backbonePlaceModelAttributes.get("name");
    const submitter =
      this.state.backbonePlaceModelAttributes.get("submitter") || {};

    return (
      <div className="place-detail-view">
        <PlaceDetailPromotionBar
          isSupported={
            !!this.state.backboneSupportModelsAttributes.find(model => {
              return model.get("user_token") === this.props.userToken;
            })
          }
          numSupports={this.state.backboneSupportModelsAttributes.size}
          onClickSupport={this.onClickSupport.bind(this)}
          onSocialShare={service =>
            Util.onSocialShare(this.props.model, service)
          }
          supportConfig={this.props.supportConfig}
        />
        <h1 className="place-detail-view__header">{title}</h1>
        <PlaceDetailMetadataBar
          submitter={submitter}
          backbonePlaceModelAttributes={this.state.backbonePlaceModelAttributes}
          backboneSurveyModelsAttributes={
            this.state.backboneSurveyModelsAttributes
          }
          placeConfig={this.props.placeConfig}
          placeTypes={this.props.placeTypes}
          surveyConfig={this.props.surveyConfig}
        />
        <div className="clearfix" />
        {this.state.backboneAttachmentModelsAttributes
          .filter(attachment => attachment.type === constants.COVER_IMAGE_CODE)
          .map((attachment, i) => (
            <CoverImage key={title + "-" + i} src={attachment.file} />
          ))}
        {fieldResponseFilter(
          this.categoryConfig.fields,
          this.state.backbonePlaceModelAttributes
        ).map(fieldConfig => (
          <FormFieldResponse
            key={fieldConfig.name}
            fieldConfig={fieldConfig}
            fieldValue={this.state.backbonePlaceModelAttributes.get(
              fieldConfig.name
            )}
            backboneAttachmentModelsAttributes={
              this.state.backboneAttachmentModelsAttributes
            }
          />
        ))}
        <PlaceDetailSurvey
          apiRoot={this.props.apiRoot}
          currentUser={this.props.currentUser}
          backboneSurveyModelsAttributes={
            this.state.backboneSurveyModelsAttributes
          }
          onSubmitSurvey={this.onSubmitSurvey.bind(this)}
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

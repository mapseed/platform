import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { fromJS, List as ImmutableList } from "immutable";
import emitter from "../utils/emitter";

import ResponseField from "../form-fields/response-field";
import PlaceDetailPromotionBar from "./place-detail-promotion-bar";
import PlaceDetailMetadataBar from "./place-detail-metadata-bar";
import PlaceDetailSurvey from "./place-detail-survey";
import CoverImage from "../ui-elements/cover-image";

const SubmissionCollection = require("../../js/models/submission-collection.js");

import fieldResponseFilter from "../utils/field-response-filter";
import constants from "../constants";

const Util = require("../../js/utils.js");

import "./index.scss";

const serializeBackboneCollection = collection => {
  let serializedCollection = ImmutableList();
  collection.each(model => {
    serializedCollection = serializedCollection.push(fromJS(model.attributes));
  });

  return serializedCollection;
};

class PlaceDetail extends Component {
  constructor(props) {
    super(props);

    this.surveyType = this.props.surveyConfig.submission_type;
    this.supportType = this.props.supportConfig.submission_type;
    if (!this.props.model.submissionSets[this.surveyType]) {
      this.props.model.submissionSets[
        this.surveyType
      ] = new SubmissionCollection(null, {
        submissionType: this.surveyType,
        placeModel: this.props.model,
      });
    }
    if (!this.props.model.submissionSets[this.supportType]) {
      this.props.model.submissionSets[
        this.supportType
      ] = new SubmissionCollection(null, {
        submissionType: this.supportType,
        placeModel: this.props.model,
      });
    }

    this.categoryConfig = this.props.placeConfig.place_detail.find(
      config =>
        config.category ===
        this.props.model.get(constants.LOCATION_TYPE_PROPERTY_NAME)
    );

    this.state = {
      placeModel: fromJS(this.props.model.attributes),
      supportModels: serializeBackboneCollection(
        this.props.model.submissionSets[this.supportType]
      ),
      surveyModels: serializeBackboneCollection(
        this.props.model.submissionSets[this.surveyType]
      ),
      attachmentModels: serializeBackboneCollection(
        this.props.model.attachmentCollection
      ),
    };
  }

  onMountTargetResponse(responseRef) {
    // NOTE: We use requestAnimationFrame() here to avoid a situation where
    // getBoundingClientRect() is called prematurely and returns zeroed values.
    // The exact reason is not clear, but evidently we need to give the browser
    // another tick to set the bounding rectangle offsets before calling
    // getBoundingClientRect() in this use case.
    requestAnimationFrame(() => {
      this.scrollDownTo(
        this.props.container,
        responseRef.getBoundingClientRect().top - 90
      );
    });
  }

  scrollDownTo(elt, to, jump = 0) {
    setTimeout(() => {
      elt.scrollTop = elt.scrollTop + jump;
      if (elt.scrollTop >= to) return;
      this.scrollDownTo(elt, to, jump + 0.5);
    }, 10);
  }

  onClickSupport() {
    const userSupportModel = this.props.model.submissionSets[
      this.supportType
    ].find(model => {
      return (
        model.get(constants.USER_TOKEN_PROPERTY_NAME) === this.props.userToken
      );
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
            supportModels: serializeBackboneCollection(
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
              supportModels: serializeBackboneCollection(
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
  }

  onSubmitSurvey(attrs) {
    Util.log(
      "USER",
      "place",
      "submit-reply-btn-click",
      this.props.model.getLoggingDetails(),
      this.state.surveyModels.size
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
          surveyModels: serializeBackboneCollection(
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
    const title =
      this.state.placeModel.get(constants.FULL_TITLE_PROPERTY_NAME) ||
      this.state.placeModel.get(constants.TITLE_PROPERTY_NAME) ||
      this.state.placeModel.get(constants.NAME_PROPERTY_NAME);
    const submitter =
      this.state.placeModel.get(constants.SUBMITTER_FIELD_NAME) || {};
    const isStoryChapter = !!this.state.placeModel.get(
      constants.STORY_FIELD_NAME
    );

    return (
      <div className="place-detail-view">
        <h1
          className={classNames("place-detail-view__header", {
            "place-detail-view__header--centered": isStoryChapter,
          })}
        >
          {title}
        </h1>
        <PlaceDetailPromotionBar
          isSupported={
            !!this.state.supportModels.find(model => {
              return (
                model.get(constants.USER_TOKEN_PROPERTY_NAME) ===
                this.props.userToken
              );
            })
          }
          isHorizontalLayout={isStoryChapter}
          numSupports={this.state.supportModels.size}
          onClickSupport={this.onClickSupport.bind(this)}
          onSocialShare={service =>
            Util.onSocialShare(this.props.model, service)
          }
          supportConfig={this.props.supportConfig}
        />
        {!isStoryChapter ? (
          <PlaceDetailMetadataBar
            submitter={submitter}
            placeModel={this.state.placeModel}
            surveyModels={this.state.surveyModels}
            placeConfig={this.props.placeConfig}
            placeTypes={this.props.placeTypes}
            surveyConfig={this.props.surveyConfig}
          />
        ) : null}
        <div className="place-detail-view__clearfix" />
        {this.state.attachmentModels
          .filter(attachment => attachment.type === constants.COVER_IMAGE_CODE)
          .map((attachment, i) => <CoverImage key={i} src={attachment.file} />)}
        {fieldResponseFilter(
          this.categoryConfig.fields,
          this.state.placeModel
        ).map(fieldConfig => (
          <ResponseField
            key={fieldConfig.name}
            fieldConfig={fieldConfig}
            fieldValue={this.state.placeModel.get(fieldConfig.name)}
            attachmentModels={this.state.attachmentModels}
          />
        ))}
        <PlaceDetailSurvey
          apiRoot={this.props.apiRoot}
          currentUser={this.props.currentUser}
          surveyModels={this.state.surveyModels}
          onMountTargetResponse={this.onMountTargetResponse.bind(this)}
          onSubmitSurvey={this.onSubmitSurvey.bind(this)}
          placeConfig={this.props.placeConfig}
          scrollToResponseId={this.props.scrollToResponseId}
          submitter={submitter}
          surveyConfig={this.props.surveyConfig}
        />
      </div>
    );
  }
}

PlaceDetail.propTypes = {
  apiRoot: PropTypes.string.isRequired,
  container: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
  model: PropTypes.object.isRequired,
  placeConfig: PropTypes.object.isRequired,
  placeTypes: PropTypes.object.isRequired,
  scrollToResponseId: PropTypes.string,
  supportConfig: PropTypes.object.isRequired,
  surveyConfig: PropTypes.object.isRequired,
  userToken: PropTypes.string.isRequired,
};

export default PlaceDetail;

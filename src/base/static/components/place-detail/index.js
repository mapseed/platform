import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { fromJS, List, Map } from "immutable";
import { connect } from "react-redux";
import styled from "react-emotion";

import PromotionBar from "./promotion-bar";
import MetadataBar from "./metadata-bar";
import Survey from "./survey";
import EditorBar from "./editor-bar";
import PlaceDetailEditor from "./place-detail-editor";
import emitter from "../../utils/emitter";

import FieldSummary from "./field-summary";

// Flavor custom code
import SnohomishFieldSummary from "./snohomish-field-summary";
import VVFieldSummary from "./vv-field-summary";

const SubmissionCollection = require("../../js/models/submission-collection.js");

import constants from "../../constants";

// NOTE: These pieces of the config are imported directly here because they
// don't require translation, which is ok for now.
// TODO: Eventually dissolve these imports.
import {
  custom_hooks as customHooks,
  custom_components as customComponents,
} from "config";

import { surveyConfigSelector } from "../../state/ducks/survey-config";
import { supportConfigSelector } from "../../state/ducks/support-config";
import { placeConfigSelector } from "../../state/ducks/place-config";
import { mapConfigSelector } from "../../state/ducks/map-config";

import { getCategoryConfig } from "../../utils/config-utils";
const Util = require("../../js/utils.js");

import { translate } from "react-i18next";
import "./index.scss";

// TEMPORARY: We define flavor hooks here for the time being.
const hooks = {
  pbOaklandDetailViewMount: state => {
    emitter.emit("layer-view:style", {
      action: constants.FOCUS_TARGET_LAYER_ACTION,
      targetLocationType: state.placeModel.get("related-location-type"),
    });
  },
};

const serializeBackboneCollection = collection => {
  let serializedCollection = List();
  collection.each(model => {
    serializedCollection = serializedCollection.push(fromJS(model.attributes));
  });

  return serializedCollection;
};

const PromotionMetadataContainer = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "24px",
});

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

    this.categoryConfig = getCategoryConfig(
      this.props.placeConfig,
      this.props.model.get(constants.LOCATION_TYPE_PROPERTY_NAME),
    );

    this.state = {
      // NOTE: We remove the story property before serializing, so it doesn't
      // get saved.
      // TODO: A proper story model would avoid this problem.
      placeModel: fromJS(this.props.model.attributes),
      supportModels: serializeBackboneCollection(
        this.props.model.submissionSets[this.supportType],
      ),
      surveyModels: serializeBackboneCollection(
        this.props.model.submissionSets[this.surveyType],
      ),
      attachmentModels: serializeBackboneCollection(
        this.props.model.attachmentCollection,
      ),
      isEditModeToggled: false,
      isEditable: Util.getAdminStatus(
        this.props.model.get(constants.DATASET_ID_PROPERTY_NAME),
        this.categoryConfig.admin_groups,
        !!this.categoryConfig.submitter_editing_supported,
        this.props.model.get(constants.SUBMITTER),
      ),
      isEditFormSubmitting: false,
      isSurveyEditFormSubmitting: false,
    };

    // topOffset = header bar height + padding + geocoding bar height (if enabled).
    this.topOffset = 80 + (this.props.mapConfig.geocoding_bar_enabled ? 72 : 0);
  }

  componentDidMount() {
    // Maintain reset listeners for submission collections in case the detail
    // view is instantiated before these collections have been fetched.
    this.props.model.submissionSets[this.supportType].on(
      "reset",
      collection => {
        this.setState({
          supportModels: serializeBackboneCollection(collection),
        });
      },
    );

    this.props.model.submissionSets[this.surveyType].on("reset", collection => {
      this.setState({
        surveyModels: serializeBackboneCollection(collection),
      });
    });

    this.props.container.scrollTop = 0;
    // Fire on mount hook.
    // The on mount hook allows flavors to run arbitrary code after the detail
    // view mounts.
    if (customHooks && customHooks.onDetailViewMount) {
      hooks[customHooks.onDetailViewMount](this.state);
    }
  }

  onMountTargetResponse(responseRef) {
    // NOTE: We use requestAnimationFrame() here to avoid a situation where
    // getBoundingClientRect() is called prematurely and returns zeroed values.
    // The exact reason is not clear, but evidently we need to give the browser
    // another tick to set the bounding rectangle offsets before calling
    // getBoundingClientRect() in this use case.
    requestAnimationFrame(() => {
      this.props.container.scrollTop =
        responseRef.getBoundingClientRect().top - this.topOffset;
    });
  }

  onAddAttachment(attachment) {
    this.props.model.attachmentCollection.add(attachment);
  }

  // NOTE: Because we serialize our survey model collection before passing it
  // down to the survey editor, we aren't able to (easily) pass down a
  // reference to each survey model's save method. As a result, we have a
  // special handler here to update survey models.
  onSurveyModelSave(attrs, modelId, onSuccess) {
    this.setState({ isSurveyEditFormSubmitting: true });
    this.props.model.submissionSets[this.surveyType].get(modelId).save(attrs, {
      success: () => {
        this.setState({
          isSurveyEditFormSubmitting: false,
          surveyModels: serializeBackboneCollection(
            this.props.model.submissionSets[this.surveyType],
          ),
        });
        onSuccess();
      },
    });
  }

  onSurveyModelRemove(modelId) {
    if (confirm(this.props.t("confirmSurveyRemove"))) {
      this.props.model.submissionSets[this.surveyType].get(modelId).destroy({
        success: () => {
          this.setState({
            surveyModels: serializeBackboneCollection(
              this.props.model.submissionSets[this.surveyType],
            ),
          });
        },
      });
    }
  }

  onAttachmentModelRemove(modelId) {
    if (confirm(this.props.t("confirmAttachmentRemove"))) {
      this.props.model.attachmentCollection.get(modelId).update(
        { visible: false },
        {
          success: () => {
            this.props.model.attachmentCollection.remove(modelId);
            this.setState({
              attachmentModels: serializeBackboneCollection(
                this.props.model.attachmentCollection,
              ),
            });
            Util.log("USER", "place-editor", "remove-attachment");
          },
          error: () => {
            Util.log("USER", "place-editor", "fail-to-remove-attachment");
          },
        },
      );
    }
  }

  // Handle the various results of Backbone model save/update calls that
  // occur in child components.
  onChildModelIO(action) {
    if (action === constants.PLACE_MODEL_IO_START_ACTION) {
      this.setState({ isEditFormSubmitting: true });
    } else if (action === constants.PLACE_MODEL_IO_END_SUCCESS_ACTION) {
      this.setState({
        isEditModeToggled: false,
        isEditFormSubmitting: false,
        placeModel: fromJS(this.props.model.attributes),
        attachmentModels: serializeBackboneCollection(
          this.props.model.attachmentCollection,
        ),
      });
    } else if (action === constants.PLACE_MODEL_IO_END_ERROR_ACTION) {
      this.setState({ isEditFormSubmitting: false });
    } else if (action === constants.SURVEY_MODEL_IO_END_SUCCESS_ACTION) {
      this.setState({
        surveyModels: serializeBackboneCollection(
          this.props.model.submissionSets[this.surveyType],
        ),
      });
    } else if (action === constants.SUPPORT_MODEL_IO_END_SUCCESS_ACTION) {
      this.setState({
        supportModels: serializeBackboneCollection(
          this.props.model.submissionSets[this.supportType],
        ),
      });
    }
  }

  render() {
    // This is an unfortunate series of checks, but needed at the moment.
    // TODO: We should revisit why this is necessary in the first place and see
    // if we can refactor.
    const title =
      this.state.placeModel.get(constants.FULL_TITLE_PROPERTY_NAME) ||
      this.state.placeModel.get(constants.TITLE_PROPERTY_NAME) ||
      this.state.placeModel.get(constants.NAME_PROPERTY_NAME);
    const locationType = this.state.placeModel.get(
      constants.LOCATION_TYPE_PROPERTY_NAME,
    );
    const submitter = this.state.placeModel.get(constants.SUBMITTER) || Map();
    const isStoryChapter = !!this.state.placeModel.get(
      constants.STORY_FIELD_NAME,
    );
    const userSupportModel = this.props.model.submissionSets[
      this.supportType
    ].find(model => {
      return (
        model.get(constants.USER_TOKEN_PROPERTY_NAME) === this.props.userToken
      );
    });
    const isWithMetadata =
      !isStoryChapter &&
      !(
        this.state.placeModel.get(constants.SHOW_METADATA_PROPERTY_NAME) ===
        false
      ) &&
      !this.props.placeConfig.hide_metadata_bar;
    // TODO: dissolve when flavor abstraction is ready
    let fieldSummary;
    if (
      customComponents &&
      customComponents.FieldSummary === "SnohomishFieldSummary" &&
      locationType === "conservation-actions"
    ) {
      fieldSummary = (
        <SnohomishFieldSummary
          attachmentModels={this.state.attachmentModels}
          fields={this.categoryConfig.fields}
          placeModel={this.state.placeModel}
        />
      );
    } else if (
      customComponents &&
      customComponents.FieldSummary === "VVFieldSummary" &&
      locationType === "community_input"
    ) {
      fieldSummary = (
        <VVFieldSummary
          attachmentModels={this.state.attachmentModels}
          fields={this.categoryConfig.fields}
          placeModel={this.state.placeModel}
        />
      );
    } else {
      fieldSummary = (
        <FieldSummary
          attachmentModels={this.state.attachmentModels}
          fields={this.categoryConfig.fields}
          placeModel={this.state.placeModel}
        />
      );
    }

    return (
      <div className="place-detail-view">
        {this.state.isEditable && (
          <EditorBar
            isEditModeToggled={this.state.isEditModeToggled}
            isGeocodingBarEnabled={this.props.isGeocodingBarEnabled}
            isSubmitting={this.state.isEditFormSubmitting}
            onToggleEditMode={() => {
              this.setState({
                isEditModeToggled: !this.state.isEditModeToggled,
              });
            }}
          />
        )}
        <h1
          className={classNames("place-detail-view__header", {
            "place-detail-view__header--centered": isStoryChapter,
            "place-detail-view__header--with-top-space": this.state.isEditable,
          })}
        >
          {title}
        </h1>
        <PromotionMetadataContainer>
          {isWithMetadata && (
            <MetadataBar
              submitter={submitter}
              placeModel={this.state.placeModel}
              surveyModels={this.state.surveyModels}
            />
          )}
          <PromotionBar
            getLoggingDetails={this.props.model.getLoggingDetails.bind(
              this.props.model,
            )}
            isSupported={
              !!this.state.supportModels.find(model => {
                return (
                  model.get(constants.USER_TOKEN_PROPERTY_NAME) ===
                  this.props.userToken
                );
              })
            }
            isHorizontalLayout={isStoryChapter || !isWithMetadata}
            numSupports={this.state.supportModels.size}
            onModelIO={this.onChildModelIO.bind(this)}
            onSocialShare={service =>
              Util.onSocialShare(this.props.model, service)
            }
            supportModelCreate={this.props.model.submissionSets[
              this.supportType
            ].create.bind(this.props.model.submissionSets[this.supportType])}
            userSupportModel={userSupportModel}
            userToken={this.props.userToken}
          />
        </PromotionMetadataContainer>
        <div className="place-detail-view__clearfix" />
        {this.state.isEditModeToggled ? (
          <PlaceDetailEditor
            collectionId={this.props.collectionId}
            placeModel={this.state.placeModel}
            container={this.props.container}
            attachmentModels={this.state.attachmentModels}
            onAddAttachment={this.onAddAttachment.bind(this)}
            onAttachmentModelRemove={this.onAttachmentModelRemove.bind(this)}
            onModelIO={this.onChildModelIO.bind(this)}
            onPlaceModelSave={this.props.model.save.bind(this.props.model)}
            places={this.props.places}
            router={this.props.router}
            isSubmitting={this.state.isEditFormSubmitting}
          />
        ) : (
          fieldSummary
        )}
        <Survey
          currentUser={this.props.currentUser}
          getLoggingDetails={this.props.model.getLoggingDetails.bind(
            this.props.model,
          )}
          isEditModeToggled={this.state.isEditModeToggled}
          isSubmitting={this.state.isSurveyEditFormSubmitting}
          surveyModels={this.state.surveyModels}
          onModelIO={this.onChildModelIO.bind(this)}
          onMountTargetResponse={this.onMountTargetResponse.bind(this)}
          onSurveyCollectionCreate={this.props.model.submissionSets[
            this.surveyType
          ].create.bind(this.props.model.submissionSets[this.surveyType])}
          onSurveyModelSave={this.onSurveyModelSave.bind(this)}
          onSurveyModelRemove={this.onSurveyModelRemove.bind(this)}
          scrollToResponseId={this.props.scrollToResponseId}
          submitter={submitter}
          userToken={this.props.userToken}
        />
      </div>
    );
  }
}

PlaceDetail.propTypes = {
  collectionId: PropTypes.string.isRequired,
  container: PropTypes.instanceOf(HTMLElement),
  currentUser: PropTypes.shape({
    avatar_url: PropTypes.string,
    groups: PropTypes.arrayOf(
      PropTypes.shape({
        dataset: PropTypes.string,
        name: PropTypes.string,
      }),
    ),
    id: PropTypes.number,
    name: PropTypes.string,
    provider_id: PropTypes.string,
    provider_type: PropTypes.string,
    username: PropTypes.string,
  }),
  isGeocodingBarEnabled: PropTypes.bool,
  mapConfig: PropTypes.shape({
    geocoding_bar_enabled: PropTypes.bool,
  }).isRequired,
  model: PropTypes.instanceOf(Backbone.Model),
  placeConfig: PropTypes.object.isRequired,
  places: PropTypes.objectOf(PropTypes.instanceOf(Backbone.Collection)),
  router: PropTypes.instanceOf(Backbone.Router),
  scrollToResponseId: PropTypes.string,
  supportConfig: PropTypes.object.isRequired,
  surveyConfig: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  userToken: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  mapConfig: mapConfigSelector(state),
  surveyConfig: surveyConfigSelector(state),
  supportConfig: supportConfigSelector(state),
  placeConfig: placeConfigSelector(state),
});

export default connect(mapStateToProps)(translate("PlaceDetail")(PlaceDetail));

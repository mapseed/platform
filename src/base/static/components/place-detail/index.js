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
import PlaceDetailEditorBar from "./place-detail-editor-bar";
import PlaceDetailEditor from "./place-detail-editor";

const SubmissionCollection = require("../../js/models/submission-collection.js");

import fieldResponseFilter from "../utils/field-response-filter";
import constants from "../constants";
import { placeDetailEditor as messages } from "../messages";
import { extractEmbeddedImages } from "../utils/embedded-images";
import { scrollDownTo } from "../utils/scroll-helpers";

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

    this.attachments = [];
    this.geometryStyle = null;
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
      isEditModeToggled: false,
      isEditable: Util.getAdminStatus(
        this.props.model.get(constants.DATASET_ID_PROPERTY_NAME),
        this.categoryConfig.admin_groups
      ),
      isEditFormSubmitting: false,
    };
  }

  onMountTargetResponse(responseRef) {
    // NOTE: We use requestAnimationFrame() here to avoid a situation where
    // getBoundingClientRect() is called prematurely and returns zeroed values.
    // The exact reason is not clear, but evidently we need to give the browser
    // another tick to set the bounding rectangle offsets before calling
    // getBoundingClientRect() in this use case.
    requestAnimationFrame(() => {
      scrollDownTo(
        this.props.container,
        responseRef.getBoundingClientRect().top - 90
      );
    });
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

  onAdditionalData(action, payload) {
    switch (action) {
      case constants.ON_ADD_ATTACHMENT_ACTION:
        this.attachments.push(payload);
        break;
      default:
        console.error(
          "Error: Unable to handle form field callback action:",
          action
        );
        break;
    }
  }

  onGeometryStyleChange(style) {
    this.geometryStyle = style;
  }

  onEditorUpdate(fieldState) {
    this.setState({ isEditFormSubmitting: true });

    const attrs = fieldState
      .filter(state => state.get(constants.FIELD_STATE_VALUE_KEY) !== null)
      .map(state => state.get(constants.FIELD_STATE_VALUE_KEY))
      .toJS();

    if (fieldState.get(constants.GEOMETRY_PROPERTY_NAME)) {
      attrs.style = this.geometryStyle;
    }

    // Replace image data in rich text fields with placeholders built from each
    // image's name.
    // TODO: This logic is better suited for the FormField component,
    // perhaps in an onSave hook.
    this.categoryConfig.fields
      .filter(field => field.type === constants.RICH_TEXTAREA_FIELD_TYPENAME)
      .forEach(field => {
        attrs[field.name] = extractEmbeddedImages(attrs[field.name]);
      });

    this.attachments.forEach(attachment => {
      this.props.model.attachmentCollection.add(attachment);
    });

    this.props.model.save(attrs, {
      success: () => {
        this.setState({ isEditFormSubmitting: false });
        if (Backbone.history.fragment === Util.getUrl(this.props.model)) {
          Backbone.history.loadUrl(Backbone.history.fragment);
        } else {
          this.props.router.navigate(Util.getUrl(this.props.model), {
            trigger: true,
            replace: true,
          });
        }
      },
      error: () => {
        this.setState({ isEditFormSubmitting: false });
        Util.log("USER", "place-editor", "fail-to-edit-place");
      },
    });
  }

  onEditorRemove() {
    this.setState({ isEditFormSubmitting: true });
    if (confirm(messages.confirmRemove)) {
      this.props.model.save(
        {
          visible: false,
        },
        {
          success: () => {
            this.setState({ isEditFormSubmitting: false });
            this.props.model.trigger("userHideModel", this.props.model);
          },
          error: () => {
            this.setState({ isEditFormSubmitting: false });
            Util.log("USER", "place-editor", "fail-to-remove-place");
          },
        }
      );
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
    const submitter =
      this.state.placeModel.get(constants.SUBMITTER_FIELD_NAME) || {};
    const isStoryChapter = !!this.state.placeModel.get(
      constants.STORY_FIELD_NAME
    );

    return (
      <div className="place-detail-view">
        {this.state.isEditable ? (
          <PlaceDetailEditorBar
            isEditModeToggled={this.state.isEditModeToggled}
            isSubmitting={this.state.isEditFormSubmitting}
            onToggleEditMode={() => {
              this.props.model.attachmentCollection.fetch().always(() => {
                // We fetch the attachment collection here to make sure we
                // have the latest attachment URLs. The danger is if someone
                // creates a place then immediately jumps into edit mode,
                // duplicate attachments can accumulate.
                if (!this.state.isEditModeToggled) {
                  this.setState({
                    attachmentModels: serializeBackboneCollection(
                      this.props.model.attachmentCollection
                    ),
                  });
                }
                this.setState({
                  isEditModeToggled: !this.state.isEditModeToggled,
                });
              });
            }}
          />
        ) : null}
        <h1
          className={classNames("place-detail-view__header", {
            "place-detail-view__header--centered": isStoryChapter,
            "place-detail-view__header--with-top-space": this.state.isEditable,
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
          .filter(
            attachment =>
              attachment.get(constants.ATTACHMENT_TYPE_PROPERTY_NAME) ===
              constants.COVER_IMAGE_CODE
          )
          .map((attachment, i) => (
            <CoverImage
              key={i}
              src={attachment.get(constants.ATTACHMENT_FILE_PROPERTY_NAME)}
            />
          ))}
        {this.state.isEditModeToggled ? (
          <PlaceDetailEditor
            placeModel={this.state.placeModel}
            container={this.props.container}
            attachmentModels={this.state.attachmentModels}
            categoryConfig={this.categoryConfig}
            layerView={this.props.layerView}
            map={this.props.map}
            mapConfig={this.props.mapConfig}
            onAdditionalData={this.onAdditionalData.bind(this)}
            onGeometryStyleChange={this.onGeometryStyleChange.bind(this)}
            onRemove={this.onEditorRemove.bind(this)}
            onUpdate={this.onEditorUpdate.bind(this)}
            places={this.props.places}
            router={this.props.router}
            isSubmitting={this.state.isEditFormSubmitting}
          />
        ) : (
          fieldResponseFilter(
            this.categoryConfig.fields,
            this.state.placeModel
          ).map(fieldConfig => (
            <ResponseField
              key={fieldConfig.name}
              fieldConfig={fieldConfig}
              fieldValue={this.state.placeModel.get(fieldConfig.name)}
              attachmentModels={this.state.attachmentModels}
            />
          ))
        )}
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
  container: PropTypes.instanceOf(HTMLElement),
  currentUser: PropTypes.shape({
    avatar_url: PropTypes.string,
    groups: PropTypes.arrayOf(
      PropTypes.shape({
        dataset: PropTypes.string,
        name: PropTypes.string,
      })
    ),
    id: PropTypes.number,
    name: PropTypes.string,
    provider_id: PropTypes.string,
    provider_type: PropTypes.string,
    username: PropTypes.string,
  }),
  layerView: PropTypes.instanceOf(Backbone.View),
  map: PropTypes.instanceOf(L.Map),
  mapConfig: PropTypes.object.isRequired,
  model: PropTypes.instanceOf(Backbone.Model),
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
    default_basemap: PropTypes.string.isRequired,
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
          })
        ),
      })
    ),
  }).isRequired,
  places: PropTypes.objectOf(PropTypes.instanceOf(Backbone.Collection)),
  placeTypes: PropTypes.objectOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      rules: PropTypes.arrayOf(
        PropTypes.shape({
          condition: PropTypes.string.isRequired,
          icon: PropTypes.object,
          style: PropTypes.object,
        })
      ),
    })
  ).isRequired,
  router: PropTypes.instanceOf(Backbone.Router),
  scrollToResponseId: PropTypes.string,
  supportConfig: PropTypes.shape({
    submission_type: PropTypes.string.isRequired,
    submit_btn_text: PropTypes.string.isRequired,
    response_name: PropTypes.string.isRequired,
    response_plural_name: PropTypes.string.isRequired,
    action_text: PropTypes.string.isRequired,
    anonymous_name: PropTypes.string.isRequired,
  }),
  surveyConfig: PropTypes.shape({
    submission_type: PropTypes.string.isRequired,
    show_responses: PropTypes.bool.isRequired,
    response_name: PropTypes.string.isRequired,
    response_plural_name: PropTypes.string.isRequired,
    action_text: PropTypes.string.isRequired,
    anonymous_name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    form_link_text: PropTypes.string.isRequired,
    submit_btn_text: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
  userToken: PropTypes.string.isRequired,
};

export default PlaceDetail;

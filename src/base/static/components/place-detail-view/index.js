import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import {
  Map as ImmutableMap,
  OrderedMap as ImmutableOrderedMap,
} from "immutable";

import FieldResponse from "../form-response";
import PlaceDetailPromotionBar from "./place-detail-promotion-bar";
import PlaceDetailMetadataBar from "./place-detail-metadata-bar";
import PlaceDetailSurvey from "./place-detail-survey";
import CoverImage from "../ui-elements/cover-image";
import PlaceDetailEditorBar from "./place-detail-editor-bar";
import FormField from "../form-field";

const Util = require("../../js/utils.js");
const SubmissionCollection = require("../../js/models/submission-collection.js");

import { placeDetailEditor as messages } from "../messages";
import constants from "../constants";

import "./place-detail-view.scss";

class PlaceDetailView extends Component {
  constructor(props) {
    super(props);
    this.categoryConfig = this.props.placeConfig.place_detail.find(
      categoryConfig =>
        categoryConfig.category ===
        this.props.model.get(constants.LOCATION_TYPE_PROPERTY_NAME)
    );
    let fields = ImmutableOrderedMap();
    this.categoryConfig.fields.forEach(field => {
      fields = fields.set(
        field.name,
        ImmutableMap().set(
          constants.FIELD_STATE_VALUE_KEY,
          this.props.model.get(field.name)
        )
      );
    });
    this.state = {
      fields: fields,
      isFormSubmitting: false,
      isModified: false,
      formValidationErrors: new Set(),
      showValidityStatus: false,
      isEditModeToggled: false,
      isEditable: Util.getAdminStatus(
        this.props.model.get(constants.DATASET_ID_PROPERTY_NAME),
        this.categoryConfig.admin_groups
      ),
    };
  }

  componentDidMount() {
    // TODO: Replace this.
    new Spinner(Shareabouts.smallSpinnerOptions).spin(
      document.getElementsByClassName("place-detail-view__submit-spinner")[0]
    );
  }

  onFieldChange(fieldName, fieldStatus, isInitializing) {
    this.setState(({ fields }) => ({
      fields: fields.set(fieldName, fieldStatus),
      updatingField: fieldName,
      isInitializing: isInitializing,
      isModified: !isInitializing,
    }));
  }

  onSave() {
    this.setState({ isFormSubmitting: true });

    let attrs = this.state.fields
      .filter(state => state.get(constants.FIELD_STATE_VALUE_KEY) !== null)
      .map(state => state.get(constants.FIELD_STATE_VALUE_KEY))
      .toJS();

    this.props.model.save(attrs, {
      success: () => {
        this.setState({ isFormSubmitting: false, isEditingToggled: false });

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
        this.setState({ isFormSubmitting: false });
        Util.log("USER", "place-editor", "fail-to-edit-place");
      },
    });
  }

  onRemove() {
    if (confirm(messages.confirmRemove)) {
      this.setState({ isFormSubmitting: true });
      this.props.model.save(
        {
          visible: false,
        },
        {
          success: () => {
            this.props.model.trigger("userHideModel", this.props.model);
          },
          error: () => {
            this.setState({ isFormSubmitting: false });
            Util.log("USER", "place-editor", "fail-to-remove-place");
          },
        }
      );
    }
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
      <div
        className={classNames("place-detail-view", {
          "place-detail-view--faded": this.state.isFormSubmitting,
        })}
      >
        {this.state.isEditable ? (
          <PlaceDetailEditorBar
            isEditModeToggled={this.state.isEditModeToggled}
            isFormSubmitting={this.state.isFormSubmitting}
            isModified={this.state.isModified}
            onSave={this.onSave.bind(this)}
            onRemove={this.onRemove.bind(this)}
            onToggleEditMode={() => {
              this.setState({
                isEditModeToggled: !this.state.isEditModeToggled,
              });
            }}
          />
        ) : null}
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
          {this.state.isEditModeToggled ? null : title}
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
          .filter(attachment => attachment.type === constants.COVER_IMAGE_CODE)
          .map((attachment, i) => (
            <CoverImage key={title + "-" + i} src={attachment.file} />
          ))}
        {this.state.isEditModeToggled ? (
          <form>
            {this.state.fields
              .map((fieldState, fieldName) => {
                return (
                  <FormField
                    fieldConfig={this.categoryConfig.fields.find(
                      field => field.name === fieldName
                    )}
                    categoryConfig={this.categoryConfig}
                    disabled={this.state.isFormSubmitting}
                    fieldState={fieldState}
                    onGeometryStyleChange={() => {}}
                    onAdditionalData={() => {}}
                    isInitializing={this.state.isInitializing}
                    key={fieldName}
                    map={this.props.map}
                    mapConfig={this.props.mapConfig}
                    onFieldChange={this.onFieldChange.bind(this)}
                    places={this.props.places}
                    router={this.props.router}
                    showValidityStatus={this.state.showValidityStatus}
                    updatingField={this.state.updatingField}
                  />
                );
              })
              .toArray()}
          </form>
        ) : (
          this.fields.map(field => (
            <FieldResponse
              key={title + "-" + field.name}
              field={field}
              model={this.props.model}
              placeConfig={this.props.placeConfig}
            />
          ))
        )}
        <PlaceDetailSurvey
          apiRoot={this.props.apiRoot}
          currentUser={this.props.currentUser}
          model={this.props.model}
          placeConfig={this.props.placeConfig}
          submitter={submitter}
          surveyConfig={this.props.surveyConfig}
        />
        <div
          className={classNames("place-detail-view__submit-spinner", {
            "place-detail-view__submit-spinner--visible": this.state
              .isFormSubmitting,
          })}
        />
      </div>
    );
  }
}

PlaceDetailView.propTypes = {
  apiRoot: PropTypes.string.isRequired,
  currentUser: PropTypes.object,
  map: PropTypes.object.isRequired,
  mapConfig: PropTypes.object.isRequired,
  model: PropTypes.object.isRequired,
  placeConfig: PropTypes.object.isRequired,
  places: PropTypes.object.isRequired,
  placeTypes: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
  supportConfig: PropTypes.object.isRequired,
  surveyConfig: PropTypes.object.isRequired,
  userToken: PropTypes.string.isRequired,
};

export default PlaceDetailView;

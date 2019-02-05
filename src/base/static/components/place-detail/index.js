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
import TagBar from "../organisms/tag-bar";
import PlaceDetailEditor from "./place-detail-editor";
import emitter from "../../utils/emitter";

import FieldSummary from "./field-summary";

// Flavor custom code
import SnohomishFieldSummary from "./snohomish-field-summary";
import VVFieldSummary from "./vv-field-summary";
import PalouseFieldSummary from "./palouse-field-summary";

import constants from "../../constants";

// NOTE: These pieces of the config are imported directly here because they
// don't require translation, which is ok for now.
// TODO: Eventually dissolve these imports.
import {
  custom_hooks as customHooks,
  custom_components as customComponents,
} from "config";

import {
  commentFormConfigPropType,
  commentFormConfigSelector,
} from "../../state/ducks/forms-config";
import { supportConfigSelector } from "../../state/ducks/support-config";
import { placeConfigSelector } from "../../state/ducks/place-config";
import { mapConfigSelector } from "../../state/ducks/map-config";
import {
  hasUserAbilitiesInPlace,
  hasGroupAbilitiesInDatasets,
} from "../../state/ducks/user";
import { isEditModeToggled, updateEditModeToggled } from "../../state/ducks/ui";
import { placeSelector } from "../../state/ducks/places";

import { getCategoryConfig } from "../../utils/config-utils";
const Util = require("../../js/utils.js");

import { translate } from "react-i18next";
import "./index.scss";

// TEMPORARY: We define flavor hooks here for the time being.
const hooks = {
  pbOaklandDetailViewMount: state => {
    emitter.emit("layer-view:style", {
      action: constants.FOCUS_TARGET_LAYER_ACTION,
      // TODO
      targetLocationType: state.placeModel.get("related-location-type"),
    });
  },
};

const PromotionMetadataContainer = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "24px",
});

const PlaceDetailContainer = styled("div")(props => ({
  paddingTop: props.isEditable ? "60px" : 0,
}));

class PlaceDetail extends Component {
  state = {
    place: fromJS(this.props.getPlace(this.props.placeId)),
    isSurveyEditFormSubmitting: false,
    placeRequestType: null,
  };
  categoryConfig = getCategoryConfig(
    this.props.placeConfig,
    this.state.place.get(constants.LOCATION_TYPE_PROPERTY_NAME),
  );
  submitter = this.state.place.get("submitter") || Map();
  submitterName = this.state.place.get(constants.SUBMITTER)
    ? this.state.place.get(constants.SUBMITTER).get("name")
    : this.state.place.get(constants.NAME_PROPERTY_NAME) ||
      this.props.placeConfig.anonymous_name;
  isTagBarEditable = this.props.hasGroupAbilitiesInDatasets({
    abilities: ["update", "destroy", "create"],
    submissionSet: "tags",
    datasetSlugs: [this.state.place.get("_datasetSlug")],
  });
  isPlaceDetailEditable =
    this.props.hasUserAbilitiesInPlace({
      submitter: this.state.place.get(constants.SUBMITTER),
      isSubmitterEditingSupported: this.categoryConfig
        .submitter_editing_supported,
    }) ||
    this.props.hasGroupAbilitiesInDatasets({
      abilities: ["update"],
      submissionSet: "places",
      datasetSlugs: [this.state.place.get("_datasetSlug")],
    });
  // topOffset = header bar height + padding + geocoding bar height (if enabled).
  topOffset = 80 + (this.props.mapConfig.geocoding_bar_enabled ? 72 : 0);

  componentDidMount() {
    this.props.container.scrollTop = 0;

    // Fire on mount hook.
    // The on mount hook allows flavors to run arbitrary code after the detail
    // view mounts.

    // TODO
    if (customHooks && customHooks.onDetailViewMount) {
      hooks[customHooks.onDetailViewMount](this.state);
    }
  }

  componentDidUpdate() {
    const newPlace = fromJS(this.props.getPlace(this.props.placeId));

    if (
      // Have supports been added or removed?
      this.props.getPlace(this.props.placeId).submission_sets.support.length !==
        this.state.place.get("submission_sets").get("support").size ||
      // Have comments been added or removed?
      this.props.getPlace(this.props.placeId).submission_sets.comments
        .length !==
        this.state.place.get("submission_sets").get("comments").size ||
      // Has Place data changed?
      !newPlace.equals(this.state.place) ||
      // Has the data of any comment changed?
      newPlace
        .get("submission_sets")
        .get("comments")
        .filter((comment, i) => {
          return comment.equals(
            this.state.place
              .get("submission_sets")
              .get("comments")
              .get(i),
          );
        }).size !== this.state.place.get("submission_sets").get("comments").size
    ) {
      this.setState({
        place: newPlace,
      });
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

  onAddAttachment = () => {}; // TODO

  setPlaceRequestType = requestType => {
    this.setState({
      placeRequestType: requestType,
    });
  };

  render() {
    const title =
      this.state.place.get(constants.FULL_TITLE_PROPERTY_NAME) ||
      this.state.place.get(constants.TITLE_PROPERTY_NAME) ||
      this.state.place.get(constants.NAME_PROPERTY_NAME);
    const locationType = this.state.place.get(
      constants.LOCATION_TYPE_PROPERTY_NAME,
    );
    const isStoryChapter = !!this.state.place.get(constants.STORY_FIELD_NAME);
    const supports = this.state.place
      .get("submission_sets")
      .get("support", List());
    const comments = this.state.place
      .get("submission_sets")
      .get("comments", List());
    const isWithMetadata =
      !isStoryChapter &&
      !(
        this.state.place.get(constants.SHOW_METADATA_PROPERTY_NAME) === false
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
          fields={this.categoryConfig.fields}
          place={this.state.place}
        />
      );
    } else if (
      customComponents &&
      customComponents.FieldSummary === "VVFieldSummary" &&
      locationType === "community_input"
    ) {
      fieldSummary = (
        <VVFieldSummary
          fields={this.categoryConfig.fields}
          place={this.state.place}
        />
      );
    } else if (
      customComponents &&
      customComponents.FieldSummary === "PalouseFieldSummary" &&
      locationType === "reports"
    ) {
      fieldSummary = (
        <PalouseFieldSummary
          fields={this.categoryConfig.fields}
          place={this.state.place}
        />
      );
    } else {
      fieldSummary = (
        <FieldSummary
          fields={this.categoryConfig.fields}
          place={this.state.place}
        />
      );
    }

    return (
      <PlaceDetailContainer
        isEditable={this.isPlaceDetailEditable || this.isTagBarEditable}
      >
        {(this.isPlaceDetailEditable || this.isTagBarEditable) && (
          <EditorBar
            isEditModeToggled={this.props.isEditModeToggled}
            isPlaceDetailEditable={this.isPlaceDetailEditable}
            isTagBarEditable={this.isTagBarEditable}
            isGeocodingBarEnabled={this.props.isGeocodingBarEnabled}
            isSubmitting={this.state.isEditFormSubmitting}
            onClickRemovePlace={() => this.setPlaceRequestType("remove")}
            onClickUpdatePlace={() => this.setPlaceRequestType("update")}
            onToggleEditMode={() => {
              this.props.updateEditModeToggled(!this.props.isEditModeToggled);
            }}
          />
        )}
        <TagBar
          isEditModeToggled={this.props.isEditModeToggled}
          isEditable={this.isTagBarEditable}
          placeTags={this.state.place.get("tags").toJS()}
          datasetSlug={this.state.place.get("_datasetSlug")}
          placeUrl={this.state.place.get("url")}
        />
        <h1
          className={classNames("place-detail-view__header", {
            "place-detail-view__header--centered": isStoryChapter,
          })}
        >
          {title}
        </h1>
        <PromotionMetadataContainer>
          {isWithMetadata && (
            <MetadataBar
              createdDatetime={this.state.place.get(
                constants.CREATED_DATETIME_PROPERTY_NAME,
              )}
              submitterName={this.submitterName}
              submitterAvatarUrl={this.submitter.get("avatar_url")}
              numComments={comments.size}
              actionText={this.props.placeConfig.action_text}
            />
          )}
          <PromotionBar
            isHorizontalLayout={isStoryChapter || !isWithMetadata}
            numSupports={supports.size}
            onSocialShare={service =>
              Util.onSocialShare(this.state.place, service)
            }
            userSupport={supports.find(support => {
              return (
                support.get(constants.USER_TOKEN_PROPERTY_NAME) ===
                this.props.userToken
              );
            })}
            placeUrl={this.state.place.get("url")}
            placeId={this.state.place.get("id")}
            userToken={this.props.userToken}
          />
        </PromotionMetadataContainer>
        <div className="place-detail-view__clearfix" />
        {this.props.isEditModeToggled && this.isPlaceDetailEditable ? (
          <PlaceDetailEditor
            place={this.state.place}
            onRequestEnd={() => this.setState({ placeRequestType: null })}
            placeRequestType={this.state.placeRequestType}
            container={this.props.container}
            onAddAttachment={this.onAddAttachment}
            router={this.props.router}
          />
        ) : (
          fieldSummary
        )}
        <Survey
          placeUrl={this.state.place.get("url")}
          placeId={this.state.place.get("id")}
          datasetSlug={this.state.place.get("_datasetSlug")}
          currentUser={this.props.currentUser}
          isEditModeToggled={this.props.isEditModeToggled}
          isEditable={this.isPlaceDetailEditable}
          isSubmitting={this.state.isSurveyEditFormSubmitting}
          comments={comments}
          onMountTargetResponse={this.onMountTargetResponse.bind(this)}
          scrollToResponseId={this.props.scrollToResponseId}
          submitter={this.submitter}
          userToken={this.props.userToken}
        />
      </PlaceDetailContainer>
    );
  }
}

PlaceDetail.propTypes = {
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
  hasGroupAbilitiesInDatasets: PropTypes.func.isRequired,
  hasUserAbilitiesInPlace: PropTypes.func.isRequired,
  isEditModeToggled: PropTypes.bool.isRequired,
  isGeocodingBarEnabled: PropTypes.bool,
  mapConfig: PropTypes.shape({
    geocoding_bar_enabled: PropTypes.bool,
  }).isRequired,
  placeConfig: PropTypes.object.isRequired,
  placeId: PropTypes.number.isRequired,
  getPlace: PropTypes.func.isRequired,
  router: PropTypes.instanceOf(Backbone.Router),
  scrollToResponseId: PropTypes.number,
  supportConfig: PropTypes.object.isRequired,
  commentFormConfig: commentFormConfigPropType.isRequired,
  t: PropTypes.func.isRequired,
  updateEditModeToggled: PropTypes.func.isRequired,
  userToken: PropTypes.string.isRequired,
};

const mapDispatchToProps = dispatch => ({
  updateEditModeToggled: isToggled =>
    dispatch(updateEditModeToggled(isToggled)),
});

const mapStateToProps = state => ({
  hasGroupAbilitiesInDatasets: ({ abilities, submissionSet, datasetSlugs }) =>
    hasGroupAbilitiesInDatasets({
      state,
      abilities,
      submissionSet,
      datasetSlugs,
    }),
  hasUserAbilitiesInPlace: ({ submitter, isSubmitterEditingSupported }) =>
    hasUserAbilitiesInPlace({ state, submitter, isSubmitterEditingSupported }),
  isEditModeToggled: isEditModeToggled(state),
  mapConfig: mapConfigSelector(state),
  commentFormConfig: commentFormConfigSelector(state),
  getPlace: placeId => placeSelector(state, placeId),
  supportConfig: supportConfigSelector(state),
  placeConfig: placeConfigSelector(state),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(translate("PlaceDetail")(PlaceDetail));

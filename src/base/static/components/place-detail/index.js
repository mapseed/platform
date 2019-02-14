import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
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

import { placeSelector } from "../../state/ducks/places";

import constants from "../../constants";

// NOTE: These pieces of the config are imported directly here because they
// don't require translation, which is ok for now.
// TODO: Eventually dissolve these imports.
import { custom_components as customComponents } from "config";

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

import { getCategoryConfig } from "../../utils/config-utils";
const Util = require("../../js/utils.js");

import { translate } from "react-i18next";
import "./index.scss";

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
    isSurveyEditFormSubmitting: false,
    placeRequestType: null,
  };

  // topOffset = header bar height + padding + geocoding bar height (if enabled).
  topOffset = 80 + (this.props.mapConfig.geocoding_bar_enabled ? 72 : 0);

  componentDidMount() {
    this.props.container.scrollTop = 0;
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.isEditModeToggled !== prevProps.isEditModeToggled &&
      !this.props.isEditModeToggled
    ) {
      emitter.emit(constants.DRAW_DELETE_GEOMETRY_EVENT);
      emitter.emit(
        constants.PLACE_COLLECTION_ADD_PLACE_EVENT,
        this.props.datasetSlug,
      );
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

  setPlaceRequestType = requestType => {
    this.setState({
      placeRequestType: requestType,
    });
  };

  render() {
    // TODO: Selecting the Place on each render will not be necessary when
    // AppView is ported to a component. Also, we'll be able to set many of
    // these consts once on component mount.
    const place = this.props.placeSelector(this.props.placeId);
    const isStoryChapter = !!place.story;
    const supports = place.submission_sets.support;
    const comments = place.submission_sets.comments;
    const categoryConfig = getCategoryConfig(
      this.props.placeConfig,
      place.location_type,
    );
    const submitterName = place.submitter
      ? place.submitter.name
      : place.submitter_name || this.props.placeConfig.anonymous_name;
    const isTagBarEditable = this.props.hasGroupAbilitiesInDatasets({
      abilities: ["update", "destroy", "create"],
      submissionSet: "tags",
      datasetSlugs: [this.props.datasetSlug],
    });
    const isPlaceDetailEditable =
      this.props.hasUserAbilitiesInPlace({
        submitter: place.submitter,
        isSubmitterEditingSupported: categoryConfig.submitter_editing_supported,
      }) ||
      this.props.hasGroupAbilitiesInDatasets({
        abilities: ["update"],
        submissionSet: "places",
        datasetSlugs: [this.props.datasetSlug],
      });

    // TODO: dissolve when flavor abstraction is ready
    let fieldSummary;
    if (
      customComponents &&
      customComponents.FieldSummary === "SnohomishFieldSummary" &&
      place.location_type === "conservation-actions"
    ) {
      fieldSummary = (
        <SnohomishFieldSummary
          fields={categoryConfig.fields}
          place={place}
        />
      );
    } else if (
      customComponents &&
      customComponents.FieldSummary === "VVFieldSummary" &&
      place.location_type === "community_input"
    ) {
      fieldSummary = (
        <VVFieldSummary
          fields={categoryConfig.fields}
          place={place}
        />
      );
    } else if (
      customComponents &&
      customComponents.FieldSummary === "PalouseFieldSummary" &&
      place.location_type === "reports"
    ) {
      fieldSummary = (
        <PalouseFieldSummary
          fields={categoryConfig.fields}
          place={place}
        />
      );
    } else {
      fieldSummary = (
        <FieldSummary fields={categoryConfig.fields} place={place} />
      );
    }

    return (
      <PlaceDetailContainer
        isEditable={isPlaceDetailEditable || isTagBarEditable}
      >
        {(isPlaceDetailEditable || isTagBarEditable) && (
          <EditorBar
            isEditModeToggled={this.props.isEditModeToggled}
            isPlaceDetailEditable={isPlaceDetailEditable}
            isTagBarEditable={isTagBarEditable}
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
          isEditable={isTagBarEditable}
          placeTags={place.tags}
          datasetSlug={this.props.datasetSlug}
          placeUrl={place.url}
          placeId={place.id}
        />
        <h1
          className={classNames("place-detail-view__header", {
            "place-detail-view__header--centered": isStoryChapter,
          })}
        >
          {place.title}
        </h1>
        <PromotionMetadataContainer>
          <MetadataBar
            createdDatetime={place.created_datetime}
            submitterName={submitterName}
            submitterAvatarUrl={place.submitter && place.submitter.avatar_url}
            numComments={comments.length}
            actionText={this.props.placeConfig.action_text}
          />
          <PromotionBar
            isHorizontalLayout={isStoryChapter}
            numSupports={supports.length}
            onSocialShare={service => Util.onSocialShare(place, service)}
            userSupport={supports.find(
              support => support.user_token === this.props.userToken,
            )}
            placeUrl={place.url}
            placeId={place.id}
            userToken={this.props.userToken}
          />
        </PromotionMetadataContainer>
        <div className="place-detail-view__clearfix" />
        {this.props.isEditModeToggled && isPlaceDetailEditable ? (
          <PlaceDetailEditor
            place={place}
            onRequestEnd={() => this.setState({ placeRequestType: null })}
            placeRequestType={this.state.placeRequestType}
            container={this.props.container}
            router={this.props.router}
          />
        ) : (
          fieldSummary
        )}
        <Survey
          placeUrl={place.url}
          placeId={place.id}
          datasetSlug={this.props.datasetSlug}
          currentUser={this.props.currentUser}
          isEditModeToggled={this.props.isEditModeToggled}
          isEditable={isPlaceDetailEditable}
          isSubmitting={this.state.isSurveyEditFormSubmitting}
          comments={comments}
          onMountTargetResponse={this.onMountTargetResponse.bind(this)}
          scrollToResponseId={this.props.scrollToResponseId}
          submitter={place.submitter}
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
  datasetSlug: PropTypes.string.isRequired,
  hasGroupAbilitiesInDatasets: PropTypes.func.isRequired,
  hasUserAbilitiesInPlace: PropTypes.func.isRequired,
  isEditModeToggled: PropTypes.bool.isRequired,
  isGeocodingBarEnabled: PropTypes.bool,
  mapConfig: PropTypes.shape({
    geocoding_bar_enabled: PropTypes.bool,
  }).isRequired,
  placeId: PropTypes.number.isRequired,
  placeSelector: PropTypes.func.isRequired,
  placeConfig: PropTypes.object.isRequired,
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
  placeSelector: placeId => placeSelector(state, placeId),
  commentFormConfig: commentFormConfigSelector(state),
  supportConfig: supportConfigSelector(state),
  placeConfig: placeConfigSelector(state),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(translate("PlaceDetail")(PlaceDetail));

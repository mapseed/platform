/** @jsx jsx */
import React, { Component } from "react";
import { findDOMNode } from "react-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { css, jsx } from "@emotion/core";
import styled from "@emotion/styled";
import getExtentFromGeometry from "turf-extent";
import WebMercatorViewport from "viewport-mercator-project";

import { LargeTitle } from "../atoms/typography";
import PromotionBar from "./promotion-bar";
import MetadataBar from "./metadata-bar";
import Survey from "./survey";
import EditorBar from "./editor-bar";
import TagBar from "../organisms/tag-bar";
import PlaceDetailEditor from "./place-detail-editor";

import FieldSummary from "./field-summary";

// Flavor custom code
import SnohomishFieldSummary from "./snohomish-field-summary";
import PalouseFieldSummary from "./palouse-field-summary";
import PBDurhamProjectProposalFieldSummary from "./pbdurham-project-proposal-field-summary";

import {
  appConfigSelector,
  appConfigPropType,
} from "../../state/ducks/app-config";
import {
  commentFormConfigPropType,
  commentFormConfigSelector,
} from "../../state/ducks/forms-config";
import { supportConfigSelector } from "../../state/ducks/support-config";
import { placeConfigSelector } from "../../state/ducks/place-config";
import {
  mapConfigSelector,
  mapConfigPropType,
} from "../../state/ducks/map-config";
import {
  userPropType,
  userSelector,
  hasUserAbilitiesInPlace,
  hasGroupAbilitiesInDatasets,
  hasAdminAbilities,
} from "../../state/ducks/user";
import {
  isEditModeToggled,
  layoutSelector,
  updateEditModeToggled,
  updateUIVisibility,
} from "../../state/ducks/ui";
import { placePropType, focusedPlaceSelector } from "../../state/ducks/places";
import {
  removeFocusedGeoJSONFeatures,
  updateFocusedGeoJSONFeatures,
  updateLayerGroupVisibility,
} from "../../state/ducks/map";
import { customComponentsConfigSelector } from "../../state/ducks/custom-components-config";

import { getCategoryConfig } from "../../utils/config-utils";
import Util from "../../js/utils.js";
import { jumpTo } from "../../utils/scroll-helpers";

import { translate } from "react-i18next";
import "./index.scss";

const PromotionMetadataContainer = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "24px",
});

const PlaceDetailContainer = styled("div")(props => ({
  marginTop: props.isEditable && props.layout === "desktop" ? "58px" : 0,
  paddingRight: props.layout === "desktop" ? "30px" : 0,
}));

class PlaceDetail extends Component {
  state = {
    isSurveyEditFormSubmitting: false,
    isPlaceDetailEditable: false,
    placeRequestType: null,
  };

  componentDidMount() {
    this.updateMapViewport();
    this.updateEditability();
    jumpTo({
      contentPanelInnerContainerRef: this.props.contentPanelInnerContainerRef,
      scrollPositon: 0,
      layout: this.props.layout,
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.focusedPlace.id !== prevProps.focusedPlace.id) {
      jumpTo({
        contentPanelInnerContainerRef: this.props.contentPanelInnerContainerRef,
        scrollPositon: 0,
        layout: this.props.layout,
      });
      this.updateMapViewport();
      this.updateEditability();
    }
  }

  updateEditability() {
    this.setState({
      isPlaceDetailEditable:
        this.props.hasUserAbilitiesInPlace({
          submitter: this.props.focusedPlace.submitter,
          isSubmitterEditingSupported: getCategoryConfig(
            this.props.placeConfig,
            this.props.focusedPlace.location_type,
          ).submitter_editing_supported,
        }) ||
        this.props.hasGroupAbilitiesInDatasets({
          abilities: ["update"],
          submissionSet: "places",
          datasetSlugs: [this.props.focusedPlace.datasetSlug],
        }),
    });
  }

  updateMapViewport() {
    const story = this.props.focusedPlace.story;
    if (story) {
      // Set layers for this story chapter.
      story.visibleLayerGroupIds.forEach(layerGroupId =>
        this.props.updateLayerGroupVisibility(layerGroupId, true),
      );
      // Hide all other layers.
      this.props.mapConfig.layerGroups
        .filter(
          layerGroup => !story.visibleLayerGroupIds.includes(layerGroup.id),
        )
        .forEach(layerGroup =>
          this.props.updateLayerGroupVisibility(layerGroup.id, false),
        );
    }

    if (story && story.panTo) {
      const newViewport = {
        latitude: story.panTo[1],
        longitude: story.panTo[0],
        transitionDuration: 3000,
      };
      if (story.zoom) {
        newViewport.zoom = story.zoom;
      }

      this.props.onUpdateMapViewport(newViewport);
    } else if (
      this.props.focusedPlace.geometry.type === "LineString" ||
      this.props.focusedPlace.geometry.type === "Polygon"
    ) {
      const extent = getExtentFromGeometry(this.props.focusedPlace.geometry);
      const newViewport = this.getWebMercatorViewport().fitBounds(
        // WebMercatorViewport wants bounds in [[lng, lat], [lng lat]] form.
        [[extent[0], extent[1]], [extent[2], extent[3]]],
        { padding: 50 },
      );

      this.props.onUpdateMapViewport({
        latitude: newViewport.latitude,
        longitude: newViewport.longitude,
        transitionDuration: story ? 3000 : 200,
        zoom: newViewport.zoom,
      });
    } else if (this.props.focusedPlace.geometry.type === "Point") {
      const newViewport = {
        latitude: this.props.focusedPlace.geometry.coordinates[1],
        longitude: this.props.focusedPlace.geometry.coordinates[0],
        transitionDuration: story ? 3000 : 200,
      };
      if (story && story.zoom) {
        newViewport.zoom = story.zoom;
      }

      this.props.onUpdateMapViewport(newViewport);
    }

    if (story && !story.spotlight) {
      this.props.updateSpotlightMaskVisibility(false);
    } else {
      this.props.updateSpotlightMaskVisibility(true);
    }

    // Focus this Place's feature on the map.
    const { geometry, ...rest } = this.props.focusedPlace;
    this.props.updateFocusedGeoJSONFeatures([
      {
        type: "Feature",
        geometry: {
          type: geometry.type,
          coordinates: geometry.coordinates,
        },
        properties: rest,
      },
    ]);
  }

  getWebMercatorViewport() {
    const containerDims = findDOMNode(
      this.props.mapContainerRef.current,
    ).getBoundingClientRect();

    return new WebMercatorViewport({
      width: containerDims.width,
      height: containerDims.height,
    });
  }

  onMountTargetResponse(responseRef) {
    requestAnimationFrame(() => {
      jumpTo({
        contentPanelInnerContainerRef: this.props.contentPanelInnerContainerRef,
        // TODO: Remove the magic number here.
        scrollPosition:
          findDOMNode(responseRef.current).getBoundingClientRect().top - 120,
        layout: this.props.layout,
      });
    });
  }

  setPlaceRequestType = requestType => {
    this.setState({
      placeRequestType: requestType,
    });
  };

  componentWillUnmount() {
    this.props.removeFocusedGeoJSONFeatures();
  }

  render() {
    const isStoryChapter = !!this.props.focusedPlace.story;
    const supports = this.props.focusedPlace.submission_sets.support;
    const comments = this.props.focusedPlace.submission_sets.comments;
    const categoryConfig = getCategoryConfig(
      this.props.placeConfig,
      this.props.focusedPlace.location_type,
    );
    const submitterName = this.props.focusedPlace.submitter
      ? this.props.focusedPlace.submitter.name
      : this.props.focusedPlace.submitter_name ||
        this.props.placeConfig.anonymous_name;
    const isTagBarEditable = this.props.hasGroupAbilitiesInDatasets({
      abilities: ["update", "destroy", "create"],
      submissionSet: "tags",
      datasetSlugs: [this.props.focusedPlace.datasetSlug],
    });

    // TODO: dissolve when flavor abstraction is ready
    let fieldSummary;
    if (
      this.props.customComponents.FieldSummary === "SnohomishFieldSummary" &&
      this.props.focusedPlace.location_type === "conservation-actions"
    ) {
      fieldSummary = (
        <SnohomishFieldSummary
          fields={categoryConfig.fields}
          place={this.props.focusedPlace}
        />
      );
    } else if (
      this.props.customComponents.FieldSummary === "PalouseFieldSummary" &&
      this.props.focusedPlace.location_type === "reports"
    ) {
      fieldSummary = (
        <PalouseFieldSummary
          fields={categoryConfig.fields}
          place={this.props.focusedPlace}
        />
      );
    } else if (
      this.props.customComponents.FieldSummary ===
        "PBDurhamProjectProposalFieldSummary" &&
      this.props.focusedPlace.location_type === "projects"
    ) {
      fieldSummary = (
        <PBDurhamProjectProposalFieldSummary
          fields={categoryConfig.fields}
          place={this.props.focusedPlace}
        />
      );
    } else {
      fieldSummary = (
        <FieldSummary
          fields={categoryConfig.fields}
          place={this.props.focusedPlace}
        />
      );
    }

    return (
      <PlaceDetailContainer
        isEditable={this.state.isPlaceDetailEditable || isTagBarEditable}
        layout={this.props.layout}
      >
        {(this.state.isPlaceDetailEditable || isTagBarEditable) && (
          <EditorBar
            isAdmin={this.props.hasAdminAbilities(
              this.props.focusedPlace.datasetSlug,
            )}
            isEditModeToggled={this.props.isEditModeToggled}
            isPlaceDetailEditable={this.state.isPlaceDetailEditable}
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
          placeTags={this.props.focusedPlace.tags}
          datasetSlug={this.props.focusedPlace.datasetSlug}
          placeUrl={this.props.focusedPlace.url}
          placeId={this.props.focusedPlace.id}
        />
        <LargeTitle
          css={css`
            margin-top: 0;
          `}
        >
          {this.props.focusedPlace.title}
        </LargeTitle>
        <PromotionMetadataContainer>
          <MetadataBar
            createdDatetime={this.props.focusedPlace.created_datetime}
            submitterName={submitterName}
            submitterAvatarUrl={
              this.props.focusedPlace.submitter
                ? this.props.focusedPlace.submitter.avatar_url
                : undefined
            }
            numComments={comments.length}
            actionText={this.props.placeConfig.action_text}
          />
          <PromotionBar
            isHorizontalLayout={isStoryChapter}
            numSupports={supports.length}
            onSocialShare={service =>
              Util.onSocialShare({
                place: this.props.focusedPlace,
                service,
                appConfig: this.props.appConfig,
              })
            }
            userSupport={supports.find(
              support => support.user_token === this.props.currentUser.token,
            )}
            placeUrl={this.props.focusedPlace.url}
            placeId={this.props.focusedPlace.id}
            userToken={this.props.currentUser.token}
          />
        </PromotionMetadataContainer>
        <div className="place-detail-view__clearfix" />
        {this.props.isEditModeToggled && this.state.isPlaceDetailEditable ? (
          <PlaceDetailEditor
            place={this.props.focusedPlace}
            onRequestEnd={() => this.setState({ placeRequestType: null })}
            placeRequestType={this.state.placeRequestType}
            setPlaceRequestType={this.setPlaceRequestType}
            contentPanelInnerContainerRef={
              this.props.contentPanelInnerContainerRef
            }
          />
        ) : (
          fieldSummary
        )}
        <Survey
          placeUrl={this.props.focusedPlace.url}
          placeId={this.props.focusedPlace.id}
          datasetSlug={this.props.focusedPlace.datasetSlug}
          currentUser={this.props.currentUser}
          isEditModeToggled={this.props.isEditModeToggled}
          isEditable={this.state.isPlaceDetailEditable}
          isSubmitting={this.state.isSurveyEditFormSubmitting}
          comments={comments}
          onMountTargetResponse={this.onMountTargetResponse.bind(this)}
          submitter={this.props.focusedPlace.submitter}
          userToken={this.props.currentUser.token}
        />
      </PlaceDetailContainer>
    );
  }
}

PlaceDetail.propTypes = {
  appConfig: appConfigPropType,
  container: PropTypes.instanceOf(HTMLElement),
  contentPanelInnerContainerRef: PropTypes.object.isRequired,
  currentUser: userPropType,
  customComponents: PropTypes.object.isRequired,
  focusedPlace: placePropType,
  hasAdminAbilities: PropTypes.func.isRequired,
  hasGroupAbilitiesInDatasets: PropTypes.func.isRequired,
  hasUserAbilitiesInPlace: PropTypes.func.isRequired,
  isEditModeToggled: PropTypes.bool.isRequired,
  isGeocodingBarEnabled: PropTypes.bool,
  layout: PropTypes.string.isRequired,
  mapConfig: mapConfigPropType,
  mapContainerRef: PropTypes.object.isRequired,
  placeConfig: PropTypes.object.isRequired,
  removeFocusedGeoJSONFeatures: PropTypes.func.isRequired,
  supportConfig: PropTypes.object.isRequired,
  commentFormConfig: commentFormConfigPropType.isRequired,
  t: PropTypes.func.isRequired,
  updateEditModeToggled: PropTypes.func.isRequired,
  updateFocusedGeoJSONFeatures: PropTypes.func.isRequired,
  updateLayerGroupVisibility: PropTypes.func.isRequired,
  updateSpotlightMaskVisibility: PropTypes.func.isRequired,
  onUpdateMapViewport: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  removeFocusedGeoJSONFeatures: () => dispatch(removeFocusedGeoJSONFeatures()),
  updateEditModeToggled: isToggled =>
    dispatch(updateEditModeToggled(isToggled)),
  updateSpotlightMaskVisibility: isVisible =>
    dispatch(updateUIVisibility("spotlightMask", isVisible)),
  updateFocusedGeoJSONFeatures: newFeatures =>
    dispatch(updateFocusedGeoJSONFeatures(newFeatures)),
  updateLayerGroupVisibility: (layerGroupId, isVisible) =>
    dispatch(updateLayerGroupVisibility(layerGroupId, isVisible)),
});

const mapStateToProps = state => ({
  appConfig: appConfigSelector(state),
  currentUser: userSelector(state),
  customComponents: customComponentsConfigSelector(state),
  focusedPlace: focusedPlaceSelector(state),
  hasAdminAbilities: datasetSlug => hasAdminAbilities(state, datasetSlug),
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
  layout: layoutSelector(state),
  mapConfig: mapConfigSelector(state),
  commentFormConfig: commentFormConfigSelector(state),
  supportConfig: supportConfigSelector(state),
  placeConfig: placeConfigSelector(state),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(translate("PlaceDetail")(PlaceDetail));

/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";
import { findDOMNode } from "react-dom";
import { connect } from "react-redux";
import styled from "@emotion/styled";
import getExtentFromGeometry from "turf-extent";
import WebMercatorViewport from "viewport-mercator-project";

import { LargeTitle } from "../atoms/typography";
import PromotionBar from "../molecules/promotion-bar";
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
import KittitasFireReadyFieldSummary from "./kittitas-fire-ready-field-summary";

import { appConfigSelector, AppConfig } from "../../state/ducks/app-config";
import {
  CommentFormConfig,
  commentFormConfigSelector,
} from "../../state/ducks/forms-config";
import {
  supportConfigSelector,
  SupportConfig,
} from "../../state/ducks/support-config";
import {
  placeConfigSelector,
  PlaceConfig,
} from "../../state/ducks/place-config";
import {
  featuredPlacesSelector,
  FeaturedPlace,
} from "../../state/ducks/featured-places-config";
import {
  userSelector,
  hasUserAbilitiesInPlace,
  hasGroupAbilitiesInDatasets,
  hasAdminAbilities,
  User,
} from "../../state/ducks/user";
import {
  isEditModeToggled,
  layoutSelector,
  updateEditModeToggled,
  updateSpotlightMaskVisibility,
  Layout,
} from "../../state/ducks/ui";
import { focusedPlaceSelector, Place } from "../../state/ducks/places";
import {
  removeFocusedGeoJSONFeatures,
  updateFocusedGeoJSONFeatures,
  updateLayerGroupVisibility,
  layerGroupsSelector,
  LayerGroups,
} from "../../state/ducks/map-style";
import {
  customComponentsConfigSelector,
  CustomComponentsConfig,
} from "../../state/ducks/custom-components-config";

import { getCategoryConfig } from "../../utils/config-utils";
import Util from "../../js/utils.js";
import { jumpTo } from "../../utils/scroll-helpers";

import { withTranslation, WithTranslation } from "react-i18next";
import "./index.scss";
import eventEmitter from "../../utils/event-emitter";
import { MapViewportDiff } from "../../state/ducks/map";

const PromotionMetadataContainer = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "24px",
});

type OwnProps = {
  contentPanelInnerContainerRef: React.RefObject<HTMLDivElement>;
  mapContainerRef: React.RefObject<HTMLElement>;
  isGeocodingBarEnabled: boolean; // TODO: where are we getting this prop?
};

type StateProps = {
  appConfig: AppConfig;
  currentUser: User;
  customComponents: CustomComponentsConfig;
  focusedPlace: Place;
  featuredPlaces: FeaturedPlace[];
  hasAdminAbilities: Function;
  hasGroupAbilitiesInDatasets: Function;
  hasUserAbilitiesInPlace: Function;
  isEditModeToggled: boolean;
  layerGroups: LayerGroups;
  layout: Layout;
  commentFormConfig: CommentFormConfig;
  supportConfig: SupportConfig;
  placeConfig: PlaceConfig;
};

type Props = {
  removeFocusedGeoJSONFeatures: Function;
  updateEditModeToggled: Function;
  updateFocusedGeoJSONFeatures: typeof updateFocusedGeoJSONFeatures;
  updateLayerGroupVisibility: Function;
  updateSpotlightMaskVisibility: typeof updateSpotlightMaskVisibility;
} & OwnProps &
  StateProps &
  WithTranslation;

type State = {
  isSurveyEditFormSubmitting: boolean;
  isPlaceDetailEditable: boolean;
  placeRequestType: string | null;
};

class PlaceDetail extends React.Component<Props, State> {
  state: State = {
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
    const featuredPlace = this.props.featuredPlaces.find(featuredPlace => {
      return featuredPlace.placeId === this.props.focusedPlace.id;
    });
    if (featuredPlace && featuredPlace.visibleLayerGroupIds) {
      // Set layers for this story chapter.
      featuredPlace.visibleLayerGroupIds.forEach(layerGroupId =>
        this.props.updateLayerGroupVisibility(layerGroupId, true),
      );
      // Hide all other layers.
      this.props.layerGroups.allIds
        .filter(
          layerGroupId =>
            !featuredPlace.visibleLayerGroupIds!.includes(layerGroupId),
        )
        .forEach(layerGroupId =>
          this.props.updateLayerGroupVisibility(layerGroupId, false),
        );
    }

    if (featuredPlace && featuredPlace.panTo) {
      const newViewport: MapViewportDiff = {
        latitude: featuredPlace.panTo[1],
        longitude: featuredPlace.panTo[0],
        transitionDuration: 3000,
      };
      if (featuredPlace.zoom) {
        newViewport.zoom = featuredPlace.zoom;
      }

      eventEmitter.emit("setMapViewport", newViewport);
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

      eventEmitter.emit("setMapViewport", {
        latitude: newViewport.latitude,
        longitude: newViewport.longitude,
        transitionDuration: featuredPlace ? 3000 : 200,
        zoom: newViewport.zoom,
      });
    } else if (this.props.focusedPlace.geometry.type === "Point") {
      const newViewport: MapViewportDiff = {
        latitude: this.props.focusedPlace.geometry.coordinates[1],
        longitude: this.props.focusedPlace.geometry.coordinates[0],
        transitionDuration: featuredPlace ? 3000 : 200,
      };
      if (featuredPlace && featuredPlace.zoom) {
        newViewport.zoom = featuredPlace.zoom;
      }

      eventEmitter.emit("setMapViewport", newViewport);
    }

    if (featuredPlace && !featuredPlace.spotlight) {
      this.props.updateSpotlightMaskVisibility(false);
    } else {
      this.props.updateSpotlightMaskVisibility(true);
    }

    // Focus this Place's feature on the map.
    const { geometry, ...rest } = this.props.focusedPlace;
    this.props.updateFocusedGeoJSONFeatures([
      {
        type: "Feature",
        geometry,
        // Note: I *think* the above should be equivalent this existing code:
        // geometry: {
        //   type,
        //   coordinates,
        // },
        properties: rest,
      },
    ]);
  }

  getWebMercatorViewport() {
    const node = findDOMNode(this.props.mapContainerRef.current);
    if (node instanceof Element) {
      const containerDims = node.getBoundingClientRect();

      return new WebMercatorViewport({
        width: containerDims.width,
        height: containerDims.height,
      });
    } else {
      throw new Error(
        "PlaceDetail.getWebMercatorViewport: could not find map container ref",
      );
    }
  }

  onMountTargetResponse(responseRef) {
    requestAnimationFrame(() => {
      const node = findDOMNode(responseRef.current);
      if (node instanceof Element) {
        jumpTo({
          contentPanelInnerContainerRef: this.props
            .contentPanelInnerContainerRef,
          // TODO: Remove the magic number here.
          scrollPosition: node.getBoundingClientRect().top - 120,
          layout: this.props.layout,
        });
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          "PlaceDetail.getWebMercatorViewport: could not find response ref",
        );
      }
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
    const isStoryChapter = !!this.props.focusedPlace.story; // Can we deprecate this?
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
      this.props.customComponents.FieldSummary ===
      "KittitasFireReadyFieldSummary"
    ) {
      fieldSummary = (
        <KittitasFireReadyFieldSummary
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
      ["projects", "cycle1-projects"].includes(
        this.props.focusedPlace.location_type,
      )
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
      <div
        css={{
          marginTop:
            (this.state.isPlaceDetailEditable || isTagBarEditable) &&
            this.props.layout === "desktop"
              ? "58px"
              : 0,
        }}
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
              this.props.focusedPlace.submitter &&
              this.props.focusedPlace.submitter.avatar_url
                ? this.props.focusedPlace.submitter.avatar_url
                : undefined
            }
            numComments={comments.length}
            actionText={this.props.placeConfig.action_text}
          />
          <PromotionBar
            appConfig={this.props.appConfig}
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
            currentUser={this.props.currentUser}
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
        />
      </div>
    );
  }
}

const mapDispatchToProps = {
  removeFocusedGeoJSONFeatures,
  updateEditModeToggled,
  updateSpotlightMaskVisibility,
  updateFocusedGeoJSONFeatures,
  updateLayerGroupVisibility,
};

const mapStateToProps = (state: any, ownProps: OwnProps): StateProps => ({
  appConfig: appConfigSelector(state),
  currentUser: userSelector(state),
  customComponents: customComponentsConfigSelector(state),
  focusedPlace: focusedPlaceSelector(state),
  featuredPlaces: featuredPlacesSelector(state),
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
  layerGroups: layerGroupsSelector(state),
  layout: layoutSelector(state),
  commentFormConfig: commentFormConfigSelector(state),
  supportConfig: supportConfigSelector(state),
  placeConfig: placeConfigSelector(state),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation("PlaceDetail")(PlaceDetail));

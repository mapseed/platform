import React, { Component, createRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import styled from "react-emotion";

import MainMap from "../organisms/main-map";
import ContentPanel from "../organisms/content-panel";
import AddPlaceButton from "../molecules/add-place-button";
import MapCenterpoint from "../molecules/map-centerpoint";
import LeftSidebar from "../organisms/left-sidebar";

import {
  addPlaceButtonVisibilitySelector,
  uiVisibilitySelector,
} from "../../state/ducks/ui";
import {
  hasAnonAbilitiesInAnyDataset,
  datasetSlugsSelector,
} from "../../state/ducks/datasets-config";
import {
  placeConfigPropType,
  placeConfigSelector,
} from "../../state/ducks/place-config";
import { hasGroupAbilitiesInDatasets } from "../../state/ducks/user";
import { isLeftSidebarExpandedSelector } from "../../state/ducks/left-sidebar";

import mq from "../../../../media-queries";

const MapContainer = styled("div")(props => ({
  position: "relative",

  [mq[1]]: {
    height: "100%",
    width: props.isContentPanelVisible ? "60%" : "100%",
  },
}));

const SpotlightMask = styled("div")({
  pointerEvents: "none",
  position: "absolute",
  left: "calc(50% - 100px)",
  top: "calc(50% - 100px)",
  width: "200px",
  height: "200px",
  borderRadius: "50%",
  boxShadow:
    "0px 0px 0px 800px rgba(0, 0, 0, 0.4), inset 0px 0px 20px 30px rgba(0, 0, 0, 0.4)",
  zIndex: 8,
});

class MapTemplate extends Component {
  mapContainerRef = createRef();

  render() {
    return (
      <>
        <MapContainer
          ref={this.mapContainerRef}
          isContentPanelVisible={this.props.isContentPanelVisible}
        >
          {this.props.isLeftSidebarExpanded && <LeftSidebar />}
          {this.props.isAddPlaceButtonVisible &&
            this.props.hasAddPlacePermission && (
              <AddPlaceButton
                onClick={() => {
                  this.props.router.navigate("/new", {
                    trigger: true,
                  });
                }}
              >
                {this.props.placeConfig.add_button_label}
              </AddPlaceButton>
            )}
          <MainMap
            mapContainerRef={this.mapContainerRef}
            router={this.props.router}
          />
          {this.props.isMapCenterpointVisible && <MapCenterpoint />}
          {this.props.isSpotlightMaskVisible && <SpotlightMask />}
        </MapContainer>
        {this.props.isContentPanelVisible && (
          <ContentPanel
            router={this.props.router}
            languageCode={this.props.languageCode}
            mapContainerRef={this.mapContainerRef}
          />
        )}
      </>
    );
  }
}

MapTemplate.propTypes = {
  hasAddPlacePermission: PropTypes.bool.isRequired,
  isAddPlaceButtonVisible: PropTypes.bool.isRequired,
  isContentPanelVisible: PropTypes.bool.isRequired,
  isLeftSidebarExpanded: PropTypes.bool.isRequired,
  isMapCenterpointVisible: PropTypes.bool.isRequired,
  isSpotlightMaskVisible: PropTypes.bool.isRequired,
  languageCode: PropTypes.string.isRequired,
  placeConfig: placeConfigPropType.isRequired,
  router: PropTypes.instanceOf(Backbone.Router),
};

const mapStateToProps = state => ({
  hasAddPlacePermission:
    hasAnonAbilitiesInAnyDataset({
      state: state,
      submissionSet: "places",
      abilities: ["create"],
    }) ||
    hasGroupAbilitiesInDatasets({
      state: state,
      submissionSet: "places",
      abilities: ["create"],
      datasetSlugs: datasetSlugsSelector(state),
    }),
  isAddPlaceButtonVisible: addPlaceButtonVisibilitySelector(state),
  isContentPanelVisible: uiVisibilitySelector("contentPanel", state),
  isLeftSidebarExpanded: isLeftSidebarExpandedSelector(state),
  isMapCenterpointVisible: uiVisibilitySelector("mapCenterpoint", state),
  isSpotlightMaskVisible: uiVisibilitySelector("spotlightMask", state),
  placeConfig: placeConfigSelector(state),
});

export default connect(mapStateToProps)(MapTemplate);

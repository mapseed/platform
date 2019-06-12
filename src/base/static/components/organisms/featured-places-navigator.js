import React, { useState, useEffect } from "react";

import PropTypes from "prop-types";
import { connect } from "react-redux";
import styled from "@emotion/styled";
import { withRouter } from "react-router-dom";

import {
  featuredPlacesConfigSelector,
  featuredPlacesConfigPropType,
} from "../../state/ducks/featured-places-config";
import { placeConfigSelector } from "../../state/ducks/place-config";
import { placesPropType } from "../../state/ducks/places";
import { uiVisibilitySelector, updateUIVisibility } from "../../state/ducks/ui";

import FeaturedPlace from "../molecules/featured-place";
import { TinyTitle, Paragraph } from "../atoms/typography";

import "./story-navigator.scss";

const FeaturedPlaceTitle = styled(TinyTitle)({
  margin: "0 0 8px 0",
  paddingLeft: "10px",
});

const FeaturedPlacesNavigator = props => {
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  useEffect(() => {
    const placeId = parseInt(props.history.location.pathname.split("/")[2]);
    if (placeId) {
      setCurrentPlaceId(placeId);
    }
    const unlisten = props.history.listen(location => {
      const placeId = parseInt(location.pathname.split("/")[2]);
      if (placeId) {
        setCurrentPlaceId(placeId);
      }
    });

    return unlisten;
  });

  return (
    <div className="story-navigator">
      {props.featuredPlacesConfig.header && (
        <FeaturedPlaceTitle>
          {props.featuredPlacesConfig.header}
        </FeaturedPlaceTitle>
      )}
      {props.featuredPlacesConfig.description && (
        <Paragraph className="story-navigator__description">
          {props.featuredPlacesConfig.description}
        </Paragraph>
      )}
      <hr />
      {props.featuredPlacesConfig.places
        .map(featuredPlace => {
          const place = props.places.find(
            place => place.id === featuredPlace.placeId,
          );
          return {
            featuredPlace,
            place,
            iconUrl:
              featuredPlace.iconUrl ||
              (
                props.placeConfig.place_detail.find(
                  config => config.category === place.location_type,
                ) || {}
              ).icon_url,
          };
        })
        .filter(({ place, iconUrl }) => !!place && !!iconUrl)
        .map(({ place, featuredPlace, iconUrl }) => {
          return (
            <FeaturedPlace
              key={featuredPlace.placeId}
              title={place.title}
              iconUrl={iconUrl}
              isSelected={currentPlaceId === featuredPlace.placeId}
              placeUrl={`${place.clientSlug}/${featuredPlace.placeId}`}
            />
          );
        })}
    </div>
  );
};

FeaturedPlacesNavigator.propTypes = {
  history: PropTypes.object.isRequired,
  isRightSidebarVisible: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired,
  featuredPlacesConfig: featuredPlacesConfigPropType,
  placeConfig: PropTypes.shape({
    place_detail: PropTypes.array.isRequired,
  }).isRequired,
  places: placesPropType.isRequired,
  updateUIVisibility: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isRightSidebarVisible: uiVisibilitySelector("rightSidebar", state),
  featuredPlacesConfig: featuredPlacesConfigSelector(state),
  placeConfig: placeConfigSelector(state),
});

const mapDispatchToProps = dispatch => ({
  updateUIVisibility: (componentName, isVisible) =>
    dispatch(updateUIVisibility(componentName, isVisible)),
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(FeaturedPlacesNavigator),
);

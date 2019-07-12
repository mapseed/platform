/** @jsx jsx */
import * as React from "react";

import { jsx } from "@emotion/core";
import { connect } from "react-redux";
import { withRouter, RouteComponentProps } from "react-router-dom";

import {
  featuredPlacesConfigSelector,
  FeaturedPlacesConfig,
} from "../../state/ducks/featured-places-config";
import {
  placeConfigSelector,
  PlaceConfig,
} from "../../state/ducks/place-config";
import { Place } from "../../state/ducks/places";

import FeaturedPlace from "../molecules/featured-place";
import { TinyTitle, Paragraph } from "../atoms/typography";

type StateProps = {
  featuredPlacesConfig: FeaturedPlacesConfig;
  placeConfig: PlaceConfig;
};
type Props = {
  places: Place[];
} & StateProps &
  RouteComponentProps<{}>;

const FeaturedPlacesNavigator: React.FunctionComponent<Props> = props => {
  const [currentPlaceId, setCurrentPlaceId] = React.useState<number | null>(
    null,
  );
  React.useEffect(() => {
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
    <div
      css={{
        height: "100%",
        paddingTop: "15px",
      }}
    >
      {props.featuredPlacesConfig.header && (
        <TinyTitle
          css={{
            margin: "0 0 8px 0",
            paddingLeft: "10px",
          }}
        >
          {props.featuredPlacesConfig.header}
        </TinyTitle>
      )}
      {props.featuredPlacesConfig.description && (
        <Paragraph
          css={{
            padding: "0 10px 0 10px",
            fontStyle: "italic",
          }}
        >
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
              ((props.placeConfig.place_detail.find(
                config =>
                  config.category === ((place || {}) as Place).location_type,
              ) || {}) as any).icon_url,
          };
        })
        .filter(({ featuredPlace, place, iconUrl }) => !!place && !!iconUrl)
        .map(({ place, featuredPlace, iconUrl }) => {
          return (
            <FeaturedPlace
              key={featuredPlace.placeId}
              title={place!.title}
              iconUrl={iconUrl}
              isSelected={currentPlaceId === featuredPlace.placeId}
              placeUrl={`${place!.clientSlug}/${featuredPlace.placeId}`}
            />
          );
        })}
    </div>
  );
};

const mapStateToProps = (state): StateProps => ({
  featuredPlacesConfig: featuredPlacesConfigSelector(state),
  placeConfig: placeConfigSelector(state),
});

export default withRouter(
  connect<StateProps>(mapStateToProps)(FeaturedPlacesNavigator),
);

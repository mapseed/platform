/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import { withTheme, WithTheme } from "emotion-theming";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withTranslation, WithTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemText from "@material-ui/core/ListItemText";

import mq from "../../../../media-queries";
import {
  featuredPlacesConfigSelector,
  FeaturedPlacesConfig,
} from "../../state/ducks/featured-places-config";
import { placesSelector, Place } from "../../state/ducks/places";
import { Image } from "../atoms/imagery";

type OwnProps = {
  label: string;
};

type StateProps = {
  featuredPlacesConfig: FeaturedPlacesConfig;
  places: Place[];
};

type PlaceFilterMenuProps = OwnProps &
  StateProps &
  OwnProps &
  WithTranslation &
  WithTheme;

const FeaturedPlacesMenu: React.FunctionComponent<PlaceFilterMenuProps> = props => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div
      css={css`
        ${[mq[0]]} {
          text-align: center;
        }
        ${[mq[1]]} {
          padding-left: 12px;
          border-left: ${props.position > 0
            ? "solid 1px " + props.theme.text.tertiary
            : "none"};
        }
      `}
    >
      <Button
        className="mapseed-featured-places-header-menu__button"
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        {props.title}
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {props.featuredPlacesConfig.places
          .filter(({ renderIn }) => renderIn === "FeaturedPlacesMenu")
          .map(({ iconUrl, placeId }) => {
            const place =
              props.places.find(place => place.id === placeId) || {};

            return (
              <MenuItem key={placeId} onClick={handleClose}>
                <Link
                  css={css`
                    display: flex;
                    align-items: center;
                    text-transform: none;
                    text-decoration: none;
                    color: ${props.theme.brand.primary};
                  `}
                  to={`/${place.clientSlug}/${placeId}`}
                >
                  {iconUrl && (
                    <Image
                      css={css`
                        width: 20px;
                        max-width: 20px;
                        min-width: 20px;
                        height: auto;
                        margin-right: 12px;
                      `}
                      src={iconUrl}
                      alt={"Featured Place marker"}
                    />
                  )}
                  <ListItemText primary={place.title} />
                </Link>
              </MenuItem>
            );
          })}
      </Menu>
    </div>
  );
};

const mapStateToProps = (state): StateProps => ({
  featuredPlacesConfig: featuredPlacesConfigSelector(state),
  places: placesSelector(state),
});

export default connect<StateProps, DispatchProps>(mapStateToProps)(
  withTheme(withTranslation("FeaturedPlacesMenu")(FeaturedPlacesMenu)),
);

/** @jsx jsx */
import * as React from "react";
import Spinner from "react-spinner";
import { connect } from "react-redux";
import { translate } from "react-i18next";
import i18next, { TranslationFunction } from "i18next";
import { css, jsx } from "@emotion/core";

import eventEmitter from "../../../utils/event-emitter";

import {
  mapConfigSelector,
  mapConfigPropType,
  mapViewportSelector,
  MapViewport,
} from "../../../state/ducks/map";
import { TextInput } from "../../atoms/input";
import { Button } from "../../atoms/buttons";
import { FontAwesomeIcon } from "../../atoms/imagery";

// TODO: Consolidate Util methods used here.
import Util from "../../../js/utils.js";

type OwnProps = {
  formId: string;
  name: string;
  onChange: Function;
  onKeyDown?: Function;
  placeholder?: string;
  isTriggeringGeocode: boolean;
  value: string;
};

type StateProps = {
  mapViewport: MapViewport;
  mapConfig: mapConfigPropType;
};

// Types were added to react-i18next is a newer version.
// TODO: Use supplied types when we upgrade i18next deps.
// See: https://github.com/i18next/react-i18next/pull/557/files
type TransProps = {
  i18nKey?: string;
  count?: number;
  parent?: React.ReactNode;
  i18n?: i18next.i18n;
  t?: TranslationFunction;
  defaults?: string;
  values?: {};
  components?: React.ReactNode[];
};

type Props = OwnProps & StateProps & TransProps;

const GEOCODING_ENGINE = "Mapbox";

const GeocodingField: React.FunctionComponent<Props> = props => {
  const [isGeocoding, setIsGeocoding] = React.useState(false);
  const [isWithGeocodingError, setIsWithGeocodingError] = React.useState(false);

  const doGeocode = React.useCallback(
    () => {
      setIsGeocoding(true);
      setIsWithGeocodingError(false);

      Util[GEOCODING_ENGINE].geocode({
        location: props.value,
        hint: props.mapConfig.geocodeHint,
        bbox: props.mapConfig.geocodeBoundingBox,
        options: {
          success: data => {
            const locationGeometry =
              data.features && data.features[0] && data.features[0].geometry;
            if (locationGeometry) {
              setIsGeocoding(false);
              setIsWithGeocodingError(false);

              eventEmitter.emit("setMapViewport", {
                latitude: locationGeometry.coordinates[1],
                longitude: locationGeometry.coordinates[0],
                zoom: 14,
                transitionDuration: 1000,
              });
            } else {
              setIsGeocoding(false);
              setIsWithGeocodingError(true);
            }
          },
          error: err => {
            setIsGeocoding(false);
            setIsWithGeocodingError(true);

            // eslint-disable-next-line no-console
            console.error("There was an error while geocoding: ", err);
          },
        },
      });
    },
    [props.value],
  );

  // Reverse geocode on map viewport change.
  React.useEffect(
    () => {
      setIsGeocoding(true);

      Util[GEOCODING_ENGINE].reverseGeocode(
        {
          lat: props.mapViewport.latitude,
          lng: props.mapViewport.longitude,
        },
        {
          success: data => {
            const placeName =
              // eslint-ignore-next-line camelcase
              data.features && data.features[0] && data.features[0].place_name;

            if (placeName) {
              setIsGeocoding(false);
              setIsWithGeocodingError(false);
              props.onChange(props.name, placeName);
            } else {
              setIsGeocoding(false);
              setIsWithGeocodingError(true);
            }
          },
          error: err => {
            setIsGeocoding(false);
            setIsWithGeocodingError(true);

            // eslint-disable-next-line no-console
            console.error("There was an error while revers geocoding: ", err);
          },
        },
      );
    },
    [props.mapViewport],
  );

  React.useEffect(
    () => {
      if (props.isTriggeringGeocode) {
        doGeocode();
      }
    },
    [props.isTriggeringGeocode],
  );

  React.useEffect(
    () => {
      if (isWithGeocodingError) {
        setTimeout(() => {
          setIsWithGeocodingError(false);
        }, 5000);
      }
    },
    [isWithGeocodingError],
  );

  return (
    <div
      css={css`
        position: relative;
      `}
    >
      {isGeocoding && (
        <Spinner style={{ left: "20px", width: "30px", height: "30px" }} />
      )}
      {!isGeocoding && (
        <Button
          css={css`
            position: absolute;
            padding: 0;
            cursor: pointer;
            left: 12px;
            top: 5px;
            font-size: 20px;
            margin-top: 4px;
            background: none;
          `}
          onClick={doGeocode}
        >
          <FontAwesomeIcon
            color="#888"
            hoverColor="#aaa"
            faClassname="fas fa-search"
          />
        </Button>
      )}
      <TextInput
        css={css`
          padding-left: 35px;
          width: 100%;
          box-sizing: border-box;
        `}
        name={props.name}
        ariaLabel="Search by address"
        placeholder={props.t(
          `geocodingFieldPlaceholder${props.formId}${props.name}`,
          props.placeholder,
        )}
        value={props.value}
        onBlur={doGeocode}
        onKeyDown={e => props.onKeyDown && props.onKeyDown(e)}
        onChange={e => props.onChange(e.target.name, e.target.value)}
      />
      <div
        css={css`
          opacity: ${isWithGeocodingError ? 1 : 0};
          position: absolute;
          top: 3em;
          right: 0.5em;
          bottom: auto;
          left: 0.5em;
          background-color: #bf6083;
          color: #fff;
          margin: 0;
          padding: 0.25em 0.5em;
          box-shadow: 2px 2px 0 #bf6083, 2px -2px 0 #bf6083, -2px 2px 0 #bf6083,
            -2px -2px 0 #bf6083;
          z-index: 14;
          transition: opacity 0.5s ease;
          box-sizing: border-box;
          pointer-events: none;
        `}
      >
        {props.t("locationNotFoundError")}
      </div>
    </div>
  );
};

GeocodingField.defaultProps = {
  // In case the GeocodingField is used outside the input form, e.g. in the
  // GeocodeAddressBar:
  formId: "noForm",
};

const mapStateToProps = (state): any => ({
  mapViewport: mapViewportSelector(state),
  mapConfig: mapConfigSelector(state),
});

export default connect<StateProps>(mapStateToProps)(
  translate("GeocodingField")(GeocodingField),
);

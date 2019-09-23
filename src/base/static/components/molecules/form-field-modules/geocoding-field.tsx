/** @jsx jsx */
import * as React from "react";
import { connect } from "react-redux";
import { withTranslation, WithTranslation } from "react-i18next";
import { css, jsx } from "@emotion/core";

import eventEmitter from "../../../utils/event-emitter";

import {
  isMapDraggingOrZooming,
  mapConfigSelector,
  mapViewportSelector,
  MapConfig,
  MapViewport,
} from "../../../state/ducks/map";
import { TextInput } from "../../atoms/input";
import { Button } from "../../atoms/buttons";
import { FontAwesomeIcon, LoadingBar } from "../../atoms/imagery";

declare const MAP_PROVIDER_TOKEN: string;

type OwnProps = {
  formId: string;
  name: string;
  onChange: Function;
  onKeyDown?: Function;
  placeholder?: string;
  isTriggeringGeocode: boolean;
  value: string;
  reverseGeocode: boolean;
};

type StateProps = {
  mapViewport: MapViewport;
  mapConfig: MapConfig;
  isMapDraggingOrZooming: boolean;
};

type Props = OwnProps & StateProps & WithTranslation;

const GeocodingField: React.FunctionComponent<Props> = ({
  mapConfig: { geocodeBoundingBox, geocodeHint },
  mapViewport,
  isTriggeringGeocode,
  value,
  name,
  onChange,
  onKeyDown,
  placeholder,
  formId,
  t,
  isMapDraggingOrZooming,
  reverseGeocode,
}) => {
  const [isGeocoding, setIsGeocoding] = React.useState<boolean>(false);
  const [isWithGeocodingError, setIsWithGeocodingError] = React.useState<
    boolean
  >(false);
  const isMounted = React.useRef<boolean>(true);

  const doGeocode = React.useCallback(() => {
    setIsGeocoding(true);
    setIsWithGeocodingError(false);

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      value,
    )}.json?access_token=${MAP_PROVIDER_TOKEN}${
      geocodeHint ? "&proximity=" + geocodeHint.join(",") : ""
    }${geocodeBoundingBox ? "&bbox=" + geocodeBoundingBox.join(",") : ""}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const locationGeometry =
          data.features && data.features[0] && data.features[0].geometry;

        if (locationGeometry) {
          // Don't set internal state if this component has unmounted at
          // callback time (which can happen in a multi-stage form usage, for
          // example).
          isMounted.current && setIsGeocoding(false);
          isMounted.current && setIsWithGeocodingError(false);

          // But *do* complete the map transition to the geocoded location.
          eventEmitter.emit("setMapViewport", {
            latitude: locationGeometry.coordinates[1],
            longitude: locationGeometry.coordinates[0],
            zoom: 14,
            transitionDuration: 1000,
          });
        } else if (isMounted.current) {
          setIsGeocoding(false);
          setIsWithGeocodingError(true);
        }
      })
      .catch(err => {
        if (isMounted.current) {
          setIsGeocoding(false);
          setIsWithGeocodingError(true);
        }

        // eslint-disable-next-line no-console
        console.error("There was an error while geocoding: ", err);
      });
  }, [value, geocodeBoundingBox, geocodeHint]);

  // Reverse geocode on map viewport change.
  React.useEffect(() => {
    // Only reverse geocode when the map has come to rest.
    if (!reverseGeocode || isMapDraggingOrZooming) {
      return;
    }

    setIsGeocoding(true);

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${mapViewport.longitude},${mapViewport.latitude}.json?access_token=${MAP_PROVIDER_TOKEN}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const placeName =
          // eslint-disable-next-line @typescript-eslint/camelcase
          data.features && data.features[0] && data.features[0].place_name;

        if (placeName && isMounted.current) {
          setIsGeocoding(false);
          setIsWithGeocodingError(false);
          onChange(name, placeName);
        } else if (isMounted.current) {
          setIsGeocoding(false);
          setIsWithGeocodingError(true);
        }
      })
      .catch(err => {
        if (isMounted.current) {
          setIsGeocoding(false);
          setIsWithGeocodingError(true);
        }

        // eslint-disable-next-line no-console
        console.error("There was an error while reverse geocoding: ", err);
      });
  }, [mapViewport, isMapDraggingOrZooming]);

  React.useEffect(() => {
    if (isTriggeringGeocode) {
      doGeocode();
    }
  }, [isTriggeringGeocode, doGeocode]);

  React.useEffect(() => {
    if (isWithGeocodingError) {
      setTimeout(() => {
        setIsWithGeocodingError(false);
      }, 5000);
    }
  }, [isWithGeocodingError]);

  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <div
      css={css`
        position: relative;
      `}
    >
      {isGeocoding && <LoadingBar />}
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

          &:hover {
            background: none;
          }
        `}
        onClick={doGeocode}
      >
        <FontAwesomeIcon
          color={isGeocoding ? "#ddd" : "#888"}
          hoverColor="#aaa"
          faClassname="fas fa-search"
        />
      </Button>
      <TextInput
        css={css`
          color: ${isGeocoding ? "#ddd" : "initial"};
          padding-left: 35px;
          width: 100%;
          box-sizing: border-box;
        `}
        name={name}
        ariaLabel="Search by address"
        placeholder={t(
          `geocodingFieldPlaceholder${formId}${name}`,
          placeholder,
        )}
        value={value}
        onBlur={doGeocode}
        onKeyDown={e => onKeyDown && onKeyDown(e)}
        onChange={e => onChange(e.target.name, e.target.value)}
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
        {t("locationNotFoundError")}
      </div>
    </div>
  );
};

GeocodingField.defaultProps = {
  // In case the GeocodingField is used outside the input form, e.g. in the
  // GeocodeAddressBar:
  formId: "noForm",
  reverseGeocode: true,
};

const mapStateToProps = (state): any => ({
  mapViewport: mapViewportSelector(state),
  mapConfig: mapConfigSelector(state),
  isMapDraggingOrZooming: isMapDraggingOrZooming(state),
});

export default connect<StateProps>(mapStateToProps)(
  withTranslation("GeocodingField")(GeocodingField),
);

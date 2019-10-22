/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import SearchIcon from "@material-ui/icons/Search";
import InputLabel from "@material-ui/core/InputLabel";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import { withTranslation, WithTranslation } from "react-i18next";
import { FieldProps as FormikFieldProps } from "formik";
import { useSelector } from "react-redux";

import { MapseedAddressFieldModule } from "../../../state/ducks/forms";
import {
  mapConfigSelector,
  mapViewportSelector,
  MapViewport,
  isMapDraggingOrZooming as isMapDraggingOrZoomingSelector,
} from "../../../state/ducks/map";
import { LoadingSpinner } from "../../atoms/imagery";
import eventEmitter from "../../../utils/event-emitter";

type TextFieldModuleProps = {
  mapseedField: MapseedAddressFieldModule;
} & FormikFieldProps &
  WithTranslation;

declare const MAP_PROVIDER_TOKEN: string;

const DoGeocodeButton = () => (
  <InputAdornment>
    <IconButton>
      <SearchIcon />
    </IconButton>
  </InputAdornment>
);

const AddressField = ({
  field: { name, value, onBlur, onChange },
  mapseedField: { prompt, placeholder, id, reverseGeocode },
  t,
}: TextFieldModuleProps) => {
  const [isGeocoding, setIsGeocoding] = React.useState<boolean>(false);
  const [isWithGeocodingError, setIsWithGeocodingError] = React.useState<
    boolean
  >(false);
  const mapViewport: MapViewport = useSelector(mapViewportSelector);
  const isMounted = React.useRef<boolean>(true);
  const isMapDraggingOrZooming = useSelector(isMapDraggingOrZoomingSelector);
  const { geocodeBoundingBox, geocodeHint } = useSelector(mapConfigSelector);

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
  }, [mapViewport, isMapDraggingOrZooming, name, onChange, reverseGeocode]);

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

        console.log("locationGeometry", locationGeometry);

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

  //React.useEffect(() => {
  //  if (isTriggeringGeocode) {
  //    doGeocode();
  //  }
  //}, [isTriggeringGeocode, doGeocode]);

  React.useEffect(() => {
    if (isWithGeocodingError) {
      setTimeout(() => {
        setIsWithGeocodingError(false);
      }, 5000);
    }
  }, [isWithGeocodingError]);

  return (
    <React.Fragment>
      {prompt && (
        <InputLabel
          style={{
            backgroundColor: "#fff",
            paddingLeft: "4px",
            paddingRight: "4px",
          }}
          htmlFor={name}
        >
          {prompt}
        </InputLabel>
      )}
      <OutlinedInput
        type={"text"}
        notched={true}
        id={name}
        name={name}
        labelWidth={0}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        placeholder={t(`addressFieldLabel${id}`, placeholder)}
        disabled={isGeocoding}
        startAdornment={
          isGeocoding ? (
            <div
              css={css`
                padding: 14px;
              `}
            >
              <LoadingSpinner size={16} />
            </div>
          ) : (
            <InputAdornment>
              <IconButton onClick={doGeocode}>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          )
        }
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
    </React.Fragment>
  );
};

export default withTranslation("AddressField")(AddressField);

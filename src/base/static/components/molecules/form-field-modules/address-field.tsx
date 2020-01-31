/** @jsx jsx */
import * as React from "react";
import { jsx } from "@emotion/core";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import SearchIcon from "@material-ui/icons/Search";
import IconButton from "@material-ui/core/IconButton";
import Popper from "@material-ui/core/Popper";
import Paper from "@material-ui/core/Paper";
import Fade from "@material-ui/core/Fade";
import FormControlLabel from "@material-ui/core/FormControlLabel";
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
import { FieldPrompt } from "../../atoms/typography";

type TextFieldModuleProps = {
  mapseedField: MapseedAddressFieldModule;
  setFieldValue: (key: string, value: string) => null;
} & FormikFieldProps &
  WithTranslation;

declare const MAP_PROVIDER_TOKEN: string;

const AddressField = ({
  field: { name, value, onChange },
  mapseedField: { prompt, placeholder, id, reverseGeocode },
  t,
  setFieldValue,
}: TextFieldModuleProps) => {
  // NOTE: The `AddressField` accepts a prop which controls the default reverse
  // geocoding behavior. However, we also provide a way for users to active and
  // deactivate the reverse geocoding feature manually. We do this because the
  // geocoder and reverse geocoder don't always agree, and subtle differences
  // have proven to be a source of frustration for users.
  const [shouldReverseGeocode, setShouldReverseGeocode] = React.useState<
    boolean
  >(reverseGeocode);
  const [isGeocoding, setIsGeocoding] = React.useState<boolean>(false);
  const [isWithGeocodingError, setIsWithGeocodingError] = React.useState<
    boolean
  >(false);
  const mapViewport: MapViewport = useSelector(mapViewportSelector);
  const isMounted = React.useRef<boolean>(true);
  const isMapDraggingOrZooming = useSelector(isMapDraggingOrZoomingSelector);
  const { geocodeBoundingBox, geocodeHint } = useSelector(mapConfigSelector);
  const inputRef = React.useRef<HTMLElement>(null);

  // Reverse geocode on map viewport change.
  React.useEffect(() => {
    // Only reverse geocode when configured to do so and when the map has come
    // to rest.
    if (!shouldReverseGeocode || isMapDraggingOrZooming) {
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
          setFieldValue(name, placeName);
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
        console.error("There was an error while reverse geocoding:", err);
      });
  }, [
    mapViewport,
    isMapDraggingOrZooming,
    name,
    setFieldValue,
    reverseGeocode,
    shouldReverseGeocode,
  ]);

  const doGeocode = React.useCallback(() => {
    setIsGeocoding(true);
    setIsWithGeocodingError(false);

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      value,
    )}.json?&access_token=${MAP_PROVIDER_TOKEN}${
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

  React.useEffect(() => {
    if (isWithGeocodingError) {
      setTimeout(() => {
        setIsWithGeocodingError(false);
      }, 3000);
    }
  }, [isWithGeocodingError]);

  const handleKeyDown = React.useCallback(
    evt => {
      // Geocode on Enter press.
      (evt.charCode || evt.keyCode) === 13 && doGeocode();
    },
    [doGeocode],
  );

  return (
    <React.Fragment>
      {prompt && <FieldPrompt>{prompt}</FieldPrompt>}
      <OutlinedInput
        ref={inputRef}
        style={{ paddingLeft: "4px" }}
        onKeyUp={handleKeyDown}
        type="text"
        notched
        id={name}
        name={name}
        labelWidth={0}
        value={value}
        onChange={onChange}
        placeholder={t(`addressFieldLabel${id}`, placeholder)}
        disabled={isGeocoding}
        startAdornment={
          <InputAdornment
            style={{ minWidth: "40px", maxWidth: "40px", paddingRight: "8px" }}
            position="start"
          >
            <IconButton onClick={isGeocoding ? () => null : doGeocode}>
              {isGeocoding ? <LoadingSpinner size={15} /> : <SearchIcon />}
            </IconButton>
          </InputAdornment>
        }
      />
      <Typography
        variant="caption"
        align="right"
        style={{ color: "#9d9d9d", fontStyle: "italic" }}
      >
        {t("geocodeDisclaimer", "Locations may be approximate")}
      </Typography>
      <FormControlLabel
        style={{ marginLeft: "8px", marginTop: "8px", fontSize: "0.8rem" }}
        control={
          <Switch
            checked={shouldReverseGeocode}
            onChange={() => setShouldReverseGeocode(!shouldReverseGeocode)}
          />
        }
        label={
          <Typography
            style={{
              color: "rgba(0,0,0,0.87)",
              fontSize: "1rem",
            }}
            variant="body1"
          >
            {shouldReverseGeocode
              ? t(
                  "shouldReverseGeocodeControlLabel",
                  "Set address automatically",
                )
              : t(
                  "shouldNotReverseGeocodeControlLabel",
                  "Do not set address automatically",
                )}
          </Typography>
        }
      />
      <Popper
        open={isWithGeocodingError}
        anchorEl={inputRef.current}
        disablePortal
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper style={{ padding: "8px 16px 8px 16px" }} elevation={5}>
              <Typography variant="body1">
                {t(
                  "locationNotFoundError",
                  "Sorry, we could not find that location",
                )}
              </Typography>
            </Paper>
          </Fade>
        )}
      </Popper>
    </React.Fragment>
  );
};

export default withTranslation("AddressField")(AddressField);

import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Spinner from "react-spinner";
import { connect } from "react-redux";

import { translate } from "react-i18next";
import "./geocoding-field.scss";

import {
  mapConfigSelector,
  mapConfigPropType,
} from "../../../state/ducks/map-config";

// TODO: Consolidate Util methods used here.
import Util from "../../../js/utils.js";

class GeocodingField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isGeocoding: false,
      isWithGeocodingError: false,
    };
    this.geocodingEngine = "Mapbox";
  }

  componentDidUpdate(prevProps, prevState) {
    this.props.isTriggeringGeocode &&
      !prevProps.isTriggeringGeocode &&
      this.doGeocode();

    if (this.state.isWithGeocodingError && !prevState.isWithGeocodingError) {
      setTimeout(() => {
        this.setState({
          isWithGeocodingError: false,
        });
      }, 5000);
    }
  }

  doGeocode() {
    this.setState({
      isGeocoding: true,
      isWithGeocodingError: false,
    });
    const address = this.props.value;

    Util[this.geocodingEngine].geocode({
      location: address,
      hint: this.props.mapConfig.geocodeHint,
      bbox: this.props.mapConfig.geocodeBoundingBox,
      options: {
        success: data => {
          const locationGeometry =
            data.features && data.features[0] && data.features[0].geometry;
          if (locationGeometry) {
            this.setState({
              isGeocoding: false,
              isWithGeocodingError: false,
            });

            this.props.onUpdateMapViewport({
              latitude: locationGeometry.coordinates[1],
              longitude: locationGeometry.coordinates[0],
              zoom: 14,
              transitionDuration: 1000,
            });
          } else {
            this.setState({
              isGeocoding: false,
              isWithGeocodingError: true,
            });
          }
        },
        error: () => {
          this.setState({
            isGeocoding: false,
            isWithGeocodingError: true,
          });
          // eslint-disable-next-line no-console
          console.error("There was an error while geocoding: ", arguments);
        },
      },
    });
  }

  render() {
    return (
      <div className="geocoding-field">
        {this.state.isGeocoding && (
          <Spinner style={{ left: "20px", width: "30px", height: "30px" }} />
        )}
        {!this.state.isGeocoding && (
          <span
            className="geocoding-field__do-geocode-icon"
            onClick={this.doGeocode.bind(this)}
          />
        )}
        <input
          className="geocoding-field__input"
          name={this.props.name}
          type="text"
          aria-label="Search by address"
          placeholder={this.props.t(
            `geocodingFieldPlaceholder${this.props.formId}${this.props.name}`,
            this.props.placeholder,
          )}
          value={this.props.value}
          onBlur={this.doGeocode.bind(this)}
          onKeyDown={e => this.props.onKeyDown && this.props.onKeyDown(e)}
          onChange={e => this.props.onChange(e.target.name, e.target.value)}
        />
        <div
          className={classNames("geocoding-field__geocoding-error", {
            "geocoding-field__geocoding-error--visible": this.state
              .isWithGeocodingError,
          })}
        >
          {this.props.t("locationNotFoundError")}
        </div>
      </div>
    );
  }
}

GeocodingField.propTypes = {
  formId: PropTypes.string.isRequired,
  mapConfig: mapConfigPropType,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func,
  placeholder: PropTypes.string,
  onUpdateMapViewport: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  isTriggeringGeocode: PropTypes.bool,
  value: PropTypes.string,
};

GeocodingField.defaultProps = {
  // In case the GeocodingField is used outside the input form, e.g. in the
  // GeocodeAddressBar:
  formId: "noForm",
};

const mapStateToProps = state => ({
  mapConfig: mapConfigSelector(state),
});

export default connect(mapStateToProps)(
  translate("GeocodingField")(GeocodingField),
);

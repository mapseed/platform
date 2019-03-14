import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Spinner from "react-spinner";
import { connect } from "react-redux";

import { translate } from "react-i18next";
import "./geocoding-field.scss";

import { updateMapViewport } from "../../../state/ducks/map";

import { mapConfigSelector } from "../../../state/ducks/map-config";

// TODO: Consolidate Util methods used here.
const Util = require("../../../js/utils.js");

class GeocodingField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isGeocoding: false,
      isWithGeocodingError: false,
    };
    this.geocodingEngine = this.props.mapConfig.geocoding_engine || "MapQuest";
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
      hint: this.props.mapConfig.geocode_hint,
      bbox: this.props.mapConfig.geocode_bounding_box,
      options: {
        success: data => {
          const locationsData = data.results[0] && data.results[0].locations;
          if (locationsData && locationsData.length > 0) {
            this.setState({
              isGeocoding: false,
              isWithGeocodingError: false,
            });

            // TODO: Is this location data format specific to the Mapbox
            // geocoder? We should probably just remove Mapquest as a geocoding
            // option and assume the Mapbox format is the one we'll always be
            // dealing with.
            this.props.updateMapViewport({
              latitude: locationsData[0].latLng.lat,
              longitude: locationsData[0].latLng.lng,
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
          placeholder={this.props.placeholder}
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
  mapConfig: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func,
  placeholder: PropTypes.string,
  updateMapViewport: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  isTriggeringGeocode: PropTypes.bool,
  value: PropTypes.string,
};

const mapStateToProps = state => ({
  mapConfig: mapConfigSelector(state),
});

const mapDispatchToProps = dispatch => ({
  updateMapViewport: viewport => dispatch(updateMapViewport(viewport)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(translate("GeocodingField")(GeocodingField));

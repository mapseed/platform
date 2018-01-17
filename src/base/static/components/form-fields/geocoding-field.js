import React, { Component } from "react";

const cn = require("classnames");

import { geocodingField as messages } from "../messages";
import "./geocoding-field.scss";

const Util = require("../../js/utils.js");

class GeocodingField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isGeocoding: false,
      hasGeocodingError: false,
    };
    this.geocodingEngine = this.props.mapConfig.geocoding_engine || "MapQuest";
    this.hint =
      this.props.mapConfig.geocode_bounding_box ||
      this.props.mapConfig.geocode_hint;
  }

  componentDidMount() {
    let target = document.getElementsByClassName(
      "geocoding-field__geocoding-spinner"
    )[0];
    new Spinner(Shareabouts.smallSpinnerOptions).spin(target);
  }

  doGeocode() {
    this.setState({
      isGeocoding: true,
      hasGeocodingError: false,
    });
    let address = this.props.value;

    Util[this.geocodingEngine].geocode(address, this.hint, {
      success: data => {
        let locationsData = data.results[0].locations;
        if (locationsData.length > 0) {
          this.setState({
            isGeocoding: false,
            hasGeocodingError: false,
          });
          this.props.emitter.emit("geocode", locationsData[0]);
        } else {
          this.setState({
            isGeocoding: false,
            hasGeocodingError: true,
          });
        }
      },
      error: () => {
        this.setState({
          isGeocoding: false,
          hasGeocodingError: true,
        });
        console.error("There was an error while geocoding: ", arguments);
      },
    });
  }

  onBlur(evt) {
    this.doGeocode(evt);
  }

  render() {
    const { hasGeocodingError, isGeocoding } = this.state;
    const { name, onChange, value } = this.props;
    const classNames = {
      spinner: cn("geocoding-field__geocoding-spinner", {
        "geocoding-field__geocoding-spinner--visible": isGeocoding,
        "geocoding-field__geocoding-spinner--hidden": !isGeocoding,
      }),
      error: cn("mapseed-geocoding-field__geocoding-error", {
        "geocoding-field__geocoding-error--visible": hasGeocodingError,
        "geocoding-field__geocoding-error--hidden": !hasGeocodingError,
      }),
    };

    return (
      <div className="geocoding-field">
        <span className={classNames.spinner} />
        <span
          className="geocoding-field__do-geocode-icon"
          onClick={this.doGeocode.bind(this)}
        />
        <input
          className="geocoding-field__input"
          name={name}
          type="text"
          value={value}
          onChange={onChange}
          onBlur={this.onBlur.bind(this)}
        />
        <div className={classNames.error}>{messages.locationNotFoundError}</div>
      </div>
    );
  }
}

export default GeocodingField;

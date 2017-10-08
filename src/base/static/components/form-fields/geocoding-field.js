import React, { Component } from "react";
import { EventEmitter } from "fbemitter";
import cx from "bem-classnames";

import { geocodingField as messages } from "../messages";

const Util = require("../../js/utils.js");

const baseClass = "mapseed-geocoding-field";

class GeocodingField extends Component {
	
  constructor() {
    super(...arguments);
    this.state = {
      isGeocoding: false,
      hasGeocodingError: false
    };
    this.doGeocodeIconClass = {
      name: baseClass + "__do-geocode-icon"
    };
    this.geocodingSpinnerClass = {
      name: baseClass + "__geocoding-spinner",
      modifiers: ["visibility"]
    };
    this.geocodingErrorClass = {
      name: baseClass + "__geocoding-error",
      modifiers: ["visibility"]
    };
    this.geocodingEngine = this.props.mapConfig.geocoding_engine || "MapQuest";
    this.hint = 
      this.props.mapConfig.geocode_bounding_box ||
      this.props.mapConfig.geocode_hint;
  }

  componentDidMount() {
    let target = document.getElementsByClassName(cx(this.geocodingSpinnerClass))[0];
    new Spinner(Shareabouts.smallSpinnerOptions).spin(target);
  }

  doGeocode(evt) {
    this.setState({ isGeocoding: true, hasGeocodingError: false });
    let address = evt.target.value;

    Util[this.geocodingEngine].geocode(address, this.hint, {
      success: (data) => {
        let locationsData = data.results[0].locations;
        if (locationsData.length > 0) {
          this.props.emitter.emit("geocode", [locationsData[0]]);
        } else {
          this.setState({ isGeocoding: false, hasGeocodingError: true });
        }
      },
      error: (err) => {
        this.setState({ isGeocoding: false, hasGeocodingError: true });
        console.error("There was an error while geocoding: ", arguments);
      },
    });
  }

  onBlur(evt) {
    this.doGeocode(evt);
  }

  render() {
    return (
      <div className={baseClass}>
        <span className={cx(this.geocodingSpinnerClass, 
          { visibility: this.state.isGeocoding ? "visible" : "hidden" })} />
        <span 
          className={cx(this.doGeocodeIconClass)}
          onClick={this.doGeocode.bind(this)} />
        <input 
          name={this.props.name}
          type="text"
          defaultValue={this.props.defaultValue} 
          onBlur={this.onBlur.bind(this)} />
        <div className={cx(this.geocodingErrorClass, 
          { visibility: this.state.hasGeocodingError ? "visible" : "hidden" })}>
          {messages.locationNotFoundError}
        </div>
      </div>
    );
  }
};

export { GeocodingField };

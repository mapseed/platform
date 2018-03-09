import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import emitter from "../../utils/emitter";
import { geocodingField as messages } from "../../messages";
import "./geocoding-field.scss";

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
    this.hint =
      this.props.mapConfig.geocode_bounding_box ||
      this.props.mapConfig.geocode_hint;
  }

  componentDidMount() {
    const target = document.getElementsByClassName(
      "geocoding-field__geocoding-spinner"
    )[0];
    // TODO: Replace spin.js spinner with a React component.
    new Spinner(Shareabouts.smallSpinnerOptions).spin(target);
  }

  doGeocode() {
    this.setState({
      isGeocoding: true,
      isWithGeocodingError: false,
    });
    let address = this.props.value;

    Util[this.geocodingEngine].geocode(address, this.hint, {
      success: data => {
        let locationsData = data.results[0].locations;
        if (locationsData.length > 0) {
          this.setState({
            isGeocoding: false,
            isWithGeocodingError: false,
          });
          emitter.emit("geocode", locationsData[0]);
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
        console.error("There was an error while geocoding: ", arguments);
      },
    });
  }

  render() {
    const cn = {
      spinner: classNames("geocoding-field__geocoding-spinner", {
        "geocoding-field__geocoding-spinner--visible": this.state.isGeocoding,
      }),
      error: classNames("geocoding-field__geocoding-error", {
        "geocoding-field__geocoding-error--visible": this.state
          .isWithGeocodingError,
      }),
    };

    return (
      <div className="geocoding-field">
        <span className={cn.spinner} />
        <span
          className="geocoding-field__do-geocode-icon"
          onClick={this.doGeocode.bind(this)}
        />
        <input
          className="geocoding-field__input"
          name={this.props.name}
          type="text"
          value={this.props.value}
          onBlur={this.doGeocode.bind(this)}
          onChange={e => this.props.onChange(e.target.name, e.target.value)}
        />
        <div className={cn.error}>{messages.locationNotFoundError}</div>
      </div>
    );
  }
}

GeocodingField.propTypes = {
  mapConfig: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
};

export default GeocodingField;

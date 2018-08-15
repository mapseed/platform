import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Spinner from "react-spinner";

import emitter from "../../../utils/emitter";
import { translate } from "react-i18next";
import "./geocoding-field.scss";

import { map as mapConfig } from "config";

// TODO: Consolidate Util methods used here.
const Util = require("../../../js/utils.js");

class GeocodingField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isGeocoding: false,
      isWithGeocodingError: false,
    };
    this.geocodingEngine = mapConfig.geocoding_engine || "MapQuest";
    this.hint = mapConfig.geocode_bounding_box || mapConfig.geocode_hint;
  }

  componentDidUpdate(prevProps) {
    this.props.isTriggeringGeocode &&
      !prevProps.isTriggeringGeocode &&
      this.doGeocode();
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
        // eslint-disable-next-line no-console
        console.error("There was an error while geocoding: ", arguments);
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
          onChange={e => this.props.onChange(e.target.name, e.target.value)}
        />
        <div
          className={classNames("geocoding-field__geocoding-error", {
            "geocoding-field__geocoding-error--visible": this.state
              .isWithGeocodingError,
          })}
        >
          {this.props.t("fields:geocodingField:locationNotFoundError")}
        </div>
      </div>
    );
  }
}

GeocodingField.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  t: PropTypes.func.isRequired,
  isTriggeringGeocode: PropTypes.bool,
  value: PropTypes.string,
};

export default translate("GeocodingField")(GeocodingField);

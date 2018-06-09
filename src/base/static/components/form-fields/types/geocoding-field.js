import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

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

  componentDidMount() {
    const target = document.getElementsByClassName(
      "geocoding-field__geocoding-spinner",
    )[0];
    // TODO: Replace spin.js spinner with a React component.
    // eslint-disable-next-line no-undef
    new Spinner(Shareabouts.smallSpinnerOptions).spin(target);
  }

  componentWillReceiveProps(nextProps) {
    nextProps.isTriggeringGeocode && this.doGeocode();
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
          placeholder={this.props.placeholder}
          value={this.props.value}
          onBlur={this.doGeocode.bind(this)}
          onChange={e => this.props.onChange(e.target.name, e.target.value)}
        />
        <div className={cn.error}>
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

import React, { Component } from "react";
import PropTypes from "prop-types";

import { translate } from "react-i18next";

import "./index.scss";

import GeocodingField from "../form-fields/types/geocoding-field";

class GeocodeAddressBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: "",
      isTriggeringGeocode: false,
    };
  }

  onChange(fieldName, fieldValue, evt) {
    this.setState({
      value: fieldValue,
      isTriggeringGeocode: false,
    });
  }

  onKeyDown(evt) {
    if (evt.key === "Tab") {
      // Prevent the default field-switching behavior of a Tab press here
      // because it screws up the UI.
      evt.preventDefault();
    }
  }

  onSubmit(evt) {
    evt.preventDefault();
    this.setState({
      isTriggeringGeocode: true,
    });
  }

  render() {
    return (
      <form className="geocode-address-bar" onSubmit={this.onSubmit.bind(this)}>
        <GeocodingField
          mapConfig={this.props.mapConfig}
          onKeyDown={this.onKeyDown}
          onChange={this.onChange.bind(this)}
          name="geocode-address-bar"
          placeholder={this.props.t("placeholderMsg")}
          isTriggeringGeocode={this.state.isTriggeringGeocode}
          value={this.state.value}
        />
      </form>
    );
  }
}

GeocodeAddressBar.propTypes = {
  mapConfig: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

export default translate("GeocodeAddressBar")(GeocodeAddressBar);

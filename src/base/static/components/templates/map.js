import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import styled from "react-emotion";

import MainMap from "../organisms/main-map";

import { datasetsLoadStatusSelector } from "../../state/ducks/datasets";
import { placesLoadStatusSelector } from "../../state/ducks/places";

class MapTemplate extends Component {
  render() {
    return (
      <MainMap
        setMapDimensions={this.props.setMapDimensions}
        router={this.props.router}
      />
    );
  }
}

MapTemplate.propTypes = {
  datasetsLoadStatus: PropTypes.string.isRequired,
  placesLoadStatus: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  datasetsLoadStatus: datasetsLoadStatusSelector(state),
  placesLoadStatus: placesLoadStatusSelector(state),
  router: PropTypes.instanceOf(Backbone.Router),
});

export default connect(mapStateToProps)(MapTemplate);

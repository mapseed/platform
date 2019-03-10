import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import MainMap from "../organisms/main-map";

import { uiVisibilitySelector } from "../../state/ducks/ui";

class MapTemplate extends Component {
  componentDidUpdate(prevProps) {
  }

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
  router: PropTypes.instanceOf(Backbone.Router),
};

const mapStateToProps = state => ({
  isContentPanelVisible: uiVisibilitySelector("contentPanel", state),
});

export default connect(mapStateToProps)(MapTemplate);

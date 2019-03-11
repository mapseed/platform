import React, { Component, createRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import styled from "react-emotion";

import MainMap from "../organisms/main-map";
import ContentPanel from "../organisms/content-panel";

import { uiVisibilitySelector } from "../../state/ducks/ui";

import mq from "../../../../media-queries";

const MapContainer = styled("div")(props => ({
  [mq[1]]: {
    height: "100%",
    width: props.isContentPanelVisible ? "60%" : "100%",
  },
}));

class MapTemplate extends Component {
  mapContainerRef = createRef();

  render() {
    return (
      <>
        <MapContainer
          ref={this.mapContainerRef}
          isContentPanelVisible={this.props.isContentPanelVisible}
        >
          <MainMap
            mapContainerRef={this.mapContainerRef}
            router={this.props.router}
          />
        </MapContainer>
        {this.props.isContentPanelVisible && (
          <ContentPanel
            router={this.props.router}
            languageCode={this.props.languageCode}
          />
        )}
      </>
    );
  }
}

MapTemplate.propTypes = {
  isContentPanelVisible: PropTypes.bool.isRequired,
  languageCode: PropTypes.string.isRequired,
  router: PropTypes.instanceOf(Backbone.Router),
};

const mapStateToProps = state => ({
  isContentPanelVisible: uiVisibilitySelector("contentPanel", state),
});

export default connect(mapStateToProps)(MapTemplate);

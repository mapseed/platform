import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { connect } from "react-redux";

import { Button } from "../atoms/buttons";
import mq from "../../../../media-queries";

import {
  addPlaceButtonVisibilitySelector,
  geocodeAddressBarVisibilitySelector,
  setAddPlaceButtonVisibility,
} from "../../state/ducks/ui";
import {
  hasAnonAbilitiesInAnyDataset,
  datasetSlugsSelector,
} from "../../state/ducks/datasets-config";
import { hasGroupAbilitiesInDatasets } from "../../state/ducks/user";

const AddPlaceButtonContainer = styled(
  props =>
    props.isAddPlaceButtonVisible && (
      <Button
        size="extra-large"
        variant="raised"
        color="primary"
        className={props.className}
        onClick={props.onClick}
      >
        {props.children}
      </Button>
    ),
)(props => {
  return {
    zIndex: 10,
    backgroundColor: props.theme.map.addPlaceButtonBackgroundColor,

    "&:hover": {
      backgroundColor: props.theme.map.addPlaceButtonHoverBackgroundColor,
    },

    [mq[0]]: {
      width: "100%",
      borderRadius: 0,
    },
    [mq[1]]: {
      position: "absolute",
      top: props.isGeocodeAddressBarVisible ? "92px" : "20px",
      left: "80px",
    },
  };
});

class AddPlaceButton extends Component {
  componentDidMount() {
    if (this.props.hasPermission) {
      // isAddPlaceButtonVisible is false by default
      this.props.setVisibility(true);
    }
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.isAddPlaceButtonVisible !== this.props.isAddPlaceButtonVisible
    ) {
      this.props.setMapDimensions();
    }
    if (prevProps.hasPermission !== this.props.hasPermission) {
      this.props.setVisibility(this.props.hasPermission);
    }
  }

  render() {
    return (
      this.props.isAddPlaceButtonVisible && (
        <AddPlaceButtonContainer
          className={this.props.className}
          onClick={this.props.onClick}
          isGeocodeAddressBarVisible={this.props.isGeocodeAddressBarVisible}
          isAddPlaceButtonVisible={this.props.isAddPlaceButtonVisible}
        >
          {this.props.children}
        </AddPlaceButtonContainer>
      )
    );
  }
}

AddPlaceButton.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  isAddPlaceButtonVisible: PropTypes.bool.isRequired,
  isGeocodeAddressBarVisible: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  setMapDimensions: PropTypes.func.isRequired,
  setVisibility: PropTypes.func.isRequired,
  hasPermission: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  isAddPlaceButtonVisible: addPlaceButtonVisibilitySelector(state),
  isGeocodeAddressBarVisible: geocodeAddressBarVisibilitySelector(state),
  hasPermission:
    hasAnonAbilitiesInAnyDataset({
      state: state,
      submissionSet: "places",
      abilities: ["create"],
    }) ||
    hasGroupAbilitiesInDatasets({
      state: state,
      submissionSet: "places",
      abilities: ["create"],
      datasetSlugs: datasetSlugsSelector(state),
    }),
});

const mapDispatchToProps = dispatch => ({
  setVisibility: isVisible => dispatch(setAddPlaceButtonVisibility(isVisible)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddPlaceButton);

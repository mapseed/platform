import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import styled from "react-emotion";
import { translate } from "react-i18next";

import InputFormCategorySelector from "./input-form-category-selector";

import { placeConfigSelector } from "../../state/ducks/place-config";
import { updateMapDragged, mapDraggedSelector } from "../../state/ducks/map";
import { getCategoryConfig } from "../../utils/config-utils";

const Util = require("../../js/utils.js");

const DragMapAlert = styled("div")({
  backgroundColor: "#ffc107",
  color: "#fff",
  border: "2px dotted #ffffff",
  borderRadius: "8px",
  padding: "8px",
  marginBottom: "8px",
  fontWeight: "800",
});

class FormCategoryMenuWrapper extends Component {
  constructor(props) {
    super(props);
    this.visibleCategoryConfigs = this.props.placeConfig.place_detail
      .filter(config => config.includeOnForm)
      .filter(config => {
        return !(
          config.admin_only &&
          !Util.getAdminStatus(config.dataset, config.admin_groups)
        );
      });
    this.state = {
      selectedCategory:
        this.visibleCategoryConfigs.length === 1
          ? this.visibleCategoryConfigs[0].category
          : null,
      isShowingCategorySelector: this.visibleCategoryConfigs.length !== 1,
      isSingleCategory: this.visibleCategoryConfigs.length === 1,
    };
  }

  componentDidMount() {
    this.props.updateMapDragged(false);
    this.props.showNewPin();
  }

  onCategoryChange(selectedCategory) {
    this.setState({
      selectedCategory: selectedCategory,
      isShowingCategorySelector: !getCategoryConfig(
        this.props.placeConfig,
        selectedCategory,
      ).multi_stage,
    });
  }

  render() {
    return (
      <div className="input-form-category-menu-container">
        {this.state.isShowingCategorySelector && (
          <Fragment>
            {!this.props.isMapDragged && (
              <DragMapAlert>{this.props.t("dragMapAlert")}</DragMapAlert>
            )}
            <InputFormCategorySelector
              onCategoryChange={this.onCategoryChange.bind(this)}
              selectedCategory={this.state.selectedCategory}
              visibleCategoryConfigs={this.visibleCategoryConfigs}
            />
          </Fragment>
        )}
        {this.state.selectedCategory
          ? this.props.render(
              this.state,
              this.props,
              this.onCategoryChange.bind(this),
            )
          : null}
      </div>
    );
  }
}

FormCategoryMenuWrapper.propTypes = {
  hideSpotlightMask: PropTypes.func.isRequired,
  showNewPin: PropTypes.func.isRequired,
  hideNewPin: PropTypes.func.isRequired,
  hidePanel: PropTypes.func.isRequired,
  placeConfig: PropTypes.object.isRequired,
  places: PropTypes.objectOf(PropTypes.instanceOf(Backbone.Collection)),
  router: PropTypes.instanceOf(Backbone.Router),
  customHooks: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.objectOf(PropTypes.func),
  ]),
  containers: PropTypes.instanceOf(NodeList),
  isMapDragged: PropTypes.bool.isRequired,
  render: PropTypes.func.isRequired,
  updateMapDragged: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  customComponents: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
};

const mapStateToProps = state => ({
  isMapDragged: mapDraggedSelector(state),
  placeConfig: placeConfigSelector(state),
});

const mapDispatchToProps = dispatch => ({
  updateMapDragged: isMapDragged => dispatch(updateMapDragged(isMapDragged)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(translate("FormCategoryMenuWrapper")(FormCategoryMenuWrapper));

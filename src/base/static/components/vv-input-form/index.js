import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import PrimaryButton from "../ui-elements/primary-button";
import InputForm from "../input-form";
import { translate } from "react-i18next";
import constants from "./constants";
import "./index.scss";

const Util = require("../../../static/js/utils.js");

const hooks = {
  postSave: (response, model, defaultPostSave, context) => {
    if (
      response.get("location_type") === constants.COMMUNITY_INPUT_CATEGORY_NAME
    ) {
      context.setState({
        stage: "exit-or-continue",
        isFormResetting: false,
      });
    } else {
      defaultPostSave(model);
    }
  },
};

class VVInputForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stage: "set-location",
      isMapPositioned: false,
    };
  }

  componentWillMount() {
    // Remove saved autofill values. For VV input forms, we always want to reset
    // any saved autofill values when re-opening the form.
    this.props.placeConfig.place_detail
      .find(
        config => config.category === constants.COMMUNITY_INPUT_CATEGORY_NAME,
      )
      .fields.filter(field => field.autocomplete === true)
      .forEach(field => Util.removeAutocompleteValue(field.name));
  }

  componentDidMount() {
    this.props.map.on("dragend", () => {
      !this.state.isMapPositioned &&
        this.setState({
          stage: "enter-data",
          isMapPositioned: true,
        });
    });

    this.props.customHooks.postSave = (response, model, defaultPostSave) => {
      return hooks.postSave(response, model, defaultPostSave, this);
    };
  }

  onClickContinueForm() {
    this.setState({
      stage: "enter-data",
      isFormResetting: true,
    });

    this.props.showNewPin();
    this.props.hideSpotlightMask();
  }

  onClickExitForm() {
    this.setState({
      stage: "set-location",
      isMapPositioned: false,
    });

    this.props.hideSpotlightMask();
    this.props.hideNewPin();
    this.props.hidePanel();
  }

  render() {
    // Certain custom behavior should only be performed if we are rendering a
    // community input form.
    const isCommunityInputCategorySelected =
      this.props.selectedCategoryConfig.category ===
      constants.COMMUNITY_INPUT_CATEGORY_NAME;
    const cn = {
      form: classNames("vv-input-form__form", {
        "vv-input-form__form--visible":
          !isCommunityInputCategorySelected ||
          this.state.stage === "enter-data",
      }),
      welcomeHeader: classNames("vv-input-form__welcome-header-container", {
        "vv-input-form__welcome-header-container--visible": !isCommunityInputCategorySelected
          ? false
          : this.state.stage === "set-location" ||
            this.state.stage === "enter-data",
      }),
      continueBtns: classNames("vv-input-form__continue-btns-container", {
        "vv-input-form__continue-btns-container--visible": !isCommunityInputCategorySelected
          ? false
          : this.state.stage === "exit-or-continue",
      }),
    };
    const { t } = this.props;

    return (
      <div className="vv-input-form">
        <div className={cn.welcomeHeader}>
          <h3 className="vv-input-form__welcome-header">
            {t("welcomeHeader")}
          </h3>
          <br />
          <p className="vv-input-form__welcome-subheader">
            {t("welcomeSubheader")}
          </p>
        </div>
        <InputForm
          className={cn.form}
          isFormResetting={this.state.isFormResetting}
          {...this.props}
        />
        <div className={cn.continueBtns}>
          <h4 className="input-form__continue-btns-header">
            {t("continueBtnsHeader")}
          </h4>
          <PrimaryButton
            className="input-form__continue-form-btn"
            onClick={this.onClickContinueForm.bind(this)}
          >
            {t("continueFormLabel")}
          </PrimaryButton>
          <PrimaryButton
            className="input-form__exit-form-btn"
            onClick={this.onClickExitForm.bind(this)}
          >
            {t("exitFormLabel")}
          </PrimaryButton>
        </div>
      </div>
    );
  }
}

VVInputForm.propTypes = {
  selectedCategoryConfig: PropTypes.object.isRequired,
  customHooks: PropTypes.objectOf(PropTypes.func),
  hideNewPin: PropTypes.func.isRequired,
  hidePanel: PropTypes.func.isRequired,
  hideSpotlightMask: PropTypes.func.isRequired,
  map: PropTypes.object.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  placeConfig: PropTypes.object.isRequired,
  showNewPin: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default translate("VVInputForm")(VVInputForm);

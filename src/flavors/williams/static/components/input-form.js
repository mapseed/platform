import React, { Component } from "react";
const cn = require("classnames");

import PrimaryButton from "../../../../base/static/components/ui-elements/primary-button";
import InputForm from "../../../../base/static/components/input-form";
import messages from "./messages";
import constants from "./constants";
import "./input-form.scss";

const hooks = {
  postSave: (response, model, defaultPostSave, context) => {
    if (response.get("location_type") === constants.COMMUNITY_INPUT_CATEGORY_NAME) {
      // Perform custom postSave behavior if we're submitting a place of the
      // COMMUNITY_INPUT_CATEGORY_NAME type.
      context.setState({ stage: 3 });
    } else {
      // Otherwise, perform normal routing.
      defaultPostSave(model);
    }
  }
};

class VVInputForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      stage: 1,
      mapHasMoved: false
    };
    this.onClickContinueForm = this.onClickContinueForm.bind(this);
    this.onClickExitForm = this.onClickExitForm.bind(this);

    this.props.map.on("dragend", () => {
      !this.state.mapHasMoved && this.setState({ stage: 2, mapHasMoved: true });
    });

    const postSaveHookWrapper = (response, model, defaultPostSave) => {
      return hooks.postSave(response, model, defaultPostSave, this);
    }

    this.props.customHooks["postSave"] = postSaveHookWrapper;
  }

  onClickContinueForm(evt) {
    this.setState({ stage: 2 });
  }

  onClickExitForm(evt) {
    this.setState({ stage: 1 });
    this.props.hidePanel();
  }

  render() {
    const { stage } = this.state;
    const classNames = {
      form: cn("vv-input-form__form", {
        "vv-input-form__form--visible": stage === 2,
        "vv-input-form__form--hidden": stage !== 2
      }),
      welcomeHeader: cn("vv-input-form__welcome-header-container", {
        "vv-input-form__welcome-header-container--visible": stage === 1 || stage === 2,
        "vv-input-form__welcome-header-container--hidden": stage === 3
      }),
      continueBtns: cn("vv-input-form__continue-btns-container", {
        "vv-input-form__continue-btns--visible": stage === 3,
        "vv-input-form__continue-btns--hidden": stage !== 3
      })
    };

    return (
      <div className="vv-input-form">
        <div className={classNames.welcomeHeader}>
          <h3 className="vv-input-form__welcome-header">
            {messages.welcomeHeader}
          </h3>
          <br />
          <p className="vv-input-form__welcome-subheader">
            {messages.welcomeSubheader}
          </p>
        </div>
        <InputForm
          className={classNames.form}
          {...this.props} 
        />
        <div className={classNames.continueBtns}>
          <h4 className="input-form__continue-btns-header">
            {messages.continueBtnsHeader}
          </h4>
          <PrimaryButton 
            className="input-form__continue-form-btn"
            onClick={this.onClickContinueForm}
          >
            {messages.continueFormLabel}
          </PrimaryButton>
          <PrimaryButton 
            className="input-form__exit-form-btn"
            onClick={this.onClickExitForm}
          >
            {messages.exitFormLabel}
          </PrimaryButton>
        </div>
      </div>
    );
  }

}

export default VVInputForm;

/** @jsx jsx */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Map } from "immutable";
import classNames from "classnames";
import { css, jsx } from "@emotion/core";
import { connect } from "react-redux";
import { withTheme } from "emotion-theming";

import { RegularText } from "../atoms/typography";
import { Button } from "../atoms/buttons";
import { FontAwesomeIcon } from "../atoms/imagery";
import fieldDefinitions from "./field-definitions";
import { withTranslation } from "react-i18next";
import constants from "../../constants";

import { isEditModeToggled, updateUIVisibility } from "../../state/ducks/ui";
import { updateMapInteractionState } from "../../state/ducks/map";

import "./form-field.scss";

import Util from "../../js/utils.js";

class FormField extends Component {
  constructor(props) {
    super(props);
    this.fieldDefinition = fieldDefinitions[this.props.fieldConfig.type];
    this.validator = this.fieldDefinition.getValidator(
      this.props.fieldConfig.optional,
    );

    // "autofill" is a better term than "autocomplete" for this feature.
    // TODO: Update this throughout the codebase.
    const autofillValue = this.props.fieldConfig.autocomplete
      ? Util.getAutocompleteValue(this.props.fieldConfig.name)
      : null;
    this.props.fieldConfig.hasAutofill = !!autofillValue;

    // TODO: This field initialization mechanism is a little convoluted.
    // We have to coordinate between the FormField component and its parent--
    // which manages the state--in order to initialize properly. We should
    // search for a better pattern to support field state management.

    // In edit mode, don't fill in default values.
    const defaultValue = this.props.isEditModeToggled
      ? null
      : this.props.fieldConfig.default_value;
    const initialFieldValue = this.fieldDefinition.getInitialValue({
      value:
        this.props.fieldState.get(constants.FIELD_VALUE_KEY) ||
        autofillValue ||
        defaultValue ||
        "",
      fieldConfig: this.props.fieldConfig,
      attachments: this.props.attachments,
    });

    this.state = {
      isInitialized: false,
    };

    this.onChange(this.props.fieldConfig.name, initialFieldValue, true);
  }

  shouldComponentUpdate(nextProps) {
    return (
      nextProps.isInitializing ||
      nextProps.showValidityStatus ||
      nextProps.updatingField === this.props.fieldConfig.name
    );
  }

  componentDidMount() {
    this.setState({
      isInitialized: true,
    });

    if (this.props.fieldConfig.type === "lng_lat") {
      this.props.updateMapInteractionState({
        isMapDraggedOrZoomedByUser: false,
      });
      this.props.updateSpotlightMaskVisibility(true);
    }
  }

  onChange(fieldName, fieldValue, isInitializing = false) {
    this.props.onFieldChange({
      fieldName: fieldName,
      fieldStatus: Map()
        .set(constants.FIELD_VALUE_KEY, fieldValue)
        .set(
          constants.FIELD_VALIDITY_KEY,
          this.validator.validate({
            value: fieldValue,
          }),
        )
        .set(
          constants.FIELD_RENDER_KEY,
          this.props.fieldState.get(constants.FIELD_RENDER_KEY),
        )
        .set(constants.FIELD_VALIDITY_MESSAGE_KEY, this.validator.message)
        .set(
          constants.FIELD_TRIGGERS_VALUE_KEY,
          this.props.fieldState.get(constants.FIELD_TRIGGERS_VALUE_KEY),
        )
        .set(
          constants.FIELD_VISIBILITY_KEY,
          this.props.fieldState.get(constants.FIELD_VISIBILITY_KEY),
        )
        .set(
          constants.FIELD_AUTO_FOCUS_KEY,
          this.props.fieldState.get(constants.FIELD_AUTO_FOCUS_KEY),
        )
        .set(
          constants.FIELD_ADVANCE_STAGE_ON_VALUE_KEY,
          this.props.fieldState.get(constants.FIELD_ADVANCE_STAGE_ON_VALUE_KEY),
        )
        .set("config", this.props.fieldState.get("config")),
      isInitializing: isInitializing,
    });
  }

  render() {
    const cn = {
      optionalMsg: classNames("input-form__optional-msg", {
        "input-form__optional-msg--visible": this.props.fieldConfig.optional,
      }),
    };

    return (
      <div
        css={css`
          display: ${this.props.fieldConfig.type ===
          constants.LNG_LAT_FIELD_TYPENAME
            ? "none"
            : "block"};
          font-family: ${this.props.theme.text.bodyFontFamily};
          margin-bottom: 5px;
          padding: 8px;
          border: ${this.props.showValidityStatus &&
          !this.props.fieldState.get("isValid")
            ? "4px dotted #da8583"
            : "4px solid transparent"};
        `}
        data-field-type={this.props.fieldConfig.type}
        data-field-name={this.props.fieldConfig.name}
      >
        {this.props.fieldConfig.prompt && (
          <div className="input-form__field-prompt-container">
            <RegularText
              css={css`
                margin-bottom: 8px;
                font-size: 1.15rem;
              `}
            >
              {this.props.t(
                `formField${this.props.formId}${this.props.fieldConfig.name}`,
                this.props.fieldConfig.prompt,
              )}
              <span className={cn.optionalMsg}>
                {this.props.t("optionalMsg", "optional")}
              </span>
            </RegularText>
            {this.props.fieldConfig.modal && (
              <Button
                css={css`
                  padding: 0;
                  background: transparent;
                `}
                onClick={() => {
                  this.props.onClickModal(this.props.fieldConfig.modal);
                }}
              >
                <FontAwesomeIcon faClassname="fas fa-question-circle" />
              </Button>
            )}
          </div>
        )}
        {this.state.isInitialized &&
          this.fieldDefinition.getComponent(this.props.fieldConfig, this)}
      </div>
    );
  }
}

FormField.propTypes = {
  attachments: PropTypes.array,
  disabled: PropTypes.bool,
  fieldConfig: PropTypes.object.isRequired,
  fieldState: PropTypes.object,
  formId: PropTypes.string.isRequired,
  isEditModeToggled: PropTypes.bool.isRequired,
  isInitializing: PropTypes.bool,
  updatingField: PropTypes.string,
  map: PropTypes.object,
  onClickModal: PropTypes.func,
  onFieldChange: PropTypes.func.isRequired,
  places: PropTypes.object,
  router: PropTypes.object,
  showValidityStatus: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
  updateSpotlightMaskVisibility: PropTypes.func.isRequired,
  updateMapInteractionState: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.string,
    PropTypes.bool,
    PropTypes.object,
  ]),
};

FormField.defaultProps = {
  attachments: [],
};

const mapStateToProps = state => ({
  isEditModeToggled: isEditModeToggled(state),
});

const mapDispatchToProps = dispatch => ({
  updateMapInteractionState: newInteractionState =>
    dispatch(updateMapInteractionState(newInteractionState)),
  updateSpotlightMaskVisibility: isVisible =>
    dispatch(updateUIVisibility("spotlightMask", isVisible)),
});

export default withTheme(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(withTranslation("FormField")(FormField)),
);

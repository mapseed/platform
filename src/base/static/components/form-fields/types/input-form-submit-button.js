/** @jsx jsx */
import React from "react";
import PropTypes from "prop-types";
import { css, jsx } from "@emotion/core";
import { withTheme } from "emotion-theming";
import { withTranslation } from "react-i18next";

import { Button } from "../../atoms/buttons";

const InputFormSubmitButton = props => {
  return (
    <Button
      css={css`
        font-family: ${props.theme.text.bodyFontFamily};
      `}
      size="medium"
      color="primary"
      variant="raised"
      name={props.name}
      disabled={props.disabled}
      onClick={props.onClickSubmit}
    >
      {props.t("inputFormSubmitButtonLabel", props.label)}
    </Button>
  );
};

InputFormSubmitButton.propTypes = {
  disabled: PropTypes.bool,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onClickSubmit: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withTheme(
  withTranslation("InputFormSubmitButton")(InputFormSubmitButton),
);

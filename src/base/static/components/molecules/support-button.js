/** @jsx jsx */
import React from "react";
import PropTypes from "prop-types";
import { css, jsx } from "@emotion/core";
import { withTheme } from "emotion-theming";
import { connect } from "react-redux";

import { Button } from "../atoms/buttons";
import { supportConfigSelector } from "../../state/ducks/support-config";

const SupportButton = props => {
  return (
    <Button
      css={css`
        margin-bottom: 8px;
        padding: 5px 10px 5px 10px;
        font-family: ${props.theme.text.bodyFontFamily};
        font-size: 12px;

        &:before {
          padding-right: 8px;
          font-family: FontAwesome;
          content: "\\F004";
          font-size: 12px;
          color: ${props.isSupported ? "#d24444" : "#d1e2ec"};
        }
      `}
      size="small"
      color="secondary"
      variant="raised"
      onClick={props.onClickSupport}
    >
      {props.numSupports || ""} {props.supportConfig.submit_btn_text}
    </Button>
  );
};

SupportButton.propTypes = {
  className: PropTypes.string,
  isSupported: PropTypes.bool.isRequired,
  numSupports: PropTypes.number,
  onClickSupport: PropTypes.func.isRequired,
  supportConfig: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  supportConfig: supportConfigSelector(state),
});

export default withTheme(connect(mapStateToProps)(SupportButton));

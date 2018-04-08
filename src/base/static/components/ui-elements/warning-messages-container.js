import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { WarningMessage } from "../atoms/typography";

import { translate } from "react-i18next";

import "./warning-messages-container.scss";

const WarningMessagesContainer = props => {
  return (
    <section
      className={classNames("warning-messages-container", {
        "warning-messages-container--visible": props.errors.length > 0,
      })}
    >
      <p className={"warning-messages-container__header"}>{props.headerMsg}</p>
      {props.errors.map((errorMsg, i) => (
        <WarningMessage key={i}>{props.t(errorMsg)}</WarningMessage>
      ))}
    </section>
  );
};

WarningMessagesContainer.propTypes = {
  errors: PropTypes.array,
  headerMsg: PropTypes.string,
  t: PropTypes.func.isRequired,
};

export default translate("WarningMessagesContainer")(WarningMessagesContainer);

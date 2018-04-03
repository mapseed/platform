import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { ErrorMessage } from "../atoms/typography";

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
        <ErrorMessage key={i}>{props.t(errorMsg)}</ErrorMessage>
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

import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./warning-messages-container.scss";

const WarningMessagesContainer = props => {
  return (
    <section
      className={classNames("warning-messages-container", {
        "warning-messages-container--visible": props.errors.length > 0,
      })}
    >
      <p className={"input-form__warning-msgs-header"}>{props.headerMsg}</p>
      {props.errors.map((errorMsg, i) => (
        <p key={i} className={"warning-messages-container__warning-msg"}>
          {errorMsg}
        </p>
      ))}
    </section>
  );
};

WarningMessagesContainer.propTypes = {
  errors: PropTypes.array,
  headerMsg: PropTypes.string,
};

export default WarningMessagesContainer;

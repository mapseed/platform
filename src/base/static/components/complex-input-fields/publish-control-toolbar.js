import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import BigRadioField from "../complex-input-fields/big-radio-field";
import { publishControlToolbar as messages } from "../messages";

import "./publish-control-toolbar.scss";

const PublishControlToolbar = props => {
  const footerMsg =
    props.publishedState === "isPublished"
      ? messages.publishedFooterMsg
      : messages.notPublishedFooterMsg;

  return (
    <div className="publish-control-toolbar">
      <div className="publish-control-toolbar__buttons-container">
        <BigRadioField
          value="isPublished"
          label={messages.publishedLabel}
          id={"input-form-" + props.name + "-isPublished"}
          name={props.name}
          value="isPublished"
          checked={props.publishedState === "isPublished"}
          onChange={props.onChange}
        />
        <BigRadioField
          value="isNotPublished"
          label={messages.notPublishedLabel}
          id={"input-form-" + props.name + "-isNotPublished"}
          name={props.name}
          value="isNotPublished"
          checked={props.publishedState === "isNotPublished"}
          onChange={props.onChange}
        />
      </div>
      <p className="publish-control-toolbar__footer-message">
        <em>{footerMsg}</em>
      </p>
    </div>
  );
};

PublishControlToolbar.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  published: PropTypes.string.isRequired,
};

PublishControlToolbar.defaultProps = {
  published: "isPublished",
};

export default PublishControlToolbar;

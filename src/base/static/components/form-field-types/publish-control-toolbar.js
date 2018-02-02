import React from "react";
import PropTypes from "prop-types";

import BigRadioField from "../form-field-types/big-radio-field";
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
          checked={props.publishedState === "isPublished"}
          onChange={props.onChange}
        />
        <BigRadioField
          value="isNotPublished"
          label={messages.notPublishedLabel}
          id={"input-form-" + props.name + "-isNotPublished"}
          name={props.name}
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
  publishedState: PropTypes.string.isRequired,
};

PublishControlToolbar.defaultProps = {
  publishedState: "isPublished",
};

export default PublishControlToolbar;

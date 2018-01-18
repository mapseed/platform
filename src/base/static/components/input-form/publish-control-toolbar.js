import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import BigRadioField from "../input-form/big-radio-field";
import { publishControlToolbar as messages } from "../messages";

import "./publish-control-toolbar.scss";

const PublishControlToolbar = props => {
  const { name, onChange, published } = props;
  const footerMsg =
    published === "isPublished"
      ? messages.publishedFooterMsg
      : messages.notPublishedFooterMsg;

  return (
    <div className="publish-control-toolbar">
      <div className="publish-control-toolbar__buttons-container">
        <BigRadioField
          value="isPublished"
          label={messages.publishedLabel}
          id={"input-form-" + name + "-isPublished"}
          name={name}
          value="isPublished"
          checked={published === "isPublished"}
          onChange={onChange}
        />
        <BigRadioField
          value="isNotPublished"
          label={messages.notPublishedLabel}
          id={"input-form-" + name + "-isNotPublished"}
          name={name}
          value="isNotPublished"
          checked={published === "isNotPublished"}
          onChange={onChange}
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

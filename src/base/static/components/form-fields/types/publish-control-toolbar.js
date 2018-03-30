import React from "react";
import PropTypes from "prop-types";

import BigRadioField from "./big-radio-field";
import messages from "../messages";

import "./publish-control-toolbar.scss";

const PublishControlToolbar = props => {
  const footerMsg =
    props.publishedState === "isPublished"
      ? messages("fields:publishControlToolbar:publishedFooterMsg")
      : messages("fields:publishControlToolbar:notPublishedFooterMsg");

  return (
    <div className="publish-control-toolbar">
      <div className="publish-control-toolbar__buttons-container">
        <BigRadioField
          value="isPublished"
          label={messages("fields:publishControlToolbar:publishedLabel")}
          id={"input-form-" + props.name + "-isPublished"}
          name={props.name}
          checked={props.publishedState === "isPublished"}
          onChange={props.onChange}
        />
        <BigRadioField
          value="isNotPublished"
          label={messages("fields:publishControlToolbar:notPublishedLabel")}
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

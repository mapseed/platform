import React from "react";
import PropTypes from "prop-types";

import BigRadioField from "./big-radio-field";
import { translate } from "react-i18next";

import "./publish-control-toolbar.scss";

const PublishControlToolbar = props => {
  const footerMsg =
    props.publishedState === "isPublished"
      ? "publishedFooterMsg"
      : "notPublishedFooterMsg";

  return (
    <div className="publish-control-toolbar">
      <div className="publish-control-toolbar__buttons-container">
        <BigRadioField
          value="isPublished"
          label={props.t("PublishControlToolbar:publishedLabel")}
          id={"input-form-" + props.name + "-isPublished"}
          name={props.name}
          checked={props.publishedState === "isPublished"}
          onChange={props.onChange}
        />
        <BigRadioField
          value="isNotPublished"
          label={props.t("notPublishedLabel")}
          id={"input-form-" + props.name + "-isNotPublished"}
          name={props.name}
          checked={props.publishedState === "isNotPublished"}
          onChange={props.onChange}
        />
      </div>
      <p className="publish-control-toolbar__footer-message">
        <em>{props.t(footerMsg)}</em>
      </p>
    </div>
  );
};

PublishControlToolbar.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  publishedState: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

PublishControlToolbar.defaultProps = {
  publishedState: "isPublished",
};

export default translate("PublishControlToolbar")(PublishControlToolbar);

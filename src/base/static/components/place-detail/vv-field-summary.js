import React from "react";
import PropTypes from "prop-types";

import { Header5, Paragraph } from "../atoms/typography";

import "./vv-field-summary.scss";

// TODO: i18n when flavor abstraction is ready

const VVFieldSummary = props => {
  return (
    <div className="vv-field-summary">
      <hr />
      <Header5 classes="vv-field-summary__toggle-response">
        {props.placeModel.get("regular_user") === "yes"
          ? "I am a regular user of this garden"
          : "I am not a regular user of this garden"}
      </Header5>
      <Header5 classes="vv-field-summary__toggle-response">
        {props.placeModel.get("children_at_home") === "yes"
          ? "I have children at home"
          : "I do not have children at home"}
      </Header5>
      <Paragraph classes="vv-field-summary__description-response">
        {props.placeModel.get("input_text")}
      </Paragraph>
    </div>
  );
};

VVFieldSummary.propTypes = {
  fields: PropTypes.array.isRequired,
  placeModel: PropTypes.object.isRequired,
};

export default VVFieldSummary;

import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";

import fieldResponseFilter from "../../utils/field-response-filter";
import { RegularTitle, RegularText } from "../atoms/typography";
import { HorizontalRule } from "../atoms/layout";
import CoverImage from "../molecules/cover-image";

import constants from "../../constants";

const ActionSummary = styled("ul")({
  padding: 0,
});

const ActionSummaryItem = styled("li")(props => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: props.idx % 2 === 0 ? "#fff8ea" : "#fff",
  padding: "8px 4px 8px 4px",
}));

const SnohomishFieldSummary = props => {
  const fieldConfigs = fieldResponseFilter(
    props.fields,
    props.placeModel,
  ).filter(fieldConfig => props.placeModel.get(fieldConfig.name) === "yes");
  const numActions = fieldConfigs.length;

  return (
    <div>
      <RegularTitle>{numActions} Actions</RegularTitle>
      <HorizontalRule spacing="tiny" />
      {props.attachmentModels
        .filter(
          attachment =>
            attachment.get(constants.ATTACHMENT_TYPE_PROPERTY_NAME) ===
            constants.COVER_IMAGE_CODE,
        )
        .map((attachmentModel, i) => (
          <CoverImage
            key={i}
            imageUrl={attachmentModel.get(
              constants.ATTACHMENT_FILE_PROPERTY_NAME,
            )}
          />
        ))}
      <ActionSummary>
        {fieldConfigs.map((fieldConfig, idx) => {
          const actionQuantityConfig =
            props.fields.find(
              field => field.name === `${fieldConfig.name}_quantity`,
            ) || {};

          return (
            <ActionSummaryItem key={fieldConfig.name} idx={idx}>
              <RegularText>{fieldConfig.label}</RegularText>
              <RegularText>
                {props.placeModel.get(actionQuantityConfig.name)}{" "}
                {actionQuantityConfig.metadata &&
                  actionQuantityConfig.metadata.units}
              </RegularText>
            </ActionSummaryItem>
          );
        })}
      </ActionSummary>
    </div>
  );
};

SnohomishFieldSummary.propTypes = {
  attachmentModels: PropTypes.object.isRequired,
  fields: PropTypes.array.isRequired,
  placeModel: PropTypes.object.isRequired,
};

export default SnohomishFieldSummary;

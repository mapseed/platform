/** @jsx jsx */
import React from "react";
import PropTypes from "prop-types";
import { css, jsx } from "@emotion/core";
import styled from "@emotion/styled";

import fieldResponseFilter from "../../utils/field-response-filter";
import { TinyTitle, RegularTitle, RegularText } from "../atoms/typography";
import { HorizontalRule } from "../atoms/layout";
import CoverImage from "../molecules/cover-image";

import { placePropType } from "../../state/ducks/places";

const ActionSummary = styled("ul")({
  padding: 0,
  marginTop: "32px",
});

const ActionSummaryItem = styled("li")(props => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: props.idx % 2 === 0 ? "#fff8ea" : "#fff",
  padding: "8px 4px 8px 4px",
}));

const Subheader = styled(RegularText)`
  font-weight: 800;
  font-style: italic;
  margin-top: 0;
`;

const excludedFields = ["share_photos", "contact_interest", "private", "vsp_status"];

const SnohomishFieldSummary = props => {
  const fieldConfigs = fieldResponseFilter(props.fields, props.place).filter(
    fieldConfig =>
      props.place[fieldConfig.name] === "yes" &&
      !excludedFields.includes(fieldConfig.name),
  );
  const numActions = fieldConfigs.length;
  const description =
    props.place.practices_description &&
    props.place.practices_description.split("\n");
  const challenges =
    props.place.stewardship_difficulties &&
    props.place.stewardship_difficulties.split("\n");
  // WRIA for Whitman, WAU for Garfield
  const watershedValue = props.place.wria || props.place.analysis_unit;
  const watershedLabel = props.fields
    .find(({ name }) => name === "wria" || name === "analysis_unit")
    ?.content?.find(({ value }) => value === watershedValue)?.label;

  return (
    <div>
      <RegularTitle>{numActions} Stewardship Actions</RegularTitle>
      {watershedLabel && (
        <Subheader>
          For {watershedLabel}{" "}
          {!watershedLabel.endsWith("Watershed") && "Watershed"}
        </Subheader>
      )}
      <HorizontalRule spacing="small" />
      {props.place.attachments
        .filter(attachment => attachment.type === "CO")
        .map((attachment, i) => (
          <CoverImage key={i} imageUrl={attachment.file} />
        ))}
      {description &&
        description.map((p, idx) => (
          <RegularText
            css={css`
              display: block;
              margin-bottom: 8px;
            `}
            key={idx}
          >
            {p}
          </RegularText>
        ))}
      {challenges && (
        <React.Fragment>
          <TinyTitle>Challenges:</TinyTitle>
          {challenges.map((p, idx) => (
            <RegularText
              css={css`
                display: block;
                margin-bottom: 8px;
              `}
              key={idx}
            >
              {p}
            </RegularText>
          ))}
        </React.Fragment>
      )}
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
                {props.place[actionQuantityConfig.name]}{" "}
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
  fields: PropTypes.array.isRequired,
  place: placePropType.isRequired,
};

export default SnohomishFieldSummary;

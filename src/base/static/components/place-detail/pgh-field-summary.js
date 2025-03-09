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

const CompressedTinyTitle = styled(TinyTitle)({
  marginTop: "0px",
});

const ActionSummary = styled("ul")({
  listStyleType: "none",
  marginTop: "0px",
  paddingLeft: "8px",
});

const ActionSummaryItem = styled("li")(props => ({
  color: "#333",
  padding: "8px 4px 8px 4px",
}));

const ActionSummarySubItem = styled("li")(props => ({
  listStyleType: "none",
  padding: "0px 4px 8px 16px",
  fontStyle: "italic",
}));

const ActionSummarySubItemBulleted = styled(ActionSummarySubItem)(props => ({
  listStyleType: "disc",
  listStylePosition: "inside",
}));

const Subheader = styled(RegularText)`
  font-weight: 800;
  font-style: italic;
  margin-top: 0;
`;

const EXCLUDED_FIELDS = [
  "share_photos",
  "contact_interest",
  "private",
  "vsp_status",
];

const FUNDING_FIELDS = [
  "forestry_project_funding",
  "watershed_project_funding",
  "agriculture_project_funding",
  "education_outreach_funding",
];

const INVASIVE_SPECIES_FIELDS = [
  "forestry_invasive_species_type",
  "watershed_invasive_species_type",
  "agriculture_invasive_species_type",
];

const INVASIVE_SPECIES_OTHER_FIELDS = [
  "forestry_invasive_species_type_other",
  "watershed_invasive_species_type_other",
  "agriculture_invasive_species_type_other",
];

const PGHFieldSummary = props => {
  const fieldConfigs = fieldResponseFilter(props.fields, props.place).filter(
    fieldConfig =>
      props.place[fieldConfig.name] === "yes" &&
      !EXCLUDED_FIELDS.includes(fieldConfig.name),
  );
  const fundingSourceConfigs = fieldResponseFilter(
    props.fields,
    props.place,
  ).filter(fieldConfig => FUNDING_FIELDS.includes(fieldConfig.name));
  const fundingSources = fundingSourceConfigs.map(fundingConfig => {
    return props.place[fundingConfig.name].map(
      source => fundingConfig.content.find(item => item.value === source).label,
    );
  });
  const fundingSourceItems = fundingSources
    .flat(1)
    .map(source => (
      <ActionSummarySubItemBulleted>{source}</ActionSummarySubItemBulleted>
    ));

  const invasiveSpeciesConfigs = fieldResponseFilter(
    props.fields,
    props.place,
  ).filter(fieldConfig => INVASIVE_SPECIES_FIELDS.includes(fieldConfig.name));
  const invasiveSpeciesTypes = invasiveSpeciesConfigs.map(speciesConfig => {
    return props.place[speciesConfig.name].map(
      source => speciesConfig.content.find(item => item.value === source).label,
    );
  });
  const invasiveSpeciesOtherConfigs = fieldResponseFilter(
    props.fields,
    props.place,
  ).filter(fieldConfig =>
    INVASIVE_SPECIES_OTHER_FIELDS.includes(fieldConfig.name),
  );
  const invasiveSpeciesOtherTypes = invasiveSpeciesOtherConfigs.map(
    otherConfig => props.place[otherConfig.name],
  );

  const invasiveSpeciesItems = invasiveSpeciesTypes
    .flat(1)
    .concat(invasiveSpeciesOtherTypes)
    .map(species => (
      <ActionSummarySubItemBulleted>{species}</ActionSummarySubItemBulleted>
    ));

  const numActions = fieldConfigs.length;

  return (
    <div>
      <RegularTitle>
        {numActions} Stewardship Action{numActions > 1 && "s"}
      </RegularTitle>
      <HorizontalRule spacing="small" />
      <ActionSummary>
        {fieldConfigs.map((fieldConfig, idx) => {
          const actionQuantityConfig = props.fields.find(
            field => field.name === `${fieldConfig.name}_quantity`,
          );
          const actionAcresQuantityConfig = props.fields.find(
            field => field.name === `${fieldConfig.name}_acres_quantity`,
          );
          const datetimeConfig = props.fields.find(
            field => field.name === `${fieldConfig.name}_datetime`,
          );
          const datetimeMsg = datetimeConfig
            ? `Completed: ${props.place[datetimeConfig.name]}`
            : "";
          const quantityMsg = actionQuantityConfig
            ? `Quantity: ${props.place[actionQuantityConfig.name]} ${
                actionQuantityConfig.metadata &&
                actionQuantityConfig.metadata.units
              }`
            : "";
          const acreageMsg = actionAcresQuantityConfig
            ? `Acreage impacted: ${
                props.place[actionAcresQuantityConfig.name]
              } acres`
            : "";

          return (
            <ActionSummaryItem key={fieldConfig.name} idx={idx}>
              <CompressedTinyTitle>
                Practice: {fieldConfig.label}
              </CompressedTinyTitle>
              {datetimeMsg && (
                <ActionSummarySubItem>
                  <RegularText>{datetimeMsg}</RegularText>
                </ActionSummarySubItem>
              )}
              {quantityMsg && (
                <ActionSummarySubItem>
                  <RegularText>{quantityMsg}</RegularText>
                </ActionSummarySubItem>
              )}
              {acreageMsg && (
                <ActionSummarySubItem>
                  <RegularText>{acreageMsg}</RegularText>
                </ActionSummarySubItem>
              )}
            </ActionSummaryItem>
          );
        })}
      </ActionSummary>
      {invasiveSpeciesItems.length > 0 && (
        <ActionSummary>
          <TinyTitle>Invasive Species Treated:</TinyTitle>
          {invasiveSpeciesItems}
        </ActionSummary>
      )}
      {fundingSourceItems.length > 0 && (
        <ActionSummary>
          <TinyTitle>Funding Sources Used:</TinyTitle>
          {fundingSourceItems}
        </ActionSummary>
      )}
      {props.place.attachments
        .filter(attachment => attachment.type === "CO")
        .map((attachment, i) => (
          <CoverImage key={i} imageUrl={attachment.file} />
        ))}
    </div>
  );
};

PGHFieldSummary.propTypes = {
  fields: PropTypes.array.isRequired,
  place: placePropType.isRequired,
};

export default PGHFieldSummary;

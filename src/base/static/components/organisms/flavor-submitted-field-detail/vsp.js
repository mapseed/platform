/** @jsx jsx */
import React from "react";
import PropTypes from "prop-types";
import { css, jsx } from "@emotion/core";
import styled from "@emotion/styled";

import { TinyTitle, RegularTitle, RegularText } from "../../atoms/typography";
import { HorizontalRule } from "../../atoms/layout";
import CoverImage from "../../molecules/cover-image";

import { placePropType } from "../../../state/ducks/places";

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

const SnohomishFieldSummary = ({ formModules, place }) => {
  const actionFields = formModules.filter(
    ({ key, type }) => place[key] === "yes" && type === "radiofield",
  );
  const numActions = actionFields.length;
  const description =
    place.practices_description && place.practices_description.split("\n");
  const challenges =
    place.stewardship_difficulties &&
    place.stewardship_difficulties.split("\n");

  return (
    <div>
      <RegularTitle>{numActions} Stewardship Actions</RegularTitle>
      <HorizontalRule spacing="small" />
      {place.attachments
        .filter(({ type }) => type === "CO")
        .map(({ file }) => (
          <CoverImage key={file} imageUrl={file} />
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
        {actionFields.map(({ key: actionFieldKey, label }, idx) => {
          const { key: actionQuantityFieldKey, units } =
            formModules.find(
              ({ key }) => key === `${actionFieldKey}_quantity`,
            ) || {};

          return (
            <ActionSummaryItem key={actionFieldKey} idx={idx}>
              <RegularText>{label}</RegularText>
              <RegularText>
                {place[actionQuantityFieldKey]} {units ? units : ""}
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

/** @jsx jsx */
import * as React from "react";
import PropTypes from "prop-types";
import { css, jsx } from "@emotion/core";

import fieldResponseFilter from "../../utils/field-response-filter";
import { LargeText, RegularText } from "../atoms/typography";
import CoverImage from "../molecules/cover-image";

import { placePropType } from "../../state/ducks/places";

const KittitasFireReadyFieldSummary = props => {
  const fieldConfigs = fieldResponseFilter(props.fields, props.place).filter(
    fieldConfig => props.place[fieldConfig.name] === "yes",
  );
  const totalActions = fieldConfigs.length;

  return (
    <>
      <div
        css={css`
          margin-top: 16px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          padding-bottom: 16px;
          border-bottom: 1px solid #ccc;
        `}
      >
        <span
          css={css`
            width: 24px;
            height: 24px;
            color: #fff;
            font-family: PTSansBold, sans-serif;
            font-size: 2rem;
            padding: 16px;
            background-color: #e57c03;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        >
          {totalActions}{" "}
        </span>
        <LargeText
          css={css`
            display: inline-block;
            margin-left: 16px;
            color: #222;
            text-transform: uppercase;
            font-weight: 900;
          `}
        >
          wildfire prevention actions
        </LargeText>
      </div>
      {props.place.attachments
        .filter(attachment => attachment.type === "CO")
        .map((attachment, i) => (
          <CoverImage key={i} imageUrl={attachment.file} />
        ))}
      <ul
        css={css`
          padding: 0;
          margin-top: 32px;
        `}
      >
        {fieldConfigs.map((fieldConfig, i) => {
          return (
            <li
              css={css`
                display: flex;
                align-items: center;
                justify-content: space-between;
                background-color: ${i % 2 === 0 ? "#fff8ea" : "#fff"};
                padding: 8px 4px 8px 4px;
              `}
              key={fieldConfig.name}
            >
              <RegularText>{fieldConfig.label}</RegularText>
            </li>
          );
        })}
      </ul>
    </>
  );
};

KittitasFireReadyFieldSummary.propTypes = {
  fields: PropTypes.array.isRequired,
  place: placePropType.isRequired,
};

export default KittitasFireReadyFieldSummary;

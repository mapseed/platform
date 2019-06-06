/** @jsx jsx */
import React from "react";
import { jsx, css } from "@emotion/core";
import PropTypes from "prop-types";

import ChartWrapper from "./chart-wrapper";
import { RegularText, LargeTitle } from "../../atoms/typography";

const getStatSummaryData = ({ dataset, widget }) => {
  return widget.rows.map(row => {
    if (row.type === "placeCount") {
      return {
        ...row,
        total: dataset.length,
      };
    } else if (row.type === "supportCount") {
      return {
        ...row,
        total: dataset.reduce((count, place) => {
          if (place.submission_sets.support) {
            count += place.submission_sets.support.length;
          }
          return count;
        }, 0),
      };
    } else if (row.type === "commentCount") {
      return {
        ...row,
        total: dataset.reduce((count, place) => {
          if (place.submission_sets.comments) {
            count += place.submission_sets.comments.length;
          }
          return count;
        }, 0),
      };
    }
  });
};

const StatSummary = props => {
  return (
    <ChartWrapper layout={props.layout}>
      {props.data.map(row => (
        <div
          key={row.label}
          css={css`
            padding-left: 16px;
            padding-right: 16px;
            display: flex;
            justify-content: space-between;
            align-items: baseline;
          `}
        >
          <RegularText
            css={css`
              color: #888;
            `}
            textTransform="uppercase"
          >
            {row.label}
          </RegularText>
          <LargeTitle>{row.total}</LargeTitle>
        </div>
      ))}
    </ChartWrapper>
  );
};

StatSummary.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      total: PropTypes.number.isRequired,
    }),
  ),
  layout: PropTypes.shape({
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
  }).isRequired,
};

export { StatSummary, getStatSummaryData };

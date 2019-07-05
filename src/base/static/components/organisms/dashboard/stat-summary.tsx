/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import PropTypes from "prop-types";

import ChartWrapper from "./chart-wrapper";
import { RegularText, LargeTitle } from "../../atoms/typography";

const statSummaryPropTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      total: PropTypes.number.isRequired,
    }).isRequired,
  ).isRequired,
  header: PropTypes.string.isRequired,
  layout: PropTypes.shape({
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
  }).isRequired,
};

type Props = PropTypes.InferProps<typeof statSummaryPropTypes>;

const getStatSummaryData = ({ places, widget }) => {
  return widget.rows.map(row => {
    if (row.type === "placeCount") {
      return {
        ...row,
        total: places.length,
      };
    } else if (row.type === "supportCount") {
      return {
        ...row,
        total: places.reduce((count, place) => {
          if (place.submission_sets.support) {
            count += place.submission_sets.support.length;
          }

          return count;
        }, 0),
      };
    } else if (row.type === "commentCount") {
      return {
        ...row,
        total: places.reduce((count, place) => {
          if (place.submission_sets.comments) {
            count += place.submission_sets.comments.length;
          }

          return count;
        }, 0),
      };
    } else if (row.type === "placePropertyCount") {
      const propertiesArray = Object.entries(row.properties);

      return {
        ...row,
        total: places.reduce((totalCount, place) => {
          const numProperties = propertiesArray.reduce(
            (placeCount, [property, value]) => {
              if (place[property] && place[property] === value) {
                return placeCount + 1;
              }

              return placeCount;
            },
            0,
          );

          return totalCount + numProperties;
        }, 0),
      };
    } else {
      // eslint-disable-next-line no-console
      console.error(`Error: unknown StatSummary row type: ${row.type}`);
    }
  });
};

const StatSummary = (props: Props) => {
  return (
    <React.Fragment>
      {props.data.map(row => (
        <div
          key={row.label}
          css={css`
            margin-top: 32px;
            padding-left: 16px;
            padding-right: 16px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
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
          <LargeTitle
            css={css`
              margin: 0;
            `}
          >
            {row.total}
          </LargeTitle>
        </div>
      ))}
    </React.Fragment>
  );
};

export { StatSummary, getStatSummaryData };

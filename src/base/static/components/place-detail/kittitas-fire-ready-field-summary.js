/** @jsx jsx */
import React from "react";
import PropTypes from "prop-types";
import { css, jsx } from "@emotion/core";

import { LargeText } from "../atoms/typography";
import CoverImage from "../molecules/cover-image";

import { placePropType } from "../../state/ducks/places";

const KittitasFireReadyFieldSummary = props => {
  const numVegetationActions = [
    "clear_vegetation",
    "mow_to_four_inches",
    "remove_ladder_fuels",
    "space_trees",
    "tree_placement",
    "small_tree_clusters",
    "dispose_ground_debris",
    "remove_dead_material",
    "remove_small_conifers",
    "remove_outbuilding_vegetation",
    "space_canopy_tops_30_60_feet",
    "space_canopy_tops_60_100_feet",
  ].filter(action => props.place[action] === "yes").length;
  const numBuildingActions = [
    "clean_roofs",
    "replace_shingles",
    "reduce_embers",
    "clean_debris_attic_vents",
    "repair_screens",
    "create_fuel_breaks",
    "move_flammable_material",
  ].filter(action => props.place[action] === "yes").length;
  const totalActions = numVegetationActions + numBuildingActions;

  return (
    <>
      {totalActions > 0 && (
        <div
          css={css`
            margin-top: 16px;
            margin-left: 32px;
            margin-bottom: 32px;
            display: flex;
            align-items: center;
          `}
        >
          <span
            css={css`
              width: 36px;
              color: #fff;
              font-family: PTSansBold, sans-serif;
              font-size: 2rem;
              padding: 16px;
              background-color: #e57c03;
              border-radius: 50%;
              text-align: center;
            `}
          >
            {totalActions}{" "}
          </span>
          <LargeText
            css={css`
              display: inline-block;
              margin-left: 16px;
              color: #888;
            `}
          >
            wildfire prevention actions
          </LargeText>
        </div>
      )}
      {props.place.attachments
        .filter(attachment => attachment.type === "CO")
        .map((attachment, i) => (
          <CoverImage key={i} imageUrl={attachment.file} />
        ))}
    </>
  );
};

KittitasFireReadyFieldSummary.propTypes = {
  fields: PropTypes.array.isRequired,
  place: placePropType.isRequired,
};

export default KittitasFireReadyFieldSummary;

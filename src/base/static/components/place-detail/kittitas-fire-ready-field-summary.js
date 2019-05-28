import React from "react";
import PropTypes from "prop-types";

import { SmallTitle } from "../atoms/typography";
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

  return (
    <div>
      {props.place.attachments
        .filter(attachment => attachment.type === "CO")
        .map((attachment, i) => (
          <CoverImage key={i} imageUrl={attachment.file} />
        ))}
      {numVegetationActions > 0 && (
        <SmallTitle>
          Number of Wildfire Prevention Actions:{" "}
          {numVegetationActions + numBuildingActions}
        </SmallTitle>
      )}
    </div>
  );
};

KittitasFireReadyFieldSummary.propTypes = {
  fields: PropTypes.array.isRequired,
  place: placePropType.isRequired,
};

export default KittitasFireReadyFieldSummary;

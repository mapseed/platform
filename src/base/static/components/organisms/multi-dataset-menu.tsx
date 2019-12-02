import * as React from "react";
import { useSelector } from "react-redux";

import { datasetsWithCreatePlacesAbilitySelector } from "../../state/ducks/user";

const MultiDatasetMenu = () => {
  const datasetsWithCreatePlacesAbility = useSelector(
    datasetsWithCreatePlacesAbilitySelector,
  );

  return (
    <React.Fragment>
      {datasetsWithCreatePlacesAbility.map(({ url }) => (
        <p>{url}</p>
      ))}
    </React.Fragment>
  );
};

export default MultiDatasetMenu;

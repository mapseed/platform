import * as React from "react";
import { useSelector } from "react-redux";

import { datasetsWithCreatePlacesAbilitySelector } from "../../state/ducks/user";
import { placeFormIdSelector } from "../../state/ducks/forms";

const MultiDatasetMenu = () => {
  const datasetsWithCreatePlacesAbility = useSelector(
    datasetsWithCreatePlacesAbilitySelector,
  );

  return (
    <React.Fragment>
      {datasetsWithCreatePlacesAbility.map(({ url }) => (
        <div>
          <p>{url}</p>
          <p>{useSelector((state: any) => placeFormIdSelector(state, url))}</p>
        </div>
      ))}
    </React.Fragment>
  );
};

export default MultiDatasetMenu;

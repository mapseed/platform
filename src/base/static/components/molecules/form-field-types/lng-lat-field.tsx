import * as React from "react";

import { MapViewport } from "../../../state/ducks/map-config";

type Props = {
  onChange: Function;
  viewport: MapViewport;
  name: string;
  isMapTransitioning: boolean;
};

const LngLatField: React.FunctionComponent<Props> = props => {
  const isFirstUpdate = React.useRef(true);

  React.useEffect(
    () => {
      if (isFirstUpdate.current) {
        isFirstUpdate.current = false;
        return;
      }

      if (props.isMapTransitioning) {
        return;
      }

      props.onChange(props.name, [
        props.viewport.longitude,
        props.viewport.latitude,
      ]);
    },
    [props.viewport],
  );

  return null;
};

export default LngLatField;

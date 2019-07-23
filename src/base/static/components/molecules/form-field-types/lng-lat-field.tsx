import * as React from "react";
import { connect } from "react-redux";

import {
  mapViewportSelector,
  isMapTransitioning,
  MapViewport,
} from "../../../state/ducks/map";

type OwnProps = {
  onChange: Function;
  name: string;
};

type StateProps = {
  isMapTransitioning: boolean;
  mapViewport: MapViewport;
};

type Props = OwnProps & StateProps;

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
        props.mapViewport.longitude,
        props.mapViewport.latitude,
      ]);
    },
    [props.mapViewport],
  );

  return null;
};

const mapStateToProps = (state): StateProps => ({
  isMapTransitioning: isMapTransitioning(state),
  mapViewport: mapViewportSelector(state),
});

export default connect<StateProps>(mapStateToProps)(LngLatField);

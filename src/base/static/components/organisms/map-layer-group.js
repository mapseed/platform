import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classNames from "classnames";

import { HorizontalRule } from "../atoms/misc";
import { Header5 } from "../atoms/typography";

import { mapConfigSelector } from "../../state/ducks/map-config";
import {
  setLayerStatus,
  setBasemap,
  mapLayersStatusSelector,
  mapBasemapSelector,
} from "../../state/ducks/map";
import MapLayerSelector from "../molecules/map-layer-selector";

const MapLayerGroup = props => {
  return (
    <div className={classNames(props.classes, "map-layer-group")}>
      <HorizontalRule />
      <Header5>{props.title}</Header5>
      {props.layers.map(layer => {
        const isBasemap = !!props.mapConfig.layers.find(
          layerConfig => layerConfig.id === layer.id,
        ).isBasemap;
        const layerStatus = props.layersStatus[layer.id];

        return (
          <MapLayerSelector
            key={layer.id}
            layerId={layer.id}
            info={layer.info}
            title={layer.title}
            layerStatus={props.layersStatus[layer.id]}
            selected={!!(layerStatus && layerStatus.isVisible)}
            onToggleLayer={layerId => {
              if (isBasemap && layerStatus && layerStatus.isVisible) {
                // If the user clicked on the basemap that is already
                // visible, do nothing.
                return;
              } else if (isBasemap) {
                // If the user clicked on a basemap and there is already a
                // visible basemap, turn the old basemap off.
                props.visibleBasemapId &&
                  props.setLayerStatus(props.visibleBasemapId, {
                    isVisible: false,
                  });
                // Switch the new basemap on.
                props.setBasemap(layerId);
                props.setLayerStatus(layerId, {
                  status: "loading",
                  isVisible: true,
                  isBasemap: true,
                });
              } else {
                // Otherwise, toggle the selected layer.
                props.setLayerStatus(layerId, {
                  status: "loading",
                  isVisible:
                    layerStatus === undefined ? true : !layerStatus.isVisible,
                });
              }
            }}
          />
        );
      })}
    </div>
  );
};

MapLayerGroup.propTypes = {
  classes: PropTypes.string,
  mapConfig: PropTypes.shape({
    layers: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        url: PropTypes.string,
        info: PropTypes.string,
        source: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        slug: PropTypes.string,
        rules: PropTypes.arrayOf(
          PropTypes.shape({
            filter: PropTypes.array,
            "symbol-layout": PropTypes.object,
            "symbol-paint": PropTypes.object,
            "line-layout": PropTypes.object,
            "line-paint": PropTypes.object,
            "fill-layout": PropTypes.object,
            "fill-paint": PropTypes.object,
          }),
        ),
      }),
    ),
  }),
  grouping: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string,
    }),
  ),
  layers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      visible_default: PropTypes.bool,
    }),
  ),
  layersStatus: PropTypes.shape({
    isBasemap: PropTypes.bool,
    isVisible: PropTypes.bool,
    status: PropTypes.string,
  }),
  title: PropTypes.string,
};

const mapStateToProps = state => ({
  mapConfig: mapConfigSelector(state),
  layersStatus: mapLayersStatusSelector(state),
  visibleBasemapId: mapBasemapSelector(state),
});

const mapDispatchToProps = dispatch => ({
  setLayerStatus: (layerId, layerStatus) =>
    dispatch(setLayerStatus(layerId, layerStatus)),
  setBasemap: layerId => dispatch(setBasemap(layerId)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapLayerGroup);

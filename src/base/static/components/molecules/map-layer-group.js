import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classNames from "classnames";

import { HorizontalRule } from "../atoms/layout";
import { Header5 } from "../atoms/typography";

import { mapConfigSelector } from "../../state/ducks/map-config";
import {
  setLayerStatus,
  setBasemap,
  mapLayerStatusesSelector,
  mapBasemapSelector,
} from "../../state/ducks/map";
import MapLayerSelector from "./map-layer-selector";

const MapLayerGroup = props => {
  return (
    <div className={classNames(props.classes, "map-layer-group")}>
      <HorizontalRule />
      <Header5>{props.title}</Header5>
      {props.layers.map(layer => {
        const isBasemap = !!props.mapConfig.layers.find(
          layerConfig => layerConfig.id === layer.id,
        ).is_basemap;
        const layerType = props.mapConfig.layers.find(
          layerConfig => layerConfig.id === layer.id,
        ).type;
        const layerStatus = props.layerStatuses[layer.id];

        return (
          <MapLayerSelector
            key={layer.id}
            layerId={layer.id}
            icon={layer.icon}
            info={layer.info}
            title={layer.title}
            layerStatus={props.layerStatuses[layer.id]}
            selected={!!(layerStatus && layerStatus.isVisible)}
            onToggleLayer={layerId => {
              if (isBasemap && layerStatus && layerStatus.isVisible) {
                // If the user clicked on the basemap that is already
                // visible, do nothing.
                return;
              } else if (isBasemap) {
                props.setBasemap(layerId, {
                  id: layerId,
                  status: "loading",
                  isVisible: true,
                  isBasemap: true,
                  type: layerType,
                });
              } else {
                props.setLayerStatus(layerId, {
                  id: layerId,
                  status: "loading",
                  isBasemap: false,
                  type: layerType,
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
  layerStatuses: PropTypes.shape({
    isBasemap: PropTypes.bool,
    isVisible: PropTypes.bool,
    status: PropTypes.string,
  }),
  title: PropTypes.string,
};

const mapStateToProps = state => ({
  mapConfig: mapConfigSelector(state),
  layerStatuses: mapLayerStatusesSelector(state),
  visibleBasemapId: mapBasemapSelector(state),
});

const mapDispatchToProps = dispatch => ({
  setLayerStatus: (layerId, layerStatus) =>
    dispatch(setLayerStatus(layerId, layerStatus)),
  setBasemap: (layerId, layerStatus) =>
    dispatch(setBasemap(layerId, layerStatus)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapLayerGroup);

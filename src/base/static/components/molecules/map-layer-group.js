import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classNames from "classnames";

import { HorizontalRule } from "../atoms/layout";
import { Header5 } from "../atoms/typography";

import { mapConfigSelector } from "../../state/ducks/map-config";
import {
  showLayers,
  hideLayers,
  setBasemap,
  mapLayerStatusesSelector,
  mapBasemapSelector,
} from "../../state/ducks/map";
import MapLayerSelector from "./map-layer-selector";

const MapLayerGroup = props => {
  return (
    <div className={classNames(props.classes, "map-layer-group")}>
      <HorizontalRule spacing="tiny" />
      <Header5>{props.title}</Header5>
      {props.layers.map(layer => {
        const isBasemap = !!props.mapConfig.layerGroups.find(
          layerConfig => layerConfig.id === layer.id,
        ).basemap;
        const layerStatus = props.layerStatuses[layer.id];

        return (
          <MapLayerSelector
            key={layer.id}
            layerId={layer.id}
            icon={layer.icon}
            info={layer.info}
            title={layer.title}
            layerStatus={layerStatus}
            selected={!!layerStatus.isVisible}
            onToggleLayer={layerId => {
              if (isBasemap && layerStatus.isVisible) {
                // If the user clicked on the basemap that is already
                // visible, do nothing.
                return;
              } else if (isBasemap) {
                props.setBasemap(layerId);
              } else if (layerStatus.isVisible) {
                // Toggle layer off.
                props.hideLayers([layerId]);
              } else {
                // Toggle layer on.
                props.showLayers([layerId]);
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
    layerGroups: PropTypes.arrayOf(
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
  hideLayers: PropTypes.func.isRequired,
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
  setBasemap: PropTypes.func.isRequired,
  showLayers: PropTypes.func.isRequired,
  title: PropTypes.string,
};

const mapStateToProps = state => ({
  mapConfig: mapConfigSelector(state),
  layerStatuses: mapLayerStatusesSelector(state),
  visibleBasemapId: mapBasemapSelector(state),
});

const mapDispatchToProps = dispatch => ({
  showLayers: layerIds => dispatch(showLayers(layerIds)),
  hideLayers: layerIds => dispatch(hideLayers(layerIds)),
  setBasemap: basemapId => dispatch(setBasemap(basemapId)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapLayerGroup);

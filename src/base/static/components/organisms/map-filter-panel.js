import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { leftSidebarPanelConfigSelector } from "../../state/ducks/left-sidebar";
import { Header4 } from "../atoms/typography";
import MapFilterGroup from "../molecules/map-filter-group";

import "./map-filter-panel.scss";

const MapFilterPanel = props => {
  return (
    <div className="map-filter-panel">
      <Header4>{props.filterPanelConfig.title}</Header4>
      {props.filterPanelConfig.groupings &&
        props.filterPanelConfig.groupings.map(grouping => (
          <MapFilterGroup
            key={grouping.id}
            reset_label={grouping.reset_label}
            classes="map-filter-panel__filter-group"
            targetLayer={grouping.target_layer}
            filterGroupId={grouping.id}
            filters={grouping.filters}
            title={grouping.title}
          />
        ))}
    </div>
  );
};

MapFilterPanel.propTypes = {
  filterPanelConfig: PropTypes.shape({
    id: PropTypes.string.isRequired,
    icon: PropTypes.string,
    component: PropTypes.string.isRequired,
    title: PropTypes.string,
    groupings: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string,
        target_layer: PropTypes.string.isRequired,
        filters: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string.isRequired,
            filter_attribute: PropTypes.string.isRequired,
            filter_value: PropTypes.string.isRequired,
            icon_url: PropTypes.string,
            label: PropTypes.string.isRequired,
          }),
        ),
      }),
    ),
  }),
};

MapFilterPanel.defaultProps = {
  icon: "map-marker",
};

const mapStateToProps = state => ({
  filterPanelConfig: leftSidebarPanelConfigSelector(state, "MapFilterPanel"),
});

export default connect(mapStateToProps)(MapFilterPanel);

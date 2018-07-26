import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classNames from "classnames";

import { HorizontalRule } from "../atoms/misc";
import { Header5 } from "../atoms/typography";

import {
  activateFeatureFilter,
  deactivateFeatureFilter,
  resetFeatureFilterGroup,
  mapFeatureFiltersSelector,
} from "../../state/ducks/map";
import MapFilterSelector from "./map-filter-selector";

const MapFilterGroup = props => {
  return (
    <div className={classNames(props.classes, "map-filter-group")}>
      <HorizontalRule />
      <Header5>{props.title}</Header5>
      <MapFilterSelector
        icon="/static/css/images/markers/reset-filter-icon.png"
        label={props.reset_label}
        filterId="reset-filters"
        onToggleFilter={() => {
          props.resetFeatureFilterGroup({
            groupId: props.filterGroupId,
            targetLayer: props.targetLayer,
          });
        }}
        isSelected={false}
      />
      {props.filters.map(filter => {
        const isSelected = !!props.featureFilters.find(
          featureFilter =>
            featureFilter.groupId === props.filterGroupId &&
            featureFilter.id === filter.id,
        );

        return (
          <MapFilterSelector
            key={filter.id}
            icon={filter.icon}
            filterId={filter.id}
            isSelected={isSelected}
            label={filter.label}
            onToggleFilter={filterId => {
              if (isSelected) {
                props.deactivateFeatureFilter({
                  id: filterId,
                  targetLayer: props.targetLayer,
                  groupId: props.filterGroupId,
                });
              } else {
                props.activateFeatureFilter({
                  id: filterId,
                  groupId: props.filterGroupId,
                  targetLayer: props.targetLayer,
                  attribute: filter.filter_attribute,
                  value: filter.filter_value,
                });
              }
            }}
          />
        );
      })}
    </div>
  );
};

MapFilterGroup.propTypes = {
  activateFeatureFilter: PropTypes.func.isRequired,
  classes: PropTypes.string,
  deactivateFeatureFilter: PropTypes.func.isRequired,
  filterGroupId: PropTypes.string.isRequired,
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      filter_attribute: PropTypes.string.isRequired,
      filter_value: PropTypes.string.isRequired,
      icon: PropTypes.string,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  featureFilters: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      targetLayer: PropTypes.string.isRequired,
      attribute: PropTypes.string.isRequried,
      value: PropTypes.string.isRequired,
    }),
  ).isRequired,
  resetFeatureFilterGroup: PropTypes.func.isRequired,
  reset_label: PropTypes.string.isRequired,
  targetLayer: PropTypes.string.isRequired,
  title: PropTypes.string,
};

const mapStateToProps = state => ({
  featureFilters: mapFeatureFiltersSelector(state),
});

const mapDispatchToProps = dispatch => ({
  activateFeatureFilter: (filterGroupId, filterStatus) =>
    dispatch(activateFeatureFilter(filterGroupId, filterStatus)),
  deactivateFeatureFilter: (filterGroupId, filterId) =>
    dispatch(deactivateFeatureFilter(filterGroupId, filterId)),
  resetFeatureFilterGroup: filterGroupId =>
    dispatch(resetFeatureFilterGroup(filterGroupId)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapFilterGroup);

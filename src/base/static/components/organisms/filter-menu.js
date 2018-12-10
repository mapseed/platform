import React, { Component } from "react";
import PropTypes from "prop-types";
import { NavButton } from "../molecules/buttons";
import { RegularLabel } from "../atoms/typography";
import Downshift from "downshift";
import styled from "react-emotion";
import mq from "../../../../media-queries";
import { connect } from "react-redux";
import {
  updateFilters,
  filtersPropType,
  filtersSelector,
} from "../../state/ducks/filters";
import {
  placeFormsConfigPropType,
  placeFormsConfigSelector,
} from "../../state/ducks/forms-config";

import Modal from "react-modal";
Modal.setAppElement("#main");

const FilterNavButton = styled(linkProps => (
  <NavButton color={"tertiary"} onClick={linkProps.onClick}>
    {linkProps.children}
  </NavButton>
))(() => ({
  [mq[0]]: {
    display: "none",
  },
  [mq[1]]: {
    display: "block",
  },
}));

const CategoryFilterDropdown = styled("ul")(props => ({
  backgroundColor: props.theme.bg.default,
  position: "absolute",
  maxWidth: "180px",
  border: `4px solid ${props.theme.brand.accent}`,
}));

const CategoryFilterOption = styled("li")(props => ({
  display: "flex",
  flexDirection: "row",
  marginBottom: "8px",
  justifyContent: "center",
  textAlign: "center",
  alignItems: "center",

  background: props.isSelected ? props.theme.bg.highlighted : "clear",
  color: props.isSelected
    ? props.theme.text.highlighted
    : props.theme.text.primary,

  "&:hover": {
    background: props.theme.bg.highlighted,
    color: props.theme.text.highlighted,
  },
}));

const CategoryLabel = styled(RegularLabel)(props => ({
  color: "unset",
  margin: "4px 16px 4px 16px",

  "&:hover": {
    color: props.theme.text.highlighted,
  },
}));

const stateReducer = (state, changes) => {
  // this prevents the menu from being closed when the user
  // selects an item with a keyboard or mouse
  switch (changes.type) {
    case Downshift.stateChangeTypes.keyDownEnter:
    case Downshift.stateChangeTypes.clickItem:
      return {
        ...changes,
        isOpen: state.isOpen,
        highlightedIndex: state.highlightedIndex,
      };
    default:
      return changes;
  }
};

class FilterMenu extends Component {
  state = {
    isModalOpen: false,
  };
  openModal = () => {
    this.setState({ isModalOpen: true });
  };
  closeModal = () => {
    this.setState({ isModalOpen: false });
  };
  render() {
    const isFiltering = this.props.filters.length > 0;

    return (
      <Downshift
        stateReducer={stateReducer}
        onSelect={placeForm => {
          if (!placeForm.id) {
            return this.props.updateFilters([]);
          }
          const isFilterSelected = !!this.props.filters.find(
            filter => filter.formId === placeForm.id,
          );
          isFilterSelected
            ? this.props.updateFilters(
                this.props.filters.filter(
                  filter => filter.formId !== placeForm.id,
                ),
              )
            : this.props.updateFilters([
                ...this.props.filters,
                {
                  formId: placeForm.id,
                  datasetId: placeForm.datasetId,
                },
              ]);
        }}
      >
        {({ getItemProps, getToggleButtonProps, getMenuProps, isOpen }) => (
          <div>
            <FilterNavButton {...getToggleButtonProps()}>
              {`${this.props.navBarItem.title}${
                isFiltering ? " (on) ⌄" : " ⌄"
              }`}
            </FilterNavButton>
            {isOpen && (
              <CategoryFilterDropdown {...getMenuProps()}>
                <CategoryFilterOption
                  {...getItemProps({
                    item: {},
                    index: 0,
                  })}
                  isSelected={!isFiltering}
                >
                  <CategoryLabel isSelected={!isFiltering}>
                    {"All"}
                  </CategoryLabel>
                </CategoryFilterOption>
                {this.props.placeFormsConfig.map((placeForm, index) => {
                  const isFilterSelected = !!this.props.filters.find(
                    filter => filter.formId === placeForm.id,
                  );
                  return (
                    <CategoryFilterOption
                      {...getItemProps({
                        key: placeForm.id,
                        index: index + 1,
                        item: placeForm,
                      })}
                      isSelected={isFilterSelected}
                    >
                      <CategoryLabel isSelected={isFilterSelected}>
                        {placeForm.label}
                      </CategoryLabel>
                    </CategoryFilterOption>
                  );
                })}
              </CategoryFilterDropdown>
            )}
          </div>
        )}
      </Downshift>
    );
  }
}

FilterMenu.propTypes = {
  navBarItem: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  filters: filtersPropType.isRequired,
  placeFormsConfig: placeFormsConfigPropType.isRequired,
  updateFilters: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  filters: filtersSelector(state),
  placeFormsConfig: placeFormsConfigSelector(state),
});
const mapDispatchToProps = dispatch => ({
  updateFilters: filters => dispatch(updateFilters(filters)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FilterMenu);

import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { NavButton, CloseButton } from "../molecules/buttons";
import { Image } from "../atoms/imagery";
import { Link, RegularTitle, LargeLabel } from "../atoms/typography";
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
  <NavButton variant="raised" color="primary" onClick={linkProps.onClick}>
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

const FilterMenuWrapper = styled("div")({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
});

const FilterMenuHeading = styled("div")({
  display: "flex",
});
const FilterMenuTitle = styled(RegularTitle)({
  textAlign: "center",
  marginLeft: "auto",
  marginRight: "auto",
});
const FilterOptions = styled("div")({
  marginLeft: "auto",
  marginRight: "auto",
});
const CategoryFilterOption = styled("div")(props => ({
  display: "flex",
  flexDirection: "row",
  marginBottom: "8px",
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
const CategoryImage = styled(Image)({
  width: "30px",
  height: "auto",
});
const CategoryLabel = styled(LargeLabel)(props => ({
  marginLeft: "8px",
  color: "unset",

  "&:hover": {
    color: props.theme.text.highlighted,
  },
}));

const modalStyles = {
  content: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#fff",
    borderRadius: "8px",
    outline: "none",
    boxShadow: "0 1px 5px rgba(0, 0, 0, 0.65)",
    wordWrap: "break-word",
    maxWidth: "95%",
    maxHeight: "95%",
    width: "360px",
  },

  overlay: {
    position: "fixed",
    top: "0px",
    left: "0px",
    right: "0px",
    bottom: "0px",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 99,
  },
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
      <Fragment>
        <FilterNavButton
          onClick={() => {
            this.props.onClick();
            this.openModal();
          }}
        >
          {`${this.props.navBarItem.title}${isFiltering ? " (on)" : ""}`}
        </FilterNavButton>
        <Modal
          style={modalStyles}
          isOpen={this.state.isModalOpen}
          onRequestClose={this.closeModal}
          contentLabel="set your filters"
        >
          <FilterMenuWrapper>
            <FilterMenuHeading>
              <FilterMenuTitle>{"Filter Menu"}</FilterMenuTitle>
              <CloseButton onClick={this.closeModal} />
            </FilterMenuHeading>
            <FilterOptions>
              <CategoryFilterOption
                isSelected={!isFiltering}
                onClick={() => {
                  this.props.updateFilters([]);
                }}
              >
                <CategoryLabel isSelected={!isFiltering}>{"All"}</CategoryLabel>
              </CategoryFilterOption>
              {this.props.placeFormsConfig.map(placeForm => {
                const isFilterSelected = !!this.props.filters.find(
                  filter => filter.formId === placeForm.id,
                );
                return (
                  <CategoryFilterOption
                    key={placeForm.id}
                    isSelected={isFilterSelected}
                    onClick={() => {
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
                    <CategoryImage src={placeForm.icon} />
                    <CategoryLabel isSelected={isFilterSelected}>
                      {placeForm.label}
                    </CategoryLabel>
                  </CategoryFilterOption>
                );
              })}
            </FilterOptions>
          </FilterMenuWrapper>
        </Modal>
      </Fragment>
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

/** @jsx jsx */
import * as React from "react";
import PropTypes from "prop-types";
import { jsx } from "@emotion/core";
import Button from "@material-ui/core/Button";
import { RegularLabel } from "../atoms/typography";
import Downshift from "downshift";
import styled from "@emotion/styled";
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

const CategoryFilterOption = styled("li")(props => ({
  display: "flex",
  flexDirection: "row",
  marginBottom: "8px",
  justifyContent: "center",
  textAlign: "center",
  alignItems: "center",

  background: props.isSelected ? props.theme.bg.highlighted : "clear",
  cursor: "pointer",
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
  cursor: "pointer",

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

class FilterMenu extends React.Component {
  render() {
    const isFiltering = this.props.filters.length > 0;

    return (
      <Downshift
        stateReducer={stateReducer}
        itemToString={i => (i == null ? "" : String(i))}
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
                  datasetSlug: placeForm.datasetSlug,
                },
              ]);
        }}
      >
        {({ getItemProps, getToggleButtonProps, getMenuProps, isOpen }) => (
          <div
            role="listbox"
            aria-label="filter menu"
            aria-labelledby="header_filter-button"
          >
            <Button
              id="header_filter-button"
              css={theme => ({
                fontFamily: theme.text.navBarFontFamily,
                fontWeight: 600,
                marginLeft: "4px",
                marginRight: "4px",
                fontSize: "0.9rem",

                [mq[0]]: {
                  display: "none",
                },
                [mq[1]]: {
                  display: "block",
                },
              })}
              onClick={this.props.onClick}
              {...getToggleButtonProps()}
            >
              {`${this.props.navBarItem.title}${
                isFiltering ? " (on) ⌄" : " ⌄"
              }`}
            </Button>
            {isOpen && (
              <ul
                css={theme => ({
                  backgroundColor: theme.bg.default,
                  position: "absolute",
                  maxWidth: "180px",
                  border: `4px solid ${theme.brand.accent}`,
                  padding: 0,
                  top: "30px",
                  marginLeft: "10px",
                })}
                {...getMenuProps()}
              >
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
                    // eslint-disable-next-line react/jsx-key
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
              </ul>
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

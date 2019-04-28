/** @jsx jsx */
import * as React from "react";
import PropTypes from "prop-types";
import { jsx } from "@emotion/core";
import styled from "@emotion/styled";
import { translate } from "react-i18next";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import {
  filteredPlacesSelector,
  placesPropType,
} from "../../state/ducks/places";
import {
  placeConfigSelector,
  placeConfigPropType,
} from "../../state/ducks/place-config";
import PlaceListItem from "../molecules/place-list-item";
import Button from "@material-ui/core/Button";
import { TextInput } from "../atoms/input";

import {
  AutoSizer,
  List,
  CellMeasurer,
  CellMeasurerCache,
} from "react-virtualized";

// Most of react-virtualized's styles are functional (eg position, size).
// Functional styles are applied directly to DOM elements.
// The Table component ships with a few presentational styles as well.
// They are optional, but if you want them you will need to also import the CSS file.
// This only needs to be done once; probably during your application's bootstrapping process.
import "react-virtualized/styles.css";

const cache = new CellMeasurerCache({
  defaultHeight: 160,
  fixedWidth: true,
});

const ListViewContainer = styled("div")({
  backgroundColor: "#fff",
  width: "100%",
  // HACK: We are horizonally centering all content, and clipping the
  // height at 80%, to work around a layout issue where the scrollbars
  // are getting clipped off the right edge. This is because the html
  // body element is larger than 100% for some reason...
  // We should be able to fix this when we port over base.hbs.
  height: "80%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const ListViewContent = styled("div")({
  marginTop: "24px",
  height: "100%",
  width: "100%",
});

const MAX_LIST_WIDTH = "1120px";
const ListHeader = styled("div")({
  margin: "8px auto 24px auto",
  maxWidth: MAX_LIST_WIDTH,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

const SearchContainer = styled("div")({
  display: "flex",
  alignItems: "center",
});

const SortButton = buttonProps => (
  <Button
    css={theme => ({
      marginRight: "16px",
      fontFamily: theme.text.headerFontFamily,
    })}
    color={buttonProps.isActive ? "primary" : "default"}
    onClick={buttonProps.onClick}
  >
    {buttonProps.children}
  </Button>
);

const ButtonContainer = styled("div")({});

class PlaceList extends React.Component {
  _sortAndFilterPlaces = (places, sortBy, query) => {
    // only render place surveys that are flagged with 'includeOnList':
    const includedPlaces = places.filter(
      place =>
        this.props.placeConfig.place_detail.find(
          survey => survey.category === place.location_type,
        ).includeOnList,
    );
    const filteredPlaces = query
      ? includedPlaces.filter(place => {
          return Object.values(place).some(field => {
            // TODO: make sure the field is only within the matching
            // fields - we don't want false positives from the Place
            // model's `dataset` field, for example.
            return (
              typeof field === "string" && field.toLowerCase().includes(query)
            );
          });
        })
      : [...includedPlaces];
    const sortedFilteredPlaces = filteredPlaces.sort((a, b) => {
      if (sortBy === "dates") {
        return new Date(b.created_datetime) - new Date(a.created_datetime);
      } else if (sortBy === "supports") {
        const bSupports = b.submission_sets.support || [];
        const aSupports = a.submission_sets.support || [];
        return bSupports.length - aSupports.length;
      } else if (sortBy === "comments") {
        const bComments = b.submission_sets.comments || [];
        const aComments = a.submission_sets.comments || [];
        return bComments.length - aComments.length;
      }
    });
    return sortedFilteredPlaces;
  };

  _setSortAndFilterPlaces = () => {
    const sortedFilteredPlaces = this._sortAndFilterPlaces(
      this.props.places,
      this.state.sortBy,
      this.state.query.toLowerCase(),
    );
    cache.clearAll();
    this.setState({
      places: sortedFilteredPlaces,
    });
    this.virtualizedList.forceUpdateGrid();
  };

  virtualizedList = null;
  setVirtualizedList = element => {
    this.virtualizedList = element;
  };

  state = {
    sortBy: "dates",
    places: this._sortAndFilterPlaces(this.props.places, "dates", ""),
    query: "",
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.places.length !== this.props.places.length ||
      prevState.sortBy !== this.state.sortBy
    ) {
      this._setSortAndFilterPlaces();
    }
  }

  _noRowsRenderer = () => {
    // TODO: a place holder, similar to youtube, would be nice here:
    return null;
  };

  _rowRenderer = ({ index, key, parent, style }) => {
    const place = this.state.places[index];
    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        {/* measures the row height when the PlaceListItem's image has finished loading: */}
        {({ measure }) => (
          <div role="row" style={style} key={place.id}>
            <PlaceListItem
              place={place}
              onLoad={measure}
              router={this.props.router}
            />
          </div>
        )}
      </CellMeasurer>
    );
  };

  render() {
    return (
      <ListViewContainer>
        <ListViewContent>
          <ListHeader>
            <SearchContainer>
              <TextInput
                placeholder={`${this.props.t("search", "Search")}...`}
                color="accent"
                ariaLabel="search list by text"
                onKeyPress={evt => {
                  if (evt.key === "Enter") {
                    this._setSortAndFilterPlaces();
                  }
                }}
                onChange={evt => {
                  this.setState({ query: evt.target.value });
                }}
              />
              <Button
                css={theme => ({
                  marginLeft: "16px",
                  fontFamily: theme.text.headerFontFamily,
                })}
                color="secondary"
                onClick={this._setSortAndFilterPlaces}
                variant="contained"
              >
                {this.props.t("search", "Search")}
              </Button>
            </SearchContainer>
            <ButtonContainer>
              <SortButton
                isActive={this.state.sortBy === "dates"}
                onClick={() => this.setState({ sortBy: "dates" })}
              >
                {this.props.t("mostRecent", "Most recent")}
              </SortButton>
              <SortButton
                isActive={this.state.sortBy === "supports"}
                onClick={() => this.setState({ sortBy: "supports" })}
              >
                {this.props.t("mostSupports", "Most supports")}
              </SortButton>
              <SortButton
                isActive={this.state.sortBy === "comments"}
                onClick={() => this.setState({ sortBy: "comments" })}
              >
                {this.props.t("mostComments", "Most comments")}
              </SortButton>
            </ButtonContainer>
          </ListHeader>
          <AutoSizer>
            {({ height, width }) => (
              <List
                ref={this.setVirtualizedList}
                height={height}
                width={width}
                containerStyle={{
                  margin: "0 auto",
                  maxWidth: MAX_LIST_WIDTH,
                }}
                overscanRowCount={4}
                noRowsRenderer={this._noRowsRenderer}
                rowCount={this.state.places.length}
                rowRenderer={this._rowRenderer}
                deferredMeasurementCache={cache}
                rowHeight={cache.rowHeight}
              />
            )}
          </AutoSizer>
        </ListViewContent>
      </ListViewContainer>
    );
  }
}

PlaceList.propTypes = {
  places: placesPropType.isRequired,
  placeConfig: placeConfigPropType.isRequired,
  t: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  places: filteredPlacesSelector(state),
  placeConfig: placeConfigSelector(state),
});

export default withRouter(
  connect(mapStateToProps)(translate("PlaceList")(PlaceList)),
);

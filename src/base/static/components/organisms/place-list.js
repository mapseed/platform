import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { translate } from "react-i18next";
import { connect } from "react-redux";
import { placesSelector } from "../../state/ducks/places";
import PlaceListItem from "../molecules/place-list-item";
import { Button } from "../atoms/buttons";

// But if you only use a few react-virtualized components,
// And you're concerned about increasing your application's bundle size,
// You can directly import only the components you need, like so:
import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer";
import List from "react-virtualized/dist/commonjs/List";
import CellMeasurer from "react-virtualized/dist/commonjs/CellMeasurer/CellMeasurer";
import CellMeasurerCache from "react-virtualized/dist/commonjs/CellMeasurer/CellMeasurerCache";
// In wepack 4, we can do the following:
// import { AutoSizer, List } from 'react-virtualized'

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
  margin: "24px",
  height: "100%",
  width: "100%",
});

const ListHeader = styled("div")({
  marginTop: "24px",
  marginBottom: "24px",
  display: "flex",
  justifyContent: "space-between",
});

const BorderLine = styled("div")({
  borderBottom: "1px solid #eee",
});

const ButtonContainer = styled("div")({});

class PlaceList extends React.Component {
  _getSortedPlaces = (places, sortBy) => {
    places.sort((a, b) => {
      if (sortBy === "dates") {
        return new Date(b.created_datetime) - new Date(a.created_datetime);
      } else if (this.state.sortBy === "supports") {
        const bSupports = b.submission_sets.support || [];
        const aSupports = a.submission_sets.support || [];
        return bSupports.length - aSupports.length;
      } else if (this.state.sortBy === "comments") {
        const bComments = b.submission_sets.comments || [];
        const aComments = a.submission_sets.comments || [];
        return bComments.length - aComments.length;
      }
    });
    return places;
  };

  virtualizedList = null;
  setVirtualizedList = element => {
    this.virtualizedList = element;
  };

  state = {
    sortBy: "dates",
    places: this._getSortedPlaces([...this.props.places], "dates"),
  };

  constructor(props) {
    super(props);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.places.length !== this.props.places.length ||
      prevState.sortBy !== this.state.sortBy
    ) {
      const sortedPlaces = this._getSortedPlaces(
        [...this.props.places],
        this.state.sortBy,
      );
      this.setState({
        places: sortedPlaces,
      });
      this.virtualizedList.forceUpdateGrid();
    }
  }

  _noRowsRenderer = () => {
    return <div>No rows!!!</div>;
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
        {({ measure }) => (
          <div style={style} key={place.id}>
            <PlaceListItem place={place} onLoad={measure} />
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
            <div>header!!!</div>
            <ButtonContainer>
              <Button
                style={{ marginRight: "16px" }}
                color={this.state.sortBy === "dates" ? "primary" : "tertiary"}
                onClick={() => this.setState({ sortBy: "dates" })}
              >
                Most Recent
              </Button>
              <Button
                style={{ marginRight: "16px" }}
                color={
                  this.state.sortBy === "supports" ? "primary" : "tertiary"
                }
                onClick={() => this.setState({ sortBy: "supports" })}
              >
                Most Supports
              </Button>
              <Button
                style={{ marginRight: "16px" }}
                color={
                  this.state.sortBy === "comments" ? "primary" : "tertiary"
                }
                onClick={() => this.setState({ sortBy: "comments" })}
              >
                Most Comments
              </Button>
            </ButtonContainer>
          </ListHeader>
          <BorderLine />
          <AutoSizer>
            {({ height, width }) => (
              <List
                ref={this.setVirtualizedList}
                height={height}
                width={width}
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
  places: PropTypes.array,
  t: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  places: placesSelector(state),
});

export default connect(mapStateToProps)(translate("PlaceList")(PlaceList));

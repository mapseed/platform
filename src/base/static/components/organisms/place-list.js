import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { translate } from "react-i18next";
import { connect } from "react-redux";
import { placesSelector } from "../../state/ducks/places";

// But if you only use a few react-virtualized components,
// And you're concerned about increasing your application's bundle size,
// You can directly import only the components you need, like so:
import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer";
import List from "react-virtualized/dist/commonjs/List";
// In wepack 4, we can do the following:
// import { AutoSizer, List } from 'react-virtualized'

const ListViewContainer = styled("div")({
  backgroundColor: "#fff",
  width: "100%",
  height: "100%",
  // HACK: We are centering all content here to work around a layout issue where the body is larger than 100%, thus the scrollbars are not showing on the right side
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
});

class PlaceList extends React.Component {
  state = {
    sortBy: "date",
  };

  constructor(props) {
    super(props);
  }

  _noRowsRenderer = () => {
    return <div>No rows!!!</div>;
  };

  _rowRenderer = ({ index, isScrolling, key, style }) => {
    const place = this.props.places[index];
    return (
      <div style={style} key={place.id}>
        {place.id}
      </div>
    );
  };

  render() {
    return (
      <ListViewContainer>
        <ListViewContent>
          <ListHeader>List view!</ListHeader>
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                width={width}
                overscanRowCount={10}
                noRowsRenderer={this._noRowsRenderer}
                rowCount={this.props.places.length}
                rowHeight={60}
                rowRenderer={this._rowRenderer}
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

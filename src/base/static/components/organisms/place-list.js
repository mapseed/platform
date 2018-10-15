import React from "react";
import PropTypes from "prop-types";
import { translate } from "react-i18next";
import { connect } from "react-redux";
import { placesSelector } from "../../state/ducks/places";

class PlaceList extends React.Component {
  state = {
    sortBy: "date",
  };

  constructor(props) {
    super(props);

    // TODO(luke): use a regular array here instead?
  }

  render() {
    // TODO(luke): render each place in this.collection using the PlaceDetail component.
    // Make sure that everything is sorted, filtered, and infinite scroll is enabled.
    // useful infinite scroll library: https://www.npmjs.com/package/react-virtualized

    // from place-list template:
    // TODO(luke): add onClick handlers here
    // TODO(luke): port class names to CSS-in-JS
    // TODO(luke): use react-virtualized here to render only a subset of the place collections
    // TODO(luke): render each collection into an array of PlaceListItem molecules...

    return (
      <React.Fragment>
        <div>List view!</div>
        {this.props.places.slice(0, 20).map(place => {
          return <div key={place.id}>{place.id}</div>;
        })}
      </React.Fragment>
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

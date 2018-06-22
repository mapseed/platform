import React from "react";
import PropTypes from "prop-types";
import { translate } from "react-i18next";
import PlaceDetail from "../place-detail";
import { connect } from "react-redux";
import { mapConfigSelector } from "../../state/ducks/config";

const PlaceCollection = require("../models/place-collection.js");

class PlaceList extends React.Component {
  constructor(props) {
    super(props);

    // TODO(luke): use a regular array here instead?
    this.collection = new PlaceCollection([]);
    this.props.placeCollections.forEach(collection => {
      collection.on("add", self.addModel, self);
    });

    this.state = {
      // collection: new PlaceCollection([]),
      // unrenderedItems: new PlaceCollection([])
      sortBy: "date",
    };
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
        <div className="place-list-header">
          <form className="list-search-form">
            <input
              id="list-search"
              name="list_search"
              type="text"
              placeholder="Search..."
            />
            <input
              name="search"
              type="submit"
              value={this.props.t("Search")}
              className="btn btn-primary submit-btn"
            />
          </form>
          <nav className="list-sort-menu">
            <span className="list-sort-prompt" />

            <a href="#" className="date-sort is-selected">
              {this.props.t("Most Recent")}
            </a>

            <a href="#" className="support-sort">
              {/* TODO: use a variable here for "support_label_plural */}
              {this.props.t("Most Supports")}
            </a>

            <a href="#" className="survey-sort">
              {/* TODO: use a variable here for "survey_label_plural */}
              {this.props.t("Most Surveys")}
            </a>
          </nav>
        </div>

        <ul className="place-list unstyled-list">
          {this.collection.map(model => {
            return (
              <PlaceDetail
                key={model.id}
                container={document.querySelector("#content article")}
                currentUser={Shareabouts.bootstrapped.currentUser}
                isGeocodingBarEnabled={
                  this.props.mapConfig.geocoding_bar_enabled
                }
                map={this.props.mapView.map}
                model={model}
                appView={this}
                // NOTE: We don't need to access the layerView here. It is only used for the map drawing toolbar form field, and isEditModeToggled is not enabled, so it's not needed...
                // layerView={this.props.mapView.layerViews[datasetId][model.cid]}
                places={this.places}
                router={this.props.router}
                userToken={this.options.userToken}
              />
            );
          })}
        </ul>
      </React.Fragment>
    );
  }
}

// TODO(luke): pass in t, placeCollections, from AppView or Redux...
PlaceList.propTypes = {
  placeCollections: PropTypes.array,
  t: PropTypes.func.isRequired,
  mapView: PropTypes.object,
  mapConfig: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  mapConfig: mapConfigSelector(state),
});

export default connect(mapStateToProps)(translate("PlaceList")(PlaceList));

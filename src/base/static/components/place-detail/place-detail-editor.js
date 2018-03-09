import React, { Component } from "react";
import PropTypes from "prop-types";
import emitter from "../utils/emitter";
import classNames from "classnames";
import {
  Map as ImmutableMap,
  OrderedMap as ImmutableOrderedMap,
} from "immutable";

import FormField from "../form-fields/form-field";

import constants from "../constants";

import "./place-detail-editor.scss";

class PlaceDetailEditor extends Component {
  constructor(props) {
    super(props);

    let fields = ImmutableOrderedMap();
    this.props.categoryConfig.fields.forEach(field => {
      fields = fields.set(
        field.name,
        ImmutableMap().set(
          constants.FIELD_STATE_VALUE_KEY,
          this.props.placeModel.get(field.name)
        )
      );
    });

    this.state = {
      fields: fields,
      formValidationErrors: new Set(),
      showValidityStatus: false,
    };
  }

  componentWillMount() {
    emitter.addListener("place-model:update", () => {
      this.props.onUpdate(this.state.fields);
    });
    emitter.addListener("place-model:remove", () => {
      this.props.onRemove();
    });
  }

  componentDidMount() {
    // TODO: Replace this.
    new Spinner(Shareabouts.smallSpinnerOptions).spin(
      document.getElementsByClassName("place-detail-editor__spinner")[0]
    );
  }

  componentWillUnmount() {
    emitter.removeAllListeners("place-model:update");
    emitter.removeAllListeners("place-model:remove");
  }

  onFieldChange(fieldName, fieldStatus, isInitializing) {
    this.setState(({ fields }) => ({
      fields: fields.set(fieldName, fieldStatus),
      updatingField: fieldName,
      isInitializing: isInitializing,
    }));
  }

  render() {
    return (
      <form
        className={classNames("place-detail-editor", {
          "place-detail-editor--faded": this.props.isSubmitting,
        })}
      >
        {this.state.fields
          .filter(
            (fieldState, fieldName) =>
              this.props.categoryConfig.fields.find(
                field => field.name === fieldName
              ).type !== constants.SUBMIT_FIELD_TYPENAME
          )
          .map((fieldState, fieldName) => {
            const fieldConfig = this.props.categoryConfig.fields.find(
              field => field.name === fieldName
            );
            return (
              <FormField
                fieldConfig={fieldConfig}
                categoryConfig={this.categoryConfig}
                disabled={this.state.isSubmitting}
                fieldState={fieldState}
                onGeometryStyleChange={() => {}}
                onAdditionalData={() => {}}
                mapDrawingToolbarState={{
                  initialPanel:
                    constants.GEOMETRY_EDITOR_TOOL_MAPPINGS[
                      this.props.placeModel
                        .get(constants.GEOMETRY_PROPERTY_NAME)
                        .get(constants.GEOMETRY_TYPE_PROPERTY_NAME)
                    ],
                  initialGeometryType:
                    constants.GEOMETRY_TYPE_MAPPINGS[
                      this.props.placeModel
                        .get(constants.GEOMETRY_PROPERTY_NAME)
                        .get(constants.GEOMETRY_TYPE_PROPERTY_NAME)
                    ],
                  existingLayer: this.props.layerView.layer,
                  selectedMarkerIndex:
                    fieldConfig.type ===
                      constants.MAP_DRAWING_TOOLBAR_TYPENAME &&
                    fieldConfig.content.findIndex(
                      marker =>
                        marker.url ===
                        this.props.placeModel
                          .get(constants.GEOMETRY_STYLE_PROPERTY_NAME)
                          .get(constants.ICON_URL_PROPERTY_NAME)
                    ),
                }}
                isInitializing={this.state.isInitializing}
                key={fieldName}
                map={this.props.map}
                mapConfig={this.props.mapConfig}
                onFieldChange={this.onFieldChange.bind(this)}
                places={this.props.places}
                router={this.props.router}
                showValidityStatus={this.state.showValidityStatus}
                updatingField={this.state.updatingField}
              />
            );
          })
          .toArray()}
        <div
          className={classNames("place-detail-editor__spinner", {
            "place-detail-editor__spinner--visible": this.props.isSubmitting,
          })}
        />
      </form>
    );
  }
}

PlaceDetailEditor.propTypes = {
  categoryConfig: PropTypes.object.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  layerView: PropTypes.object,
  map: PropTypes.object,
  mapConfig: PropTypes.object,
  onRemove: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  placeModel: PropTypes.object.isRequired,
  places: PropTypes.object,
  router: PropTypes.object,
};

export default PlaceDetailEditor;

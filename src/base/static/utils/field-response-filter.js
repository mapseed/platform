import constants from "../constants";

export default (fieldList, backboneModelAttributes) =>
  fieldList
    .filter(
      fieldConfig =>
        ![
          constants.SUBMIT_FIELD_TYPENAME,
          constants.ATTACHMENT_FIELD_TYPENAME,
          constants.CUSTOM_URL_TOOLBAR_TYPENAME,
          constants.MAP_DRAWING_TOOLBAR_TYPENAME,
          constants.PUBLISH_CONTROL_TOOLBAR_TYPENAME,
        ].includes(fieldConfig.type) &&
        ![
          constants.LOCATION_TYPE_PROPERTY_NAME,
          constants.TITLE_PROPERTY_NAME,
          "submitter_name",
          "name",
        ].includes(fieldConfig.name),
    )
    .filter(fieldConfig => fieldConfig.name.indexOf("private-") !== 0)
    .filter(fieldConfig => !!backboneModelAttributes.get(fieldConfig.name));

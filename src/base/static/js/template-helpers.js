var Util = require("./utils.js");

module.exports = {
  // Attached helper properties for how to display this form element
  insertInputTypeFlags: function(configItems) {
    _.each(configItems, function(item, index) {
      item.is_input =
        !item.type ||
        [
          "textarea",
          "select",
          "file",
          "geocoding",
          "checkbox-list",
          "hidden",
        ].indexOf(item.type) < 0;
      item.is_textarea = item.type === "textarea";
      item.is_select = item.type === "select";
      item.is_checkbox_list = item.type === "checkbox-list";
      item.is_file = item.type === "file";
      item.is_geocoding = item.type === "geocoding";
      item.is_hidden = item.type === "hidden";
      item.is_fileinput_supported = Util.fileInputSupported();
    });
  },

  // Normalize a list of items to display in a template
  getItemsFromModel: function(configItems, model, exceptions) {
    // Filter out any items that will be handled specifically in the template
    var filteredConfigItems = _.filter(configItems, function(item) {
      // Only include if it is not an exception
      return _.indexOf(exceptions, item.name) === -1;
    }),
      items = [];

    // Normalize the list
    _.each(filteredConfigItems, function(item, j) {
      items.push({
        name: item.name,
        label: item.label,
        value: model.get(item.name),
      });
    });

    return items;
  },

  // Don't show a place type select element if only one option or a default
  // value is provided.
  overridePlaceTypeConfig: function(placeConfigItems, defaultPlaceTypeName) {
    var valueAttr,
      // Get the config for the place type
      placeTypeConfig = _.find(placeConfigItems, function(config) {
        return config.name === "location_type";
      });

    if (
      placeTypeConfig &&
      placeTypeConfig.type === "select" &&
      (defaultPlaceTypeName ||
        (_.isArray(placeTypeConfig.options) &&
          placeTypeConfig.options.length === 1))
    ) {
      // Change to a hidden element with no label
      placeTypeConfig.type = "hidden";
      placeTypeConfig.prompt = null;

      // Use defult or the one option
      if (defaultPlaceTypeName) {
        valueAttr = { key: "value", value: defaultPlaceTypeName };
      } else {
        valueAttr = { key: "value", value: placeTypeConfig.options[0] };
      }

      // options are not longer needed since this is not a select element
      delete placeTypeConfig.options;

      // Figures out if we an replace the attrs or have to update them
      if (
        _.isArray(placeTypeConfig.attrs) &&
        placeTypeConfig.attrs.length > 0
      ) {
        _.each(placeTypeConfig.attrs, function(kvp, i) {
          if (kvp.key === "value") {
            placeTypeConfig.attrs[i] = valueAttr;
          }
        });
      } else {
        placeTypeConfig.attrs = [valueAttr];
      }
    }
  },

  formatNumber: function(number) {
    // source: https://chiragrdarji.wordpress.com/2007/05/28/thousand-separator-function-for-java-script/
    var decimalDigits = 0;
    var Value = number;
    // Separator Length. Here this is thousand separator
    var separatorLength = 3;
    var OriginalValue = Value;
    var TempValue = "" + OriginalValue;
    var NewValue = "";

    // Store digits after decimal
    var pStr;

    // store digits before decimal
    var dStr;

    // Add decimal point if it is not there
    if (TempValue.indexOf(".") == -1) {
      TempValue += ".";
    }

    dStr = TempValue.substr(0, TempValue.indexOf("."));

    pStr = TempValue.substr(TempValue.indexOf("."));

    // Add '0' for remaining digits after decimal point
    while (pStr.length - 1 < decimalDigits) {
      pStr += "0";
    }

    if (pStr == ".") pStr = "";

    if (dStr.length > separatorLength) {
      // Logic of separation
      while (dStr.length > separatorLength) {
        NewValue = "," + dStr.substr(dStr.length - separatorLength) + NewValue;
        dStr = dStr.substr(0, dStr.length - separatorLength);
      }
      NewValue = dStr + NewValue;
    } else {
      NewValue = dStr;
    }
    // Add decimal part
    NewValue = NewValue + pStr;
    return NewValue;
  },
};

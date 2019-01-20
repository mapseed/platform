var self = (module.exports = {
  patch: function(obj, overrides, func) {
    var attr,
      originals = {};

    // Switch out for the override values, but save the originals
    for (attr in overrides) {
      originals[attr] = obj[attr];
      obj[attr] = overrides[attr];
    }

    // Run the function with the now patched object
    func();

    // Restore the original values
    for (attr in originals) {
      obj[attr] = originals[attr];
    }
  },

  setPrettyDateLang: function(locale) {
    moment.lang(locale);
  },

  getPrettyDateTime: function(datetime, format) {
    if (format) {
      return moment(datetime).format(format);
    } else {
      return moment(datetime).fromNow();
    }
  },

  buildSharingQuerystring: function(components) {
    return [
      "?url=",
      encodeURIComponent(components.redirectUrl),
      "&title=",
      encodeURIComponent(components.title),
      "&img=",
      encodeURIComponent(components.img),
      "&desc=",
      encodeURIComponent(components.desc),
      "&height=",
      encodeURIComponent(components.height),
      "&width=",
      encodeURIComponent(components.width),
    ].join("");
  },

  getSocialUrl: function(model, service) {
    var appConfig = Shareabouts.Config.app,
      shareUrl = "http://social.mapseed.org",
      components = {
        title: model.get("title") || model.get("name") || appConfig.title,
        desc: model.get("description") || appConfig.meta_description,
        img:
          model.attachmentCollection.models.length > 0
            ? model.attachmentCollection.models[0].get("file")
            : [
                window.location.protocol,
                "//",
                window.location.host,
                appConfig.thumbnail,
              ].join(""),
        redirectUrl: [
          window.location.protocol,
          "//",
          window.location.host,
          "/",
          model.get("datasetSlug") + "/" + model.get("id"),
        ].join(""),
      },
      $img = $("img[src='" + components.img + "']");

    components["height"] = $img.height() || 630;
    components["width"] = $img.width() || 1200;

    if (components.img.startsWith("data:")) {
      // If the image was just created and has a data url, fetch the attachment
      // collection to obtain the S3 url before contacting the sharing microservice.
      return new Promise((resolve, reject) => {
        model.attachmentCollection.fetch({
          reset: true,
          success: collection => {
            components.img = collection.first().get("file");
            const queryString = this.buildSharingQuerystring(components);
            resolve(encodeURIComponent(`${shareUrl}${queryString}`));
          },
          error: _ => reject(_),
        });
      });
    } else {
      // return a promise that immediately resolves to our share url:
      const queryString = this.buildSharingQuerystring(components);
      return Promise.resolve(encodeURIComponent(`${shareUrl}${queryString}`));
    }
  },

  onSocialShare: function(model, service) {
    this.getSocialUrl(model).then(shareUrl => {
      let url =
        service === "facebook"
          ? `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`
          : `https://twitter.com/intent/tweet?url=${shareUrl}`;
      window.open(url, "_blank").focus();
    });
  },

  getAttrs: function($form) {
    var attrs = {},
      multivalues = [];

    // Get values from the form. Make the item into an array if there are
    // multiple values in the form, as in the case of a set of check boxes or
    // a multiselect list.
    _.each($form.serializeArray(), function(item) {
      if (!_.isUndefined(attrs[item.name])) {
        if (!_.contains(multivalues, item.name)) {
          multivalues.push(item.name);
          attrs[item.name] = [attrs[item.name]];
        }
        attrs[item.name].push(item.value);
      } else {
        attrs[item.name] = item.value;
      }
    });

    return attrs;
  },

  // Given a fieldConfig and an existingValue (which might be derived from an
  // autocomplete value stored in localstorage or from a rendered place detail
  // view value in editor mode), construct a content object for this field
  // suitable for consumption by the form field types template.
  buildFieldContent: function(fieldConfig, existingValue) {
    var content,
      hasValue = false;

    if (
      fieldConfig.type === "text" ||
      fieldConfig.type === "textarea" ||
      fieldConfig.type === "datetime" ||
      fieldConfig.type === "rich_textarea" ||
      fieldConfig.type === "custom_url_toolbar"
    ) {
      // Plain text
      content = existingValue || "";

      if (content !== "") {
        hasValue = true;
      }
    } else if (
      fieldConfig.type === "big_checkbox" ||
      fieldConfig.type === "big_radio" ||
      fieldConfig.type === "dropdown" ||
      fieldConfig.type === "dropdown_autocomplete"
    ) {
      // Checkboxes, radio buttons, and dropdowns
      if (!_.isArray(existingValue)) {
        // If input is not an array, convert to an array of length 1
        existingValue = [existingValue];
      }

      content = [];

      _.each(fieldConfig.content, function(option) {
        var selected = false;
        if (_.contains(existingValue, option.value)) {
          selected = true;
          hasValue = true;
        }
        content.push({
          value: option.value,
          label: option.label,
          selected: selected,
        });
      });
    } else if (fieldConfig.type === "map_drawing_toolbar") {
      // Geometry toolbar
      content = [];

      _.each(fieldConfig.content, function(option) {
        var selected = false;
        if (existingValue === option.url) {
          selected = true;
          hasValue = true;
        }
        content.push({
          url: option.url,
          selected: selected,
        });
        if (!hasValue) {
          content[0].selected = true;
        }
      });
    } else if (fieldConfig.type === "publish_control_toolbar") {
      // Published/Not published radio control
      content = {
        selected: existingValue || "isPublished",
      };
      hasValue = true;
    } else if (fieldConfig.type === "range") {
      content = {
        value: existingValue || null,
      };
      if (existingValue) {
        hasValue = true;
      }
    } else if (fieldConfig.type === "big_toggle") {
      // Binary toggle buttons
      // NOTE: We assume that the first option listed under content
      // corresponds to the "on" value of the toggle input
      content = {
        selectedValue: fieldConfig.content[0].value,
        selectedLabel: fieldConfig.content[0].label,
        unselectedValue: fieldConfig.content[1].value,
        unselectedLabel: fieldConfig.content[1].label,
        selected: existingValue === fieldConfig.content[0].value ? true : false,
      };

      hasValue = true;
    }

    return {
      name: fieldConfig.name,
      type: fieldConfig.type,
      content: content,
      prompt: fieldConfig.prompt,
      hasValue: hasValue,
    };
  },

  buildFieldListForRender: function(args) {
    var self = this,
      fields = [],
      fieldIsValid = function(fieldData) {
        return (
          _.contains(args.exclusions, fieldData.name) === false &&
          (fieldData.name && fieldData.name.indexOf("private-") !== 0) &&
          fieldData.hasValue &&
          fieldData.form_only !== true &&
          fieldData.name !== "custom_url_toolbar" &&
          fieldData.type !== "submit"
        );
      },
      fieldIsValidForEditor = function(fieldData) {
        return (
          _.contains(args.exclusions, fieldData.name) === false &&
          fieldData.type !== "submit"
        );
      };

    _.each(
      args.fields,
      function(field, i) {
        if (field.type === "common_form_element") {
          Object.assign(
            args.fields[i],
            args.commonFormElements[args.fields[i].name],
          );
        }

        var fieldData = _.extend(
          {},
          args.fields[i],
          self.buildFieldContent(field, args.model.get(field.name)),
        );

        if (args.isEditingToggled && fieldIsValidForEditor(fieldData)) {
          fields.push(fieldData);
        } else if (fieldIsValid(fieldData)) {
          fields.push(fieldData);
        }
      },
      this,
    );

    return fields;
  },

  // attempt to save form autocomplete values in localStorage;
  // fall back to cookies
  saveAutocompleteValue: function(name, value, days) {
    if (typeof Storage !== "undefined") {
      this.localstorage.save(name, value, days);
    } else {
      this.cookies.save(name, value, days, "mapseed-");
    }
  },

  getAutocompleteValue: function(name) {
    if (typeof Storage !== "undefined") {
      return this.localstorage.get(name);
    } else {
      return this.cookies.get(name, "mapseed-");
    }
  },

  removeAutocompleteValue: function(name) {
    if (typeof Storage !== "undefined") {
      return this.localstorage.destroy(name);
    } else {
      return this.cookies.destroy(name, "mapseed-");
    }
  },

  prepareCustomUrl: function(url) {
    return url.replace(/[^A-Za-z0-9-_]/g, "-").toLowerCase();
  },

  getUrl: function(model) {
    return model.get("datasetSlug") + "/" + model.id;
  },

  // NOTE this is not in Shareabouts.js
  // this will be "mobile" or "desktop", as defined in default.css
  getPageLayout: function() {
    // not IE8
    if (window.getComputedStyle) {
      return window
        .getComputedStyle(document.body, ":after")
        .getPropertyValue("content");
    }

    // IE8
    return "desktop";
  },

  // ====================================================
  // Event and State Logging

  log: function() {
    var args = Array.prototype.slice.call(arguments, 0);

    if (window.ga) {
      this.analytics(args);
    } else {
      this.console.log(args);
    }
  },

  analytics: function(args) {
    var firstArg = args.shift(),
      secondArg,
      measure,
      measures = {
        "center-lat": "metric1",
        "center-lng": "metric2",
        zoom: "metric3",

        "panel-state": "dimension1",
        "language-code": "dimension2",
      };

    switch (firstArg.toLowerCase()) {
      case "route":
        args = ["send", "pageview"].concat(args);
        break;

      case "user":
        args = ["send", "event"].concat(args);
        break;

      case "app":
        secondArg = args.shift();
        measure = measures[secondArg];
        if (!measure) {
          this.console.error(
            'No metrics or dimensions matching "' + secondArg + '"',
          );
          return;
        }
        args = ["set", measure].concat(args);
        break;

      default:
        return;
    }

    window.ga.apply(window, args);
  },

  // For browsers without a console
  console: window.console || {
    log: function() {},
    debug: function() {},
    info: function() {},
    warn: function() {},
    error: function() {},
  },

  // ====================================================
  // File and Image Handling

  fileInputSupported: function() {
    // http://stackoverflow.com/questions/4127829/detect-browser-support-of-html-file-input-element
    var dummy = document.createElement("input");
    dummy.setAttribute("type", "file");
    if (dummy.disabled) return false;

    // We also need support for the FileReader interface
    // https://developer.mozilla.org/en-US/docs/Web/API/FileReader
    var fr;
    if (!window.FileReader) return false;
    fr = new FileReader();
    if (!fr.readAsArrayBuffer) return false;

    return true;
  },

  fixImageOrientation: function(canvas, orientation) {
    var rotated = document.createElement("canvas"),
      ctx = rotated.getContext("2d"),
      width = canvas.width,
      height = canvas.height;

    switch (orientation) {
      case 5:
      case 6:
      case 7:
      case 8:
        rotated.width = canvas.height;
        rotated.height = canvas.width;
        break;
      default:
        rotated.width = canvas.width;
        rotated.height = canvas.height;
    }

    switch (orientation) {
      case 1:
        // nothing
        break;
      case 2:
        // horizontal flip
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        break;
      case 3:
        // 180 rotate left
        ctx.translate(width, height);
        ctx.rotate(Math.PI);
        break;
      case 4:
        // vertical flip
        ctx.translate(0, height);
        ctx.scale(1, -1);
        break;
      case 5:
        // vertical flip + 90 rotate right
        ctx.rotate(0.5 * Math.PI);
        ctx.scale(1, -1);
        break;
      case 6:
        // 90 rotate right
        ctx.rotate(0.5 * Math.PI);
        ctx.translate(0, -height);
        break;
      case 7:
        // horizontal flip + 90 rotate right
        ctx.rotate(0.5 * Math.PI);
        ctx.translate(width, -height);
        ctx.scale(-1, 1);
        break;
      case 8:
        // 90 rotate left
        ctx.rotate(-0.5 * Math.PI);
        ctx.translate(-width, 0);
        break;
      default:
        break;
    }

    ctx.drawImage(canvas, 0, 0);

    return rotated;
  },

  fileToCanvas: function(file, callback, options) {
    var fr = new FileReader();

    fr.onloadend = function() {
      // get EXIF data
      var exif = EXIF.readFromBinaryFile(new BinaryFile(this.result)),
        orientation = exif.Orientation;

      loadImage(
        file,
        function(canvas) {
          // rotate the image, if needed
          var rotated = self.fixImageOrientation(canvas, orientation);
          callback(rotated);
        },
        options,
      );
    };

    fr.readAsArrayBuffer(file); // read the file
  },

  wrapHandler: function(evtName, model, origHandler) {
    var newHandler = function(evt) {
      model.trigger(evtName, evt);
      if (origHandler) {
        origHandler.apply(this, arguments);
      }
    };
    return newHandler;
  },

  callWithRetries: function(func, retryCount, context) {
    var args = Array.prototype.slice.call(arguments, 3),
      options = _.last(args),
      errorHandler = options.error,
      retries = 0;

    if (!options) {
      options = {};
      args.push(options);
    }

    options.error = function() {
      if (retries < retryCount) {
        retries++;
        setTimeout(function() {
          func.apply(context, args);
        }, retries * 100);
      } else {
        if (errorHandler) {
          errorHandler.apply(context, arguments);
        }
      }
    };

    func.apply(context, args);
  },

  // Cookies! Om nom nom
  // Thanks ppk! http://www.quirksmode.org/js/cookies.html
  cookies: {
    save: function(name, value, days, prefix) {
      var expires,
        prefix = prefix || "",
        name = prefix + name;
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toGMTString();
      } else {
        expires = "";
      }
      document.cookie = name + "=" + value + expires + "; path=/";
    },
    get: function(name, prefix) {
      var prefix = prefix || "",
        nameEQ = prefix + name + "=",
        ca = document.cookie.split(";");
      var ca = document.cookie.split(";");
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === " ") {
          c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
          return c.substring(nameEQ.length, c.length);
        }
      }
      return null;
    },
    destroy: function(name) {
      this.save(name, "", -1);
    },
  },

  localstorage: {
    LOCALSTORAGE_PREFIX: "mapseed-",
    save: function(name, value, days) {
      var expDate = new Date();
      expDate.setTime(expDate.getTime() + days * 24 * 60 * 60 * 1000);
      try {
        localStorage.setItem(
          this.LOCALSTORAGE_PREFIX + name,
          JSON.stringify({
            expires: expDate,
            value: value,
          }),
        );
      } catch (e) {
        // ignore exceptions
      }
    },
    get: function(name) {
      var now = new Date().getTime(),
        name = this.LOCALSTORAGE_PREFIX + name,
        item = {};
      try {
        item = JSON.parse(localStorage.getItem(name)) || {};
      } catch (e) {
        // ignore exceptions
      }
      if (now > Date.parse(item.expires)) {
        try {
          localStorage.removeItem(name);
        } catch (e) {
          // ignore exceptions
        }

        return null;
      }

      return item.value;
    },
    destroy: function(name) {
      name = this.LOCALSTORAGE_PREFIX + name;
      try {
        localStorage.removeItem(name);
      } catch (e) {
        // ignore exceptions
      }
    },
  },

  MapQuest: {
    geocode: function(location, bounds, options) {
      var mapQuestKey = Shareabouts.bootstrapped.mapQuestKey;

      if (!mapQuestKey) {
        // REACT PORT SECTION //////////////////////////////////////////////////

        // call the error handler here to provide better user feedback
        options.error();
        // END REACT PORT SECTION //////////////////////////////////////////////
        throw "You must provide a MapQuest key for geocoding to work.";
      }

      options = options || {};
      options.dataType = "jsonp";
      options.cache = true;
      options.url =
        "https://open.mapquestapi.com/geocoding/v1/address?key=" +
        mapQuestKey +
        "&location=" +
        location;
      if (bounds) {
        options.url += "&boundingBox=" + bounds.join(",");
      }
      $.ajax(options);
    },
    reverseGeocode: function(latLng, options) {
      var mapQuestKey = Shareabouts.bootstrapped.mapQuestKey,
        lat,
        lng;

      if (!mapQuestKey)
        throw "You must provide a MapQuest key for geocoding to work.";

      lat = latLng.lat || latLng[0];
      lng = latLng.lng || latLng[1];
      options = options || {};
      options.dataType = "jsonp";
      options.cache = true;
      options.url =
        "https://open.mapquestapi.com/geocoding/v1/reverse?key=" +
        mapQuestKey +
        "&location=" +
        lat +
        "," +
        lng;
      $.ajax(options);
    },
  },

  Mapbox: {
    /* ========================================
       * Because of an accident of history, geocoding with the MapQuest API was
       * implemented first in Shareabouts. Thus, in order for geocoder results
       * from anywhere else to be useful, they have to look like mapquest
       * results.
       *
       * TODO: I'd rather see both the mapquest and mapbox results look more
       * like GeoJSON, e.g. Carmen:
       *
       *     https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
       */

    // L.mapbox.accessToken = 'pk.eyJ1Ijoib3BlbnBsYW5zIiwiYSI6ImNpZjVjdWxpMDBhMnVzcG0zYjZzaXcyczMifQ.lY5dtGpiFt2BvlywF1n59Q';
    // Shareabouts.geocoderControl = L.mapbox.geocoderControl('mapbox.places', {autocomplete: true});
    // window.app.appView.mapView.map.addControl(Shareabouts.geocoderControl);

    toMapQuestResult: function(result) {
      result.latLng = { lat: result.center[1], lng: result.center[0] };

      if (result.center) delete result.center;
      if (result.relevance) delete result.relevance;
      if (result.address) delete result.address;
      if (result.context) delete result.context;
      if (result.bbox) delete result.bbox;
      if (result.id) delete result.id;
      if (result.text) delete result.text;
      if (result.type) delete result.type;

      return result;
    },
    toMapQuestResults: function(data) {
      // Make Mapbox reverse geocode results look kinda like
      // MapQuest results.
      data.results = data.features;
      if (data.results.length > 0) {
        data.results[0] = {
          locations: [self.Mapbox.toMapQuestResult(data.results[0])],
          providedLocation: { location: data.query.join(" ") },
        };
      }
      return data;
    },

    geocode: function({ location, hint, bbox, options }) {
      var mapboxToken = Shareabouts.bootstrapped.mapboxToken,
        originalSuccess = options && options.success,
        transformedResultsSuccess = function(data) {
          if (originalSuccess) {
            originalSuccess(self.Mapbox.toMapQuestResults(data));
          }
        };

      if (!mapboxToken)
        throw "You must provide a Mapbox access token " +
          "(Shareabouts.bootstrapped.mapboxToken) for geocoding to work.";

      options = options || {};
      options.dataType = "json";
      options.cache = true;
      options.url =
        "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
        encodeURIComponent(location) +
        ".json?access_token=" +
        mapboxToken;
      if (hint) {
        options.url += "&proximity=" + hint.join(",");
      }
      if (bbox) {
        options.url += "&bbox=" + bbox.join(",");
      }
      options.success = transformedResultsSuccess;
      $.ajax(options);
    },
    reverseGeocode: function(latLng, options) {
      var mapboxToken = Shareabouts.bootstrapped.mapboxToken,
        lat,
        lng;

      if (!mapboxToken)
        throw "You must provide a Mapbox access token " +
          "(Shareabouts.bootstrapped.mapboxToken) for geocoding to work.";

      lat = latLng.lat || latLng[0];
      lng = latLng.lng || latLng[1];
      options = options || {};
      options.dataType = "json";
      options.cache = true;
      options.url =
        "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
        lng +
        "," +
        lat +
        ".json?access_token=" +
        mapboxToken;
      $.ajax(options);
    },
  },
});

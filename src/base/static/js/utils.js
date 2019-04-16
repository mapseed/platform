var self = (module.exports = {
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

  getSocialUrl: function(place, appConfig) {
    var shareUrl = "http://social.mapseed.org",
      components = {
        title: place.title || place.name || appConfig.title,
        desc: place.description || appConfig.meta_description,
        img:
          place.attachments.length > 0
            ? place.attachments[0].file
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
          place._clientSlug + "/" + place.id,
        ].join(""),
      },
      img = document.querySelector("img[src='" + components.img + "']");

    components["height"] = img.height || 630;
    components["width"] = img.width || 1200;

    // return a promise that immediately resolves to our share url:
    const queryString = this.buildSharingQuerystring(components);
    return Promise.resolve(encodeURIComponent(`${shareUrl}${queryString}`));
  },

  onSocialShare: function({ place, service, appConfig }) {
    this.getSocialUrl(place, appConfig).then(shareUrl => {
      let url =
        service === "facebook"
          ? `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`
          : `https://twitter.com/intent/tweet?url=${shareUrl}`;
      window.open(url, "_blank").focus();
    });
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

  // ====================================================
  // Event and State Logging

  log: function() {
    var args = Array.prototype.slice.call(arguments, 0);

    this.console.log(args);
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

  // Cookies! Om nom nom
  // Thanks ppk! http://www.quirksmode.org/js/cookies.html
  cookies: {
    save: function(name, value, days, prefix) {
      let expires;
      prefix = prefix || "";
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
      prefix = prefix || "";
      const nameEQ = prefix + name + "=";
      const ca = document.cookie.split(";");
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
      name = this.LOCALSTORAGE_PREFIX + name;
      let now = new Date().getTime(),
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

  Mapbox: {
    geocode: function({ location, hint, bbox, options }) {
      const mapboxToken = Mapseed.bootstrapped.mapboxToken;

      if (!mapboxToken)
        throw "You must provide a Mapbox access token " +
          "(Mapseed.bootstrapped.mapboxToken) for geocoding to work.";

      let url =
        "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
        encodeURIComponent(location) +
        ".json?access_token=" +
        mapboxToken;
      if (hint) {
        url += "&proximity=" + hint.join(",");
      }
      if (bbox) {
        url += "&bbox=" + bbox.join(",");
      }

      fetch(url)
        .then(response => response.json())
        .then(data => options.success(data));
    },
    reverseGeocode: function(latLng, options) {
      var mapboxToken = Mapseed.bootstrapped.mapboxToken,
        lat,
        lng;

      if (!mapboxToken)
        throw "You must provide a Mapbox access token " +
          "(Mapseed.bootstrapped.mapboxToken) for geocoding to work.";

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

      fetch(options.url);
    },
  },
});

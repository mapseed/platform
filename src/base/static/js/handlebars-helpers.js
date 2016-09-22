  var Util = require('./utils.js');

  Handlebars.registerHelper('STATIC_URL', function() {
    return Shareabouts.bootstrapped.staticUrl;
  });

  Handlebars.registerHelper('debug', function(value) {
    if (typeof(value) === typeof({})) {
      return JSON.stringify(value, null, 4);
    } else {
      return value;
    }
  });

  Handlebars.registerHelper('current_url', function() {
    return window.location.toString();
  });

  Handlebars.registerHelper('permalink', function() {
    return window.location.toString();
  });

  Handlebars.registerHelper('is', function(a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('is_not', function(a, b, options) {
    return a !== b ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('if_fileinput_not_supported', function(options) {    
    return !Util.fileInputSupported() ? options.fn(this) : null;
  });

  Handlebars.registerHelper('if_not_authenticated', function(options) {
    return !(Shareabouts.bootstrapped && Shareabouts.bootstrapped.currentUser) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('property', function(a, b) {
    return a[b];
  });

  // Current user -------------------------------------------------------------

  Handlebars.registerHelper('is_authenticated', function(options) {
    return (Shareabouts.bootstrapped && Shareabouts.bootstrapped.currentUser) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('current_user', function(attr) {
    return (Shareabouts.bootstrapped.currentUser ? Shareabouts.bootstrapped.currentUser[attr] : undefined);
  });

  // Date and time ------------------------------------------------------------

  Handlebars.registerHelper('formatdatetime', function(datetime, format) {
    if (datetime) {
      return moment(datetime).format(format);
    }
    return datetime;
  });

  Handlebars.registerHelper('fromnow', function(datetime) {
    if (datetime) {
      return moment(datetime).fromNow();
    }
    return '';
  });

  // String -------------------------------------------------------------------

  Handlebars.registerHelper('truncatechars', function(text, maxLength, continuationString) {
    if (_.isUndefined(continuationString) || !_.isString(continuationString)) {
      continuationString = '...';
    }

    if (text && text.length > maxLength) {
      return text.slice(0, maxLength - continuationString.length) + continuationString;
    } else {
      return text;
    }
  });

  Handlebars.registerHelper('is_submitter_name', function(options) {
    return (this.name === 'submitter_name') ? options.fn(this) : options.inverse(this);
  });

  // Place Details ------------------------------------------------------------
  Handlebars.registerHelper('action_text', function() {
    return Shareabouts.Config.place.action_text || '';
  });

  Handlebars.registerHelper('place_type_label', function(typeName) {
    var placeType = Shareabouts.Config.placeTypes[typeName];
    return placeType ? (placeType.label || typeName) : '';
  });

  Handlebars.registerHelper('anonymous_name', function(typeName) {
    return Shareabouts.Config.place.anonymous_name;
  });

  Handlebars.registerHelper('survey_label_by_count', function() {
    var count = 0,
        submissionSet;

    if (this.submission_sets && this.submission_sets[Shareabouts.Config.survey.submission_type]) {
      submissionSet = this.submission_sets[Shareabouts.Config.survey.submission_type];
      count = submissionSet ? submissionSet.length : 0;
    }

    if (count === 1) {
      return Shareabouts.Config.survey.response_name;
    }
    return Shareabouts.Config.survey.response_plural_name;
  });

  Handlebars.registerHelper('survey_label', function() {
    return Shareabouts.Config.survey.response_name;
  });

  Handlebars.registerHelper('survey_label_plural', function() {
    return Shareabouts.Config.survey.response_plural_name;
  });

  Handlebars.registerHelper('support_label', function() {
    return Shareabouts.Config.support.response_name;
  });

  Handlebars.registerHelper('support_label_plural', function() {
    return Shareabouts.Config.support.response_plural_name;
  });


  Handlebars.registerHelper('survey_count', function() {
    var count = 0,
        submissionSet;

    if (this.submission_sets && this.submission_sets[Shareabouts.Config.survey.submission_type]) {
      submissionSet = this.submission_sets[Shareabouts.Config.survey.submission_type];
      count = submissionSet ? submissionSet.length : 0;
    }

    return count;
  });

  // Gets the value for the given object and key. Useful for using the value
  // of a token as a key.
  Handlebars.registerHelper('get_value', function(obj, key, options) {
    return obj[key];
  });

  // Similar to the helper in our shared handlebars helpers repo, but gets the
  // value via a given object and key (like get_value).
  Handlebars.registerHelper('select_item_value', function(obj, key, options) {
    var value = obj[key],
        $el = $('<div/>').html(options.fn(this)),
        selectValue = function(v) {
          $el.find('[value="'+v+'"]').attr({
            checked: 'checked',
            selected: 'selected'
          });
        };

    if ($.isArray(value)) {
      jQuery.each(value, function(i, v) {
        selectValue(v);
      });
    } else {
      selectValue(value);
    }

    return $el.html();
  });

  Handlebars.registerHelper("contains", function( value, array, options ){
    array = ( array instanceof Array ) ? array : [array];
    return (array.indexOf(value) > -1) ? options.fn( this ) : "";
  });

  Handlebars.registerHelper('each_place_item', function() {
    var self = this,
        result = '',
        args = Array.prototype.slice.call(arguments),
        exclusions, options,
        selectedCategoryConfig = _.find(Shareabouts.Config.place.place_detail, function(categoryConfig) { return categoryConfig.category === self.location_type; }) || {};

    options = args.slice(-1)[0];
    exclusions = args.slice(0, args.length-1);

    // iterate through all the form fields for this location_type
    _.each(selectedCategoryConfig.fields, function(item, i) {
      // handle input types on a case-by-case basis, building an appropriate
      // context object for each
      var userInput = self[item.name],
      fieldType = item.type,
      content, 
      wasAnswered = false;

      if (fieldType === "text" || fieldType === "textarea" || fieldType === "datetime" || fieldType === "richTextarea") {
        // case: plain text
        content = userInput || "";
        if (content !== "") {
          wasAnswered = true;
        }
      } else if (fieldType === "checkbox_big_buttons" || fieldType === "radio_big_buttons" || fieldType === "dropdown") {
        // case: checkboxes, radio buttons, and dropdowns
        // if input is not an array, convert to an array of length 1
        if (!$.isArray(self[item.name])) {
          userInput = [self[item.name]];
        }
        content = [];
        _.each(item.content, function(option) {
          var selected = false;
          if (_.contains(userInput, option.value)) {
            selected = true;
            wasAnswered = true;
          }
          content.push({
            value: option.value,
            label: option.label,
            selected: selected
          });
        });
      } else if (fieldType === "binary_toggle") {
        // case: binary toggle buttons
        // NOTE: we assume that the first option listed under content
        // corresponds to the "on" value of the toggle input
        content = {
          selectedValue: item.content[0].value,
          selectedLabel: item.content[0].label,
          unselectedValue: item.content[1].value,
          unselectedLabel: item.content[1].label,
          selected: (userInput == item.content[0].value) ? true : false
        }
        wasAnswered = true;
      }

      var newItem = {
        name: item.name,
        type: item.type,
        content: content,
        prompt: item.display_prompt,
        wasAnswered: wasAnswered,
        isEditingToggled: this.isEditingToggled
      };

      if (_.contains(exclusions, item.name) === false &&
          item.name.indexOf('private-') !== 0 &&
            newItem.content != undefined && 
              newItem.wasAnswered === true) {
        result += options.fn(newItem);
      }
    }, this);

    return result;
  });

  Handlebars.registerHelper('place_url', function(place_id) {
    var l = window.location,
        protocol = l.protocol,
        host = l.host;

    return [protocol, '//', host, '/place/', place_id].join('');
  });

// Get the current url
Handlebars.registerHelper('windowLocation', function(place_id) {
  return window.location;
});

// Change new lines to <br> tags. This one is better than Swag.
Handlebars.registerHelper('nlToBr', function(str) {
  if (str) {
    str = Handlebars.Utils.escapeExpression(str);
    return new Handlebars.SafeString(str.replace(/\r?\n|\r/g, '<br>'));
  } else {
    return str;
  }
});

// Date and time ------------------------------------------------------------
Handlebars.registerHelper('formatDateTime', function(datetime, format) {
  if (datetime) {
    return moment(datetime).format(format);
  }
  return '';
});

Handlebars.registerHelper('fromNow', function(datetime) {
  if (datetime) {
    return moment(datetime).fromNow();
  }
  return '';
});

// Iteration ----------------------------------------------------------------
Handlebars.registerHelper('times', function(n, options) {
  var accum = '', i;
  for(i = 0; i < n; ++i){
    accum += options.fn(i);
  }
  return accum;
});

Handlebars.registerHelper('range', function(from, to, options) {
  var accum = '', i;
  for(i = from; i < to; i++){
    accum += options.fn(i);
  }
  return accum;
});

// HTML ---------------------------------------------------------------------
Handlebars.registerHelper('select', function(value, options) {
  var $el = $('<div/>').html(options.fn(this)),
    selectValue = function(v) {
      $el.find('[value="'+v+'"]').attr({
        checked: 'checked',
        selected: 'selected'
      });
    };

  if ($.isArray(value)) {
    jQuery.each(value, function(i, v) {
      selectValue(v);
    });
  } else {
    selectValue(value);
  }

  return $el.html();
});

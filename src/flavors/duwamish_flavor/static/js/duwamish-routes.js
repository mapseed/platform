/*globals Backbone jQuery _ */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.App = S.App.extend({
    routes: {
      '': 'viewMap',
      'place/new': 'newPlace',
      'place/new/observation': 'newPlaceObservation',
      'place/new/question': 'newPlaceQuestion',
      'place/new/idea': 'newPlaceIdea',
      'place/new/complaint': 'newPlaceComplaint',
      'place/new/greenwall': 'newPlaceGreenwall',
      ':collectionId/:id': 'viewLandmark',
      'place/:id': 'viewPlace',
      'place/:id/response/:response_id': 'viewPlace',
      'place/:id/edit': 'editPlace',
      'list': 'showList',
      'page/:slug': 'viewPage',
      'filter/:locationtype': 'filterMap',
      ':zoom/:lat/:lng': 'viewMap'
    },
    // After the user selects an option in the first step open form view for the corresponding first form step option
    newPlaceObservation: function() {
      this.appView.newPlaceObservation();
    },

    newPlaceQuestion: function() {
      this.appView.newPlaceQuestion();
    },

    newPlaceIdea: function() {
      this.appView.newPlaceIdea();
    },

    newPlaceComplaint: function() {
      this.appView.newPlaceComplaint();
    },

    newPlaceGreenwall: function() {
      this.appView.newPlaceGreenwall();
    }

  });
}(Shareabouts, jQuery, Shareabouts.Util.console));

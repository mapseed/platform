let MapView = require("../../../../../base/static/js/views/map-view.js");
const MAX_LOCATION_TYPES = 8;
const Y_JITTER_RANGE = [[-20, -80], [20, 80]];
const X_JITTER_RANGE = [[-20, -80], [20, 80]];
const TWO_PI = 2*Math.PI;

module.exports = MapView.extend({
  getLayerGroups: function() {
    if (!this.options.cluster) {
      return L.layerGroup();
    } else {
      let getRandomInSplitRange = (splitRange) => {
        let range = [];

        splitRange.forEach((segment) => {
          let len = Math.abs(segment[1] - segment[0]);
          range = range.concat(Array(len).fill().map((_, i) => i + Math.min(segment[0], segment[1])));
        });

        return range[(Math.floor(Math.random() * range.length)) - 1];
      },
      jitters = [];

      for (let i = 0; i < MAX_LOCATION_TYPES; i++) {
        jitters.push([getRandomInSplitRange(X_JITTER_RANGE), getRandomInSplitRange(Y_JITTER_RANGE)]);
      }

      Object.assign(this.options.cluster, {

        // NOTE: at map zoom levels >= 16, we create small clusters composed of all
        // location_types.
        // At zoom levels < 16, however, we use clustering by location_type, 
        // striving for a nice distribution of icons around the map.
        maxClusterRadius: (zoom) => {
          return (zoom >= 16) ? 40 : 110;
        },
        iconCreateFunction: (cluster) => {
          if (this.map.getZoom() >= 16) {
            return L.divIcon({
              className: "",
              html: "<div class='cluster-child-counter'>" + cluster.getChildCount() + "</div>"
            });
          } else {
            let clusterSubGroups = {},
                numClusterSubGroups,
                html,
                i = 0;

            cluster.getAllChildMarkers().forEach((child) => {
              if (!clusterSubGroups[child.getLocationType()]) {
                clusterSubGroups[child.getLocationType()] = {
                  count: 1,
                  iconUrl: this.options.placeConfig.place_detail.filter((config) => {
                    return config.category === child.getLocationType();
                  })[0].icon_url
                }
              } else {
                clusterSubGroups[child.getLocationType()].count++;
              }
            });

            numClusterSubGroups = Object.keys(clusterSubGroups).length;

            for (let x in clusterSubGroups) {
              html += [
                "<div class='cluster-subgroup-container' style='left: ",
                Math.sin(i*(TWO_PI/(numClusterSubGroups))) * (jitters[i][0]),
                "px; top: ", 
                Math.cos(i*(TWO_PI/(numClusterSubGroups))) * (jitters[i][1]),
                "px'><img class='custom-cluster-icon' src='",
                clusterSubGroups[x].iconUrl,
                "' /><div class='cluster-child-counter top-right'>", 
                clusterSubGroups[x].count, 
                "</div></div>"
              ].join("");

              i++;
            }

            return L.divIcon({
              className: "",
              html: html
            });
          }
        }
      });
    }

    return L.markerClusterGroup(this.options.cluster);
  }
});
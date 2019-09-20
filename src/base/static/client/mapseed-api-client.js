import activityClient from "./mapseed-api-client/activity";
import attachmentsClient from "./mapseed-api-client/attachments";
import commentsClient from "./mapseed-api-client/comments";
import datasetsClient from "./mapseed-api-client/datasets";
import placeClient from "./mapseed-api-client/place";
import placeTagsClient from "./mapseed-api-client/place-tags";
import sessionClient from "./mapseed-api-client/session";
import supportClient from "./mapseed-api-client/support";
import userClient from "./mapseed-api-client/user";
import flavorClient from "./mapseed-api-client/flavor";

export default {
  activity: activityClient,
  attachments: attachmentsClient,
  comments: commentsClient,
  datasets: datasetsClient,
  place: placeClient,
  placeTags: placeTagsClient,
  session: sessionClient,
  support: supportClient,
  user: userClient,
  flavor: flavorClient,
};

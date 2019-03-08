import activityClient from "./mapseed-api-client/activity";
import attachmentsClient from "./mapseed-api-client/attachments";
import commentsClient from "./mapseed-api-client/comments";
import datasetsClient from "./mapseed-api-client/datasets";
import placeClient from "./mapseed-api-client/place";
import placeTagsClient from "./mapseed-api-client/place-tags";
import supportClient from "./mapseed-api-client/support";
import userClient from "./mapseed-api-client/user";

export default {
  activity: activityClient,
  attachments: attachmentsClient,
  comments: commentsClient,
  datasets: datasetsClient,
  place: placeClient,
  placeTags: placeTagsClient,
  support: supportClient,
  user: userClient,
};

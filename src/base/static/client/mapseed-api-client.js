import activityClient from "./activity";
import attachmentsClient from "./attachments";
import commentsClient from "./comments";
import datasetsClient from "./datasets";
import placeClient from "./place";
import placeTagsClient from "./place-tags";
import supportClient from "./support";

export default {
  activity: activityClient,
  attachments: attachmentsClient,
  comments: commentsClient,
  datasets: datasetsClient,
  place: placeClient,
  placeTags: placeTagsClient,
  support: supportClient,
};

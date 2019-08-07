import qs from "qs";
import download from "downloadjs";

export default {
  getPDF: ({ url, filename, jwtPublic = null }) => {
    if (jwtPublic) {
      // Don't use qs.stringify here, as we don't want to double-URIEncode
      // this parameter below.
      url += `?token=${jwtPublic}`;
    }

    fetch(
      `https://jlupes39i0.execute-api.us-west-2.amazonaws.com/v1/generate-pdf?${qs.stringify(
        {
          url,
          filename,
        },
      )}`,
    )
      .then(response => response.blob())
      .then(blob => download(blob, filename))
      .catch(e => {
        // eslint-disable-next-line no-console
        console.error("Error: Failed to generate and download report PDF:", e);

        import("../utils/mixpanel").then(mixpanel => {
          mixpanel.Mixpanel.track("Error", {
            message: "failed to generate and download report PDF",
            error: e,
          });
        });
      });
  },
};

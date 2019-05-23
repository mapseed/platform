import qs from "qs";
import download from "downloadjs";
import { Mixpanel } from "../../utils/mixpanel";

export default {
  getPDF: async ({ url, filename }) => {
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
        console.error("Error: Failed to generate PDF:", e);

        Mixpanel.track("Error", {
          message: "unable to generate and download report PDF",
          error: e,
        });
      });
  },
};

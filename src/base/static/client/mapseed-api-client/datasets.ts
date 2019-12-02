//import { DatasetConfig } from "../../state/ducks/datasets-config";
import { Dataset, DatasetFromAPI } from "../../state/ducks/datasets";

const getDatasets = async (
  datasetConfigs,
  apiRoot,
): Promise<Dataset[]> => {
  return Promise.all(
    datasetConfigs.map(
      async ({ user, slug, anonymousPermissions, placeConfirmationModal }) => {
        const response = await fetch(`${apiRoot}${user}/datasets/${slug}`, {
          credentials: "include",
        });

        if (response.status < 200 || response.status >= 300) {
          throw Error(
            `Error: Failed to fetch datasets: ${response.statusText}`,
          );
        }

        const dataset: DatasetFromAPI = await response.json();

        return {
          ...dataset,
          // TODO: Eventually all information regarding datasets should be
          // served from the `/datasets` endpoint.
          anonymousPermissions,
          placeConfirmationModal,
        };
      },
    ),
  );
};

export default {
  get: getDatasets,
};

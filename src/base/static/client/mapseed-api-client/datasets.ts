import { DatasetConfig } from "../../state/ducks/datasets-config";
import { Dataset } from "../../state/ducks/datasets";

const getDatasets = async (
  datasetConfigs: DatasetConfig[],
): Promise<Dataset[]> => {
  return Promise.all(
    datasetConfigs.map(async datasetConfig => {
      const response = await fetch(datasetConfig.url, {
        credentials: "include",
      });

      if (response.status < 200 || response.status >= 300) {
        // eslint-disable-next-line no-console
        console.error("Error: Failed to fetch datasets.", response.statusText);

        return null;
      }

      return response.json();
    }),
  );
};

export default {
  get: getDatasets,
};

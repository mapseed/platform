import { DatasetConfig } from "../../state/ducks/datasets-config";
import { Dataset, DatasetFromAPI } from "../../state/ducks/datasets";

const getDatasets = async (
  datasetConfigs: DatasetConfig[],
): Promise<Dataset[]> => {
  return Promise.all(
    datasetConfigs.map(async datasetConfig => {
      const response = await fetch(datasetConfig.url, {
        credentials: "include",
      });

      if (response.status < 200 || response.status >= 300) {
        throw Error(`Error: Failed to fetch datasets: ${response.statusText}`);
      }

      const dataset: DatasetFromAPI = await response.json();
      return {
        ...dataset,
        clientSlug: datasetConfig.clientSlug,
      };
    }),
  );
};

export default {
  get: getDatasets,
};

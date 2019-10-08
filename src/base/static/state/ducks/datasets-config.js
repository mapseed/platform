import produce from "immer";
import PropTypes from "prop-types";

// Selectors:
export const datasetSlugsSelector = state =>
  state.datasetsConfig.map(config => config.slug);

export const datasetsConfigSelector = state => state.datasetsConfig;

export const datasetClientSlugSelector = (state, datasetSlug) =>
  state.datasetsConfig.find(datasetConfig => datasetConfig.slug === datasetSlug)
    .clientSlug;

export const datasetReportSelector = (state, datasetSlug) =>
  state.datasetsConfig.find(datasetConfig => datasetConfig.slug === datasetSlug)
    .report;

export const datasetsConfigPropType = PropTypes.arrayOf(
  PropTypes.shape({
    url: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    clientSlug: PropTypes.string.isRequired,
    anonymous_permissions: PropTypes.arrayOf(
      PropTypes.shape({
        abilities: PropTypes.arrayOf(PropTypes.string).isRequired,
        submission_set: PropTypes.string.isRequired,
      }),
    ).isRequired,
  }),
).isRequired;

// TODO: refactor these to use Datasets, not DatasetConfigs, and move into a
// "permissions" util.
export const hasAnonAbilitiesInAnyDataset = ({
  state,
  abilities,
  submissionSet,
}) =>
  datasetsConfigSelector(state)
    .filter(config => !config.auth_required)
    .some(config =>
      config.anonymous_permissions.some(
        perm =>
          (perm.submission_set === "*" ||
            perm.submission_set === submissionSet) &&
          // All the passed abilities must exist in the array of allowed
          // abilities.
          abilities.filter(ability => perm.abilities.includes(ability))
            .length === abilities.length,
      ),
    );
export const hasAnonAbilitiesInDataset = ({
  state,
  abilities,
  submissionSet,
  datasetSlug,
}) =>
  datasetsConfigSelector(state)
    .filter(config => config.slug === datasetSlug && !config.auth_required)
    .some(config =>
      config.anonymous_permissions.some(
        perm =>
          (perm.submission_set === "*" ||
            perm.submission_set === submissionSet) &&
          abilities.filter(ability => perm.abilities.includes(ability))
            .length === abilities.length,
      ),
    );

// Actions:
const LOAD = "datasets-config/LOAD";

// Action creators:
export function loadDatasetsConfig(datasetsConfig) {
  return { type: LOAD, payload: datasetsConfig };
}

// Reducers:
const INITIAL_STATE = [];

export default (state = INITIAL_STATE, action) =>
  produce(state, draft => {
    switch (action.type) {
      case LOAD:
        action.payload.map(datasetConfig => {
          draft.push({
            ...datasetConfig,
            url: `${API_ROOT}smartercleanup/datasets/${datasetConfig.slug}`,
          });
        });
    }
  });

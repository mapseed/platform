export type CustomComponentsConfig = {
  InputForm?: string;
  FieldSummary?: string;
};
// Selectors:
export const customComponentsConfigSelector: (
  state: any,
) => CustomComponentsConfig;

// Action creators:
export const loadCustomComponentsConfig: (
  config: CustomComponentsConfig,
) => void;

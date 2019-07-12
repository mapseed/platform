// Selectors:
export const placeConfigSelector: any;

export const placeConfigPropType: any;
export type PlaceConfig = {
  anonymous_name: string;
  action_text: string;
  place_detail: {
    category: string;
    label: string;
  }[];
  list: {
    fields: {
      name: string;
      image_name?: string;
      type?: string;
    }[];
  };
  geospatialAnalysis: {
    name: string;
    type: string;
    targetUrl: string;
    buffer: {
      distance: number;
      units: string;
    };
    aggregator: {
      type: string;
      property?: string;
    };
    propertiesToPluck: {
      name: string;
      fallbackValue: string | number | boolean;
    }[];
  }[];
};

// Action creators:
export const loadPlaceConfig: any;

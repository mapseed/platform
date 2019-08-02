export type Theme = {
  brand: {
    primary: string;
    secondary: string;
    tertiary: string;
    accent: string;
  };
  bg: {
    default: string;
    light: string;
    highlighted: string;
  };
  text: {
    primary: string;
    secondary: string;
    highlighted: string;
    headerFontFamily: string;
    bodyFontFamily: string;
    textTransform: string;
    titleColor: string;
    titleFontFamily: string;
  };
  map: {
    addPlaceButtonHoverBackgroundColor: string;
    addPlaceButtonBackgroundColor: string;
  };
  boxShadow: string;
};

export type AppConfig = {
  title: string;
  meta_description: string;
  thumbnail?: string;
  api_root: string;
  dataset_download: {};
  name?: string;
  time_zone: string;
  theme: Theme;
  isShowingMobileUserMenu?: boolean;
  languages: {
    code: string;
    label: string;
  }[];
  logo: string;
  show_name_in_header?: boolean;
};

export const appConfigSelector: (state: any) => AppConfig;

export const themeSelector: (state: any) => Theme;

export const themePropType: any;

export const appConfigPropType: any;

// Action creators:
export const loadAppConfig: (config: AppConfig) => void;

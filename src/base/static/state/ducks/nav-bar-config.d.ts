export type NavBarItem = {
  title?: string;
  type: string;
  url?: string;
  start_page?: boolean;
  name?: string;
  component?: string;
};

export type NavBarConfig = NavBarItem[];

export const navBarConfigSelector: (state: any) => NavBarConfig;

export const loadNavBarConfig: (navBarConfig: NavBarConfig) => void;

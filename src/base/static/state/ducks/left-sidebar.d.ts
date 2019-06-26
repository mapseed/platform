export type LayerGroup = {
  id: string;
  title: string;
  info?: {
    header: string;
    body: string;
  };
};

type LeftSidebarSection = {
  id: string;
  title: string;
  layerGroups: LayerGroup[];
};

export type LeftSidebarPanel = {
  id: string;
  component: string;
  title: string;
  icon: string;
  content: LeftSidebarSection[];
};

export type LeftSidebarConfig = {
  is_enabled: boolean;
  is_visible_default: boolean;
  panels: LeftSidebarPanel[];
  isExpanded: boolean;
};

export const leftSidebarPanelConfigSelector: any;
export const leftSidebarComponentSelector: any;
export const isLeftSidebarExpandedSelector: any;
export const setLeftSidebarExpanded: any;
export const setLeftSidebarComponent: any;
export const leftSidebarConfigSelector: any;
export const loadLeftSidebarConfig: any;

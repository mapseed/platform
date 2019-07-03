export type LeftSidebarOption = {
  layerGroupId: string;
  title: string;
  info?: {
    header: string;
    body: string;
  };
  // If an options with a filter is toggled, the layerGroup's filter is toggled:
  filter?: string;
};

export type LeftSidebarSection = {
  title: string;
  options: LeftSidebarOption[];
};

export type LeftSidebarConfig = {
  isExpanded: boolean;
  title: string;
  icon: string;
  sections: LeftSidebarSection[];
};

export const leftSidebarPanelConfigSelector: any;
export const isLeftSidebarExpandedSelector: any;
export const setLeftSidebarExpanded: any;
export const leftSidebarConfigSelector: any;
export const loadLeftSidebarConfig: any;

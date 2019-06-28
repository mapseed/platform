export type LeftSidebarOption = {
  layerGroupId: string;
  title: string;
  info?: {
    // This contains information to be shown in a popup modal:
    header: string;
    body: string;
  };
  // If an option with an aggregator is toggled, the layerGroup will be updated
  aggregationOptionId?: string;
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

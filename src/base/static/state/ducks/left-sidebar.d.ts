interface LayerGroup {
  id: string;
  title: string;
  // variant: PropTypes.oneOf(["layerGroup", "aggregate"]),
}

interface LeftSidebarSection {
  id: string;
  title: string;
  // TODO: rename this to "option"
  layerGroups: LayerGroup[];
}

export interface LeftSidebarPanel {
  id: string;
  component: string;
  title: string;
  icon: string;
  // TODO: rename this to "sections"
  content: LeftSidebarSection[];
}

export interface LeftSidebarConfig {
  is_enabled: boolean;
  is_visible_default: boolean;
  panels: LeftSidebarPanel[];
  isExpanded: boolean;
}

export const leftSidebarPanelConfigSelector: any;
export const leftSidebarComponentSelector: any;
export const isLeftSidebarExpandedSelector: any;
export const setLeftSidebarExpanded: any;
export const setLeftSidebarComponent: any;
export const leftSidebarConfigSelector: any;
export const loadLeftSidebarConfig: any;


// 'loadLeftSidebarConfig'.
// 'leftSidebarConfigPropType'.
// 'leftSidebarConfigSelector'.
// 'setLeftSidebarComponent'.

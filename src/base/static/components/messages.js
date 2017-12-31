// All component-based localizable messages are in this file.
// TODO: figure out how to work this in to the translation pipeline.

const mapDrawingToolbar = {
  selectTool: {
    header: "Click on a tool below to draw on the map"
  },
  createMarker: {
    header: "Drag your marker to reposition it"
  },
  createMarkerTool: {
    label: "Create marker"
  },
  editMarkerTool: {
    label: "Edit marker"
  },
  deleteMarkerTool: {
    label: "Delete marker"
  },
  selectMarkerType: {
    header: "Choose a marker style below"
  },
  createPolyline: {
    header: {
      initial: "Click anywhere on the map to start drawing",
      continue: "Click to continue drawing",
      continueOrFinish: "Click to continue drawing, or double click to complete your line"
    }
  },
  createPolylineTool: {
    label: "Create line"
  },
  editPolylineTool: {
    label: "Edit line"
  },
  deletePolylineTool: {
    label: "Delete line"
  },
  createPolygon: {
    header: {
      initial: "Click anywhere on the map to start drawing",
      continue: "Click to continue drawing",
      continueOrFinish: "Click to continue drawing, or click on your first point to complete your shape"
    }
  },
  createPolygonTool: {
    label: "Create shape"
  },
  editPolygonTool: {
    label: "Edit shape"
  },
  deletePolygonTool: {
    label: "Delete shape"
  },
  editMarker: {
    header: "Drag your marker to reposition it"
  },
  editPolyline: {
    header: "Drag line handles to edit your line, or click on line handles to delete vertices"
  },
  editPolygon: {
    header: "Drag shape handles to edit your shape, or click on shape handles to delete vertices"
  },
  colorpickerStrokeTool: {
    label: "Line color"
  },
  colorpickerFillTool: {
    label: "Fill color"
  }
};
const inputForm = {
  optionalMsg: "(optional)",
  validationHeader: "Your post is looking good, but we need some more information before we can share it on the map.",
  missingGeometry: "Please use the drawing toolbar to add a point, line, or polygon to the map.",
  missingRequired: "Please fill out the field(s) outlined below."
};
const customUrlField = {
  urlReadoutPrefix: "Your post will be accessible at:"
};
const geocodingField = {
  locationNotFoundError: "Sorry, we could not find that location."
};
const publishControlToolbar = {
  publishedLabel: "Published",
  notPublishedLabel: "Not published",
  publishedFooterMsg: "When created, this post will be visible to all map users",
  notPublishedFooterMsg: "When created, this post will be visible only to logged-in editors"
};
const dropdownField = {
  makeSelection: "Select..."
};

export { mapDrawingToolbar, inputForm, customUrlField, geocodingField,
         publishControlToolbar, dropdownField };

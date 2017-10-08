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
    header: "Drag your makrer to reposition it"
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
},
inputForm = {

},
customUrlField = {
  urlReadoutPrefix: "Your post will be accessible at:"
},
geocodingField = {
  locationNotFoundError: "Sorry, we could not find that location."
}

export { mapDrawingToolbar, inputForm, customUrlField, geocodingField };

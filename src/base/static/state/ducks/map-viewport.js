import produce from "immer";
const spread = produce(Object.assign);

export const mapViewportSelector = state => {
  return state.mapViewport;
};

const LOAD = "map-viewport/LOAD";
const UPDATE = "map-viewport/UPDATE";

export const loadMapViewport = payload => {
  return {
    type: LOAD,
    payload,
  };
};
export const updateMapViewport = (
  newMapViewport,
  scrollZoomAroundCenter = false,
) => {
  return {
    type: UPDATE,
    payload: {
      viewport: newMapViewport,
      scrollZoomAroundCenter,
    },
  };
};

const INITIAL_STATE = {
  zoom: 10,
  latitude: 0,
  longitude: 0,
  maxZoom: 18,
  minZoom: 1,
  pitch: 15,
};

// export default function reducer(state = INITIAL_STATE, action) {
export default (state = INITIAL_STATE, action) =>
  produce(state, draft => {
    switch (action.type) {
      case LOAD:
        Object.assign(draft, action.payload);
        return;
      case UPDATE:
        // NOTE: This is a fix for an apparent bug in react-map-gl.
        // See: https://github.com/uber/react-map-gl/issues/630
        draft.bearing = isNaN(action.payload.bearing)
          ? draft.bearing
          : action.payload.bearing;
        // These checks support a "scroll zoom around center" feature (in
        // which a zoom of the map will not change the centerpoint) that is
        // not exposed by react-map-gl. These checks are pretty convoluted,
        // though, so it would be great if react-map-gl could just
        // incorporate the scroll zoom around center option natively.
        // See: https://github.com/uber/react-map-gl/issues/515
        if (
          !action.payload.scrollZoomAroundCenter ||
          draft.zoom === action.payload.mapViewport.zoom
        ) {
          draft.latitude = action.payload.viewport.latitude;
          draft.longitude = action.payload.viewport.longitude;
          // } else if (draft.zoom === action.payload.mapViewport.zoom) {
          //   draft.latitude = action.payload.viewport.latitude;
          //   draft.longitude = action.payload.viewport.longitude;
        }
        draft.zoom = action.payload.viewport.zoom;
        draft.pitch = action.payload.viewport.pitch;
        return;
      // return {
      //   ...state,
      //   ...action.payload,
      //   // defaultMapViewport: {
      //   //   ...state.defaultMapViewport,
      //   //   ...action.payload.mapViewport,
      //   // },
      // };
    }
  });

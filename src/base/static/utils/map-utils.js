import { mapBasemapSelector } from "./state/ducks/map"

const setLayerVisibility = ({ basemap, layers }) => {
  const storyBasemapId = model.get("story").basemap;
  const storyVisibleLayerIds = model.get("story").visibleLayers;
  const visibleBasemapId = mapBasemapSelector(store.getState());

  if (storyBasemapId && storyBasemapId !== visibleBasemapId) {
    visibleBasemapId &&
      store.dispatch(
        setBasemap(storyBasemapId, {
          id: storyBasemapId,
          status: "loading",
          isVisible: true,
          isBasemap: true,
        }),
      );
  }
  if (storyVisibleLayerIds) {
    // Switch story layers on.
    storyVisibleLayerIds.forEach(layerId => {
      store.dispatch(
        setLayerStatus(layerId, {
          status: "loading",
          isVisible: true,
        }),
      );
    });

    // Switch all other visible layers off.
    Object.entries(mapLayerStatusesSelector(store.getState()))
      .filter(([layerId, layerStatus]) => !layerStatus.isBasemap)
      .forEach(([layerId, layerStatus]) => {
        if (layerStatus.isVisible && !storyVisibleLayerIds.includes(layerId)) {
          store.dispatch(
            setLayerStatus(layerId, {
              isVisible: false,
            }),
          );
        }
      });
  }
};

export { setStoryLayerVisibility };

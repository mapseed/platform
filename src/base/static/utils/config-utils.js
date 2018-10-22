const getCategoryConfig = (placeConfig, categoryName) => {
  return (
    placeConfig.place_detail.find(
      categoryConfig => categoryConfig.category === categoryName,
    ) || {}
  );
};

export { getCategoryConfig };

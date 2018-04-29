import { place as placeConfig } from "config";

const getCategoryConfig = categoryName => {
  return (
    placeConfig.place_detail.find(
      categoryConfig => categoryConfig.category === categoryName,
    ) || {}
  );
};

export { getCategoryConfig };

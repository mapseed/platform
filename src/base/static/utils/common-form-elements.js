module.exports = (placeDetail, commonFormElements) => {
  placeDetail.forEach(category => {
    category.fields = category.fields.map(field => {
      if (field.type === "common_form_element") {
        return Object.assign({}, commonFormElements[field.name], {
          name: field.name,
        });
      } else {
        return field;
      }
    });
  });

  return placeDetail;
};

import i18next from "i18next";

i18next.init({
  lng: "en_US",
  resources: {
    en_US: {
      translation: {
        exitOrContinueHeader: "Thanks for your comment!",
        submitAnother: "Submit another comment",
        exitSurvey: "Exit survey",
        categorySummaryLabel: "Summary",
        inputListHeader:
          "What concerns do you have about this garden or its future development?",
        subcategorySummaryLabel: "All",
        recommendationsLabel: "Recommendations",
        concernsLabel: "Concerns",
      },
    },
    es: {
      translation: {
        exitOrContinueHeader: "¡Gracias por su comentario!",
        submitAnother: "Enviar otro comentario",
        exitSurvey: "Salir",
        categorySummaryLabel: "Resumen",
        inputListHeader:
          "¿Qué preocupaciónes tienes sobre este jardín o su futuro desarrollo?",
        subcategorySummaryLabel: "All",
        recommendationsLabel: "Recomendaciónes",
        concernsLabel: "Preocupaciónes",
      },
    },
  },
});

export default i18next;

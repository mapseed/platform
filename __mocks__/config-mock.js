module.exports = {
  app: {},
  place_types: {},
  place: {
    place_detail: [
      {
        category: "someCategory",
        fields: [
          {
            name: "test1",
            type: "text",
          },
          {
            name: "test2",
            type: "text",
          },
          {
            name: "test3",
            type: "text",
          },
        ],
      },
      {
        category: "someMultiStageCategory",
        multi_stage: [
          {
            start_field_index: 1,
            end_field_index: 3,
            icon_url: "/path/to/icon1.png",
            header: "Stage 1 Header",
            description: "Stage 1 description.",
          },
          {
            start_field_index: 4,
            end_field_index: 4,
            icon_url: "/path/to/icon2.png",
            header: "Stage 2 Header",
            description: "Stage 2 description.",
          },
        ],
        fields: [
          {
            name: "test1",
            type: "text",
          },
          {
            name: "test2",
            type: "text",
          },
          {
            name: "test3",
            type: "text",
          },
          {
            name: "test4",
            type: "text,"
          },
        ],
      },
    ],
  },
  survey: {},
  support: {},
  pages: {},
  story: {},
  sidebar: {},
  activity: {},
  cluster: {},
};

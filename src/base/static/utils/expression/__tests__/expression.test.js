import makeParsedExpression from "../parse";

const dataset = [
  {
    geometry: { type: "Point", coordinates: [-88.0395948887, 30.6941961965] },
    attachments: [
      {
        url:
          "https://dev-api.mapseed.org/api/v2/smartercleanup/datasets/demo/places/826/attachments/236",
        created_datetime: "2017-01-11T18:38:32.335446Z",
        updated_datetime: "2017-01-11T18:38:32.346832Z",
        file:
          "https://mapseed-test-attachments.s3.amazonaws.com/attachments/Q81fjyM-blob",
        name: "my_image",
        visible: true,
        type: "CO",
        id: 236,
      },
    ],
    updated_datetime: "2017-01-11T18:38:31.913962+00:00",
    submission_sets: {},
    dataset: "https://dev-api.mapseed.org/api/v2/smartercleanup/datasets/demo",
    visible: true,
    submitter_name: "",
    total_acres: "33",
    total_footage: 17,
    user_token: "session:f6bd4e6ac9aasd3f57c65a6147dbe38e",
    id: 826,
    datasetId: "demo",
    description: "Some description...",
    title: "Grant awarded",
    url:
      "https://dev-api.mapseed.org/api/v2/smartercleanup/datasets/demo/places/826",
    tags: {
      url:
        "https://dev-api.mapseed.org/api/v2/smartercleanup/datasets/demo/places/826/tags",
      length: 0,
    },
    location_type: "observation",
    submitter: null,
    created_datetime: "2017-01-11T18:38:31.912413+00:00",
    id: 826,
  },
  {
    geometry: { type: "Point", coordinates: [-104.9977111816, 39.7547127508] },
    attachments: [],
    updated_datetime: "2016-11-22T23:00:00.929336+00:00",
    submission_sets: {},
    dataset: "https://dev-api.mapseed.org/api/v2/smartercleanup/datasets/demo",
    visible: true,
    submitter_name: "John",
    user_token: "session:21defd68b19133537444f937643b041c",
    id: 442,
    total_acres: "19",
    total_footage: 134,
    datasetId: "demo",
    description: "Wow!",
    title: "Another grant awarded",
    url:
      "https://dev-api.mapseed.org/api/v2/smartercleanup/datasets/demo/places/442",
    tags: {
      url:
        "https://dev-api.mapseed.org/api/v2/smartercleanup/datasets/demo/places/442/tags",
      length: 0,
    },
    location_type: "observation",
    submitter: null,
    created_datetime: "2016-11-10T21:21:11.316415+00:00",
    id: 442,
  },
  {
    geometry: { type: "Point", coordinates: [-102.9977111816, 39.7547127508] },
    attachments: [],
    updated_datetime: "2016-10-22T23:00:00.929336+00:00",
    submission_sets: {},
    dataset: "https://dev-api.mapseed.org/api/v2/smartercleanup/datasets/demo",
    visible: true,
    submitter_name: "Mary",
    id: 442,
    total_acres: 5,
    total_footage: 0,
    datasetId: "demo",
    description: "Nice!",
    title: "Great job",
    url:
      "https://dev-api.mapseed.org/api/v2/smartercleanup/datasets/demo/places/449",
    tags: {
      url:
        "https://dev-api.mapseed.org/api/v2/smartercleanup/datasets/demo/places/449/tags",
      length: 0,
    },
    location_type: "observation",
    submitter: null,
    created_datetime: "2016-10-10T21:21:11.316415+00:00",
    id: 449,
  },
  {
    geometry: { type: "Point", coordinates: [-89.0952801704, 30.368931909] },
    attachments: [
      {
        url:
          "https://dev-api.mapseed.org/api/v2/smartercleanup/datasets/demo/places/419/attachments/166",
        created_datetime: "2016-09-23T00:32:39.991501Z",
        updated_datetime: "2016-09-23T00:32:40.031140Z",
        file:
          "https://mapseed-test-attachments.s3.amazonaws.com/attachments/Pxa4YJz-blob",
        name: "my_image",
        visible: true,
        type: "CO",
        id: 166,
      },
    ],
    updated_datetime: "2016-09-23T00:32:39.571702+00:00",
    submission_sets: {},
    dataset: "https://dev-api.mapseed.org/api/v2/smartercleanup/datasets/demo",
    visible: true,
    submitter_name: "",
    user_token: "session:f214b21e9b21gd134204dd8bb6880139",
    id: 419,
    total_footage: "5",
    description: "What a post!",
    title: "ABC DEF",
    url:
      "https://dev-api.mapseed.org/api/v2/smartercleanup/datasets/demo/places/419",
    tags: {
      url:
        "https://dev-api.mapseed.org/api/v2/smartercleanup/datasets/demo/places/419/tags",
      length: 0,
    },
    location_type: "concern",
    submitter: null,
    created_datetime: "2016-09-23T00:32:39.570169+00:00",
    id: 419,
  },
];

describe("Expressions", () => {
  test("get-sum calculates correct value", () => {
    const exp = ["get-sum", "total_acres"];
    const parsedExp = makeParsedExpression(exp);
    const val = parsedExp.evaluate({ dataset });

    expect(val).toEqual(57);
  });

  test("get-mean calculates correct value", () => {
    const exp = ["get-mean", "total_acres"];
    const parsedExp = makeParsedExpression(exp);
    const stringVal = parsedExp.evaluate({ dataset }).toFixed(1);
    const val = Number(stringVal);

    expect(val).toEqual(14.3);
  });

  test("get-count returns correct value", () => {
    const exp = ["get-count"];
    const parsedExp = makeParsedExpression(exp);
    const val = parsedExp.evaluate({ dataset });

    expect(val).toEqual(4);
  });

  test("get-count returns correct value when filtered by the presence of a Place property", () => {
    const exp = ["get-count", "total_acres"];
    const parsedExp = makeParsedExpression(exp);
    const val = parsedExp.evaluate({ dataset });

    expect(val).toEqual(3);
  });

  test("get-max calculates correct value", () => {
    const exp = ["get-max", "total_acres"];
    const parsedExp = makeParsedExpression(exp);
    const val = parsedExp.evaluate({ dataset });

    expect(val).toEqual(33);
  });

  test("get-min calculates correct value", () => {
    const exp = ["get-min", "total_acres"];
    const parsedExp = makeParsedExpression(exp);
    const val = parsedExp.evaluate({ dataset });

    expect(val).toEqual(5);
  });

  test("+ calculates correct value from mixed inputs", () => {
    const exp = ["+", ["get-sum", "total_acres"], 10, ["literal", 5]];
    const parsedExp = makeParsedExpression(exp);
    const val = parsedExp.evaluate({ dataset });

    expect(val).toEqual(72);
  });

  test("* calculates correct value from mixed inputs", () => {
    const exp = ["*", ["get-sum", "total_acres"], 10, ["literal", 5]];
    const parsedExp = makeParsedExpression(exp);
    const val = parsedExp.evaluate({ dataset });

    expect(val).toEqual(2850);
  });

  test("get-val retrieves correct value", () => {
    const exp = ["get-val", "total_acres"];
    const parsedExp = makeParsedExpression(exp);
    const val = parsedExp.evaluate({ place: dataset[0] });

    expect(val).toEqual("33");
  });

  test("== expression with correct get-val lookup returns true", () => {
    const exp = ["==", ["get-val", "total_acres"], "33"];
    const parsedExp = makeParsedExpression(exp);
    const val = parsedExp.evaluate({ place: dataset[0] });

    expect(val).toEqual(true);
  });

  test("== expression with incorrect get-val lookup returns false", () => {
    const exp = ["==", ["get-val", "total_acres"], "12345"];
    const parsedExp = makeParsedExpression(exp);
    const val = parsedExp.evaluate({ place: dataset[0] });

    expect(val).toEqual(false);
  });

  test("!= expression with correct get-val lookup returns false", () => {
    const exp = ["!=", ["get-val", "total_acres"], "33"];
    const parsedExp = makeParsedExpression(exp);
    const val = parsedExp.evaluate({ place: dataset[0] });

    expect(val).toEqual(false);
  });

  test("!= expression with incorrect get-val lookup returns true", () => {
    const exp = ["!=", ["get-val", "total_acres"], "12345"];
    const parsedExp = makeParsedExpression(exp);
    const val = parsedExp.evaluate({ place: dataset[0] });

    expect(val).toEqual(true);
  });

  test("> expression returns correct result", () => {
    const exp = [">", ["get-val", "total_acres"], 12];
    const parsedExp = makeParsedExpression(exp);
    const val = parsedExp.evaluate({ place: dataset[0] });

    expect(val).toEqual(true);
  });

  test("< expression returns correct result", () => {
    const exp = ["<", ["get-val", "total_acres"], 100];
    const parsedExp = makeParsedExpression(exp);
    const val = parsedExp.evaluate({ place: dataset[0] });

    expect(val).toEqual(true);
  });

  test("case expression returns correct value for declared case condition", () => {
    const exp = [
      "case",
      ["==", ["get-sum", "total_acres"], 57],
      ["literal", "case 1"],
      ["literal", "fallback"],
    ];
    const parsedExp = makeParsedExpression(exp);
    const val = parsedExp.evaluate({ dataset });

    expect(val).toEqual("case 1");
  });

  test("case expression returns correct value for declared case condition", () => {
    const exp = [
      "case",
      ["==", ["get-sum", "total_acres"], 12345],
      ["literal", "case 1"],
      ["literal", "fallback"],
    ];
    const parsedExp = makeParsedExpression(exp);
    const val = parsedExp.evaluate({ dataset });

    expect(val).toEqual("fallback");
  });
});

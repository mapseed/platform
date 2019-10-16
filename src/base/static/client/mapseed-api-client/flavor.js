const TEMP = {
  id: 888,
  forms: [
    {
      id: 1,
      label: "bellevue-bike-share",
      is_enabled: true,
      dataset:
        "https://dev-api.mapseed.org/api/v2/smartercleanup/datasets/bellevue-bike-share",
      stages: [
        {
          id: 5,
          visible_layer_groups: [
            {
              label: "f4",
            },
            {
              label: "overlay",
            },
          ],
          map_viewport: {
            id: 5,
            zoom: 11.3,
            latitude: 47.58713,
            longitude: -122.15581,
            transition_duration: null,
            bearing: null,
            pitch: 30,
            stage: 12,
          },
          modules: [
            {
              id: 54,
              htmlmodule: {
                content:
                  "<h1>What is a hub?</h1><img src='/static/css/images/bike-share-hub.jpg' alt='Walkshed graphic' /><p><strong>Hubs</strong> are preferred parking areas for bikeshare bicycles. These are places where bikeshare users are encouraged to park when ending a trip and where Lime relocates bikes to provide convenient and reliable service.</p><p>Hubs are marked with white boxes and symbols painted on sidewalks or street shoulders, and they are shown in operators’ mobile apps.</p>",
                label: "hub_information",
              },
              order: 1,
              visible: true,
            },
          ],
          order: 1,
        },
        {
          id: 6,
          visible_layer_groups: [
            {
              label: "f4",
            },
            {
              label: "overlay",
            },
            {
              label: "bellevue-grid",
            },
          ],
          map_viewport: {
            id: 6,
            zoom: 11.3,
            latitude: 47.58713,
            longitude: -122.15581,
            transition_duration: null,
            bearing: null,
            pitch: 30,
            stage: 13,
          },
          modules: [
            {
              id: 55,
              htmlmodule: {
                content:
                  "<h1 style='font-family: PTSansBold, sans-serif; margin: 0 0 16px 0;'>Where should hubs go?</h1><img style='width:100%;' src='/static/css/images/gridlines-graphic.png' alt='Walkshed graphic' /><p class='form-stage-text'  style='font-family: PTSans, sans-serif;'>Anywhere you want to go by bike! We’re aiming to provide a network of conveniently located hubs citywide. Suggest locations in your neighborhood, outside your workplace, at your local park, near your favorite café, restaurants, and shops.</p><p class='form-stage-text' >If you don’t see a suggested location in the half-mile (solid) or quarter-mile (dashed) grid squares near places you want to use bikeshare, that is an especially good place to suggest one.</p>",
                label: "hub_location_information",
              },
              order: 1,
              visible: true,
            },
          ],
          order: 2,
        },
        {
          id: 7,
          visible_layer_groups: [
            {
              label: "f4",
            },
            {
              label: "overlay",
            },
            {
              label: "bellevue-grid",
            },
            {
              label: "bellevue-existing-hubs",
            },
          ],
          map_viewport: {
            id: 7,
            zoom: 14.9,
            latitude: 47.6145,
            longitude: -122.19668,
            transition_duration: 1500,
            bearing: null,
            pitch: 30,
            stage: 14,
          },
          modules: [
            {
              id: 56,
              htmlmodule: {
                content:
                  "<h1 style='font-family: PTSansBold, sans-serif; margin: 0 0 16px 0;'>Existing hubs</h1><img style='width:100%;' src='/static/css/images/existing-bikeshare-hubs-graphic.png' alt='Walkshed graphic' /><p class='form-stage-text'  style='font-family: PTSans, sans-serif;'>Hubs have already been installed at 50 locations across the city, including in Downtown, Crossroads, Factoria, and near major bus stops and community spaces.</p><p class='form-stage-text' >Toggle these with the Existing Hubs layer.</p>",
                label: "existing_hubs_information",
              },
              order: 1,
              visible: true,
            },
          ],
          order: 3,
        },
        {
          id: 8,
          visible_layer_groups: [
            {
              label: "f4",
            },
            {
              label: "overlay",
            },
            {
              label: "bellevue-grid",
            },
            {
              label: "bellevue-bike-network",
            },
          ],
          map_viewport: {
            id: 8,
            zoom: 11.3,
            latitude: 47.58713,
            longitude: -122.15581,
            transition_duration: 1500,
            bearing: null,
            pitch: 30,
            stage: 15,
          },
          modules: [
            {
              id: 57,
              htmlmodule: {
                content:
                  "<h1 style='font-family: PTSansBold, sans-serif; margin: 0 0 16px 0;'>Bicycle network</h1><img style='width:100%;' src='/static/css/images/bike-network-graphic.png' alt='Walkshed graphic' /><p class='form-stage-text'  style='font-family: PTSans, sans-serif;'>Not sure where to ride? Toggle the Bike Network layer to see where bike lanes and offstreet paths are near where you want to go.</p><div style='display:flex;'><figure style='flex:1;'><img src='/static/css/images/bike-sharrows.jpg' alt='Bike sharrows' /><figcaption style='font-style:italic;color:#888;'>Bike sharrows</figcaption></figure><figure style='flex:1;'><img src='/static/css/images/bike-lane.jpg' alt='Bike lane' /><figcaption style='font-style:italic;color:#888;'>Bike lane</figcaption></figure></div><div style='display:flex;'><figure style='flex:1;'><img src='/static/css/images/wide-shoulder.jpg' alt='Shoulder / wide lane' /><figcaption style='font-style:italic;color:#888;'>Shoulder / wide lane</figcaption></figure><figure style='flex:1;'><img src='/static/css/images/offstreet-path.png' alt='Offstreet path' /><figcaption style='font-style:italic;color:#888;'>Offstreet path</figcaption></figure></div>",
                label: "bicycle_network_information",
              },
              order: 1,
              visible: true,
            },
          ],
          order: 4,
        },
        {
          id: 9,
          visible_layer_groups: [
            {
              label: "f4",
            },
            {
              label: "overlay",
            },
            {
              label: "bellevue-grid",
            },
            {
              label: "bellevue-transit",
            },
          ],
          map_viewport: null,
          modules: [
            {
              id: 58,
              htmlmodule: {
                content:
                  "<h1 style='font-family: PTSansBold, sans-serif; margin: 0 0 16px 0;'>Access to transit</h1><img style='width:100%;' src='/static/css/images/walkshed-graphic.png' alt='Walkshed graphic' /><p class='form-stage-text'  style='font-family: PTSans, sans-serif;'>Bikeshare can help people get to and from transit more quickly. By locating hubs within walking distance of frequent bus routes, buses and bikeshare can both be more useful.</p><p class='form-stage-text' >This map shows the quarter-mile walkshed around Bellevue's frequent transit network.</p>",
                label: "access_to_transit_information",
              },
              order: 1,
              visible: true,
            },
          ],
          order: 5,
        },
        {
          id: 10,
          visible_layer_groups: [
            {
              label: "f4",
            },
            {
              label: "overlay",
            },
            {
              label: "bellevue-grid",
            },
            {
              label: "bellevue-existing-hubs",
            },
            {
              label: "bellevue-transit",
            },
            {
              label: "bellevue-bike-share",
            },
          ],
          map_viewport: null,
          modules: [
            {
              id: 60,
              htmlmodule: {
                content:
                  "<h1 style='font-family: PTSansBold, sans-serif; margin: 0 0 16px 0;'>What do <span style='font-style:italic;'>you</span> think?</h1><p class='form-stage-text'>Drag and zoom the map to let us know where you think we should add a bikeshare hub! Fill out the form below to give us some more information about your suggestion:</p>",
                label: "submission_info",
              },
              order: 2,
              visible: true,
            },
            {
              id: 62,
              textfield: {
                key: "title",
                prompt: "Add a descriptive title:",
                label: "Title:",
                private: false,
                required: false,
                placeholder: "Enter title...",
                variant: "",
              },
              order: 4,
              visible: true,
            },
            {
              id: 63,
              textfield: {
                key: "private-submitter_name",
                prompt: "Your name",
                label: "",
                private: true,
                required: false,
                placeholder: "Name",
                variant: "",
              },
              order: 5,
              visible: true,
            },
            {
              id: 64,
              filefield: {
                key: "my_image",
                label: "Have an image of this location? Add it!",
                private: false,
                required: false,
              },
              order: 6,
              visible: true,
            },
            {
              id: 366,
              textfield: {
                key: "private-submitter_email",
                prompt: "Your Email:",
                label: "",
                private: true,
                required: true,
                placeholder: "Your email will not appear on the map",
                variant: "EM",
              },
              order: 7,
              visible: true,
            },
            {
              id: 65,
              submitbuttonmodule: {
                label: "Suggest it!",
              },
              order: 8,
              visible: true,
            },
          ],
          order: 6,
        },
      ],
    },
  ],
};

const getFlavor = async (apiRoot, flavorSlug) => {
  //const response = await fetch(`${apiRoot}flavors/${flavorSlug}`, {
  //  credentials: "include",
  //});

  //if (response.status < 200 || response.status >= 300) {
  //  // eslint-disable-next-line no-console
  //  console.error("Error: Failed to fetch flavor:", response.statusText);

  //  return null;
  //}

  //return await response.json();

  return TEMP;
};

export default {
  get: getFlavor,
};

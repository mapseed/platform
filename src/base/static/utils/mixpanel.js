import mixpanel from "mixpanel-browser";
const env_check = process.env.NODE_ENV === "production";

// For testing:
// const env_check = true;

if (env_check && !MIXPANEL_TOKEN) {
  // eslint-disable-next-line no-console
  console.error("MIXPANEL_TOKEN is required for prod deployments.");
}
mixpanel.init(MIXPANEL_TOKEN);

const actions = {
  identify: id => {
    if (env_check) mixpanel.identify(id);
  },
  alias: id => {
    if (env_check) mixpanel.alias(id);
  },
  track: (name, props) => {
    if (env_check) mixpanel.track(name, props);
  },
  people: {
    set: props => {
      if (env_check) mixpanel.people.set(props);
    },
  },
};

export const Mixpanel = actions;

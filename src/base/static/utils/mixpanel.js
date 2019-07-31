import mixpanel from "mixpanel-browser";
const envCheck = process.env.NODE_ENV === "production";

// For testing:
// const env_check = true;

if (envCheck && !MIXPANEL_TOKEN) {
  // eslint-disable-next-line no-console
  console.error("MIXPANEL_TOKEN is required for prod deployments.");
}
mixpanel.init(MIXPANEL_TOKEN);

const actions = {
  identify: id => {
    if (envCheck) mixpanel.identify(id);
  },
  alias: id => {
    if (envCheck) mixpanel.alias(id);
  },
  track: (name, props) => {
    if (envCheck) mixpanel.track(name, props);
  },
  people: {
    set: props => {
      if (envCheck) mixpanel.people.set(props);
    },
  },
};

export const Mixpanel = actions;

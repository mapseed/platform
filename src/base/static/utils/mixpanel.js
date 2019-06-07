import mixpanel from "mixpanel-browser";
const env_check = process.env.NODE_ENV === "production" && MIXPANEL_TOKEN;

// For testing:
// const env_check = true;

if (env_check) {
  mixpanel.init(MIXPANEL_TOKEN);
}

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

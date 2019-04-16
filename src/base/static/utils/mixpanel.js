import mixpanel from "mixpanel-browser";
mixpanel.init(MIXPANEL_TOKEN);

const env_check = process.env.NODE_ENV === "production";
// For testing:
// const env_check = true;

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

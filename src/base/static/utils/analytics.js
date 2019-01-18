const recordGoogleAnalyticsHit = route => {
  console.log("would record", route)
  if (typeof ga !== "undefined") {
    ga("set", "page", route);
    ga("send", "pageview");
  }
};

export { recordGoogleAnalyticsHit };

/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 */

importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js",
);

workbox.skipWaiting();
workbox.clientsClaim();

workbox.core.setLogLevel(workbox.core.LOG_LEVELS.debug);

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.loadModule("workbox-strategies");
workbox.loadModule("workbox-routing");

self.addEventListener("install", event => {
  const cacheName = workbox.core.cacheNames.runtime;

  const apiRoot = new URL(location).searchParams.get("apiRoot");
  workbox.routing.registerRoute(
    new RegExp(apiRoot),
    workbox.strategies.networkFirst({
      plugins: [new workbox.cacheableResponse.Plugin({ statuses: [0, 200] })],
    }),
    "GET",
  );
});

// base.hbs routes:
// ideally, these should be pre-cached
workbox.routing.registerRoute(
  /^\/legacy-libs\//,
  workbox.strategies.networkFirst({
    plugins: [new workbox.cacheableResponse.Plugin({ statuses: [0, 200] })],
  }),
  "GET",
);

workbox.routing.registerRoute(
  /^https:\/\/cdnjs.cloudflare.com\/ajax\/libs\//,
  workbox.strategies.networkFirst({
    plugins: [new workbox.cacheableResponse.Plugin({ statuses: [0, 200] })],
  }),
  "GET",
);

workbox.routing.registerRoute(
  /^https:\/\/ajax.googleapis.com\/ajax\/libs\//,
  workbox.strategies.networkFirst({
    plugins: [new workbox.cacheableResponse.Plugin({ statuses: [0, 200] })],
  }),
  "GET",
);

workbox.routing.registerRoute(
  /^https:\/\/maxcdn.bootstrapcdn.com\/font-awesome\//,
  workbox.strategies.networkFirst({
    plugins: [new workbox.cacheableResponse.Plugin({ statuses: [0, 200] })],
  }),
  "GET",
);

// flavor-specific routes:
// TODO: dynamically register these routes based on their values in the config:
workbox.routing.registerRoute(
  /^https:\/\/dev-api.heyduwamish.org\/api\/v2\//,
  workbox.strategies.networkFirst({
    plugins: [new workbox.cacheableResponse.Plugin({ statuses: [0, 200] })],
  }),
  "GET",
);

workbox.routing.registerRoute(
  /^https:\/\/tile3.f4map.com\/tiles\/f4_2d\//,
  workbox.strategies.networkFirst({
    plugins: [new workbox.cacheableResponse.Plugin({ statuses: [0, 200] })],
  }),
  "GET",
);

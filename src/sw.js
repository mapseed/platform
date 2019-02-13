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

// background sync for POST requests:
// TODO: load page, examine the queue
// go offline on PC and server, POST some new places
// close the page, open a blank page, examine the queue
// with the page still closed, turn on the server, examine the queue
// if no sync event fired, turn PC online, examine the queue
// check server logs as well.
// double check the cookies!
const bgSyncPlugin = new workbox.backgroundSync.Plugin("mapseedBgQueue", {
  maxRetentionTime: 24 * 60, // Retry for max of 24 Hours
});

self.addEventListener("install", event => {
  const cacheName = workbox.core.cacheNames.runtime;

  const apiRoot = new URL(location).searchParams.get("apiRoot");
  // instead of making this a runtime cache, we can cache all the
  // local, prod, and dev api's explicitely
  workbox.routing.registerRoute(
    new RegExp(apiRoot),
    workbox.strategies.networkFirst({
      plugins: [new workbox.cacheableResponse.Plugin({ statuses: [0, 200] })],
    }),
    "GET",
  );

  workbox.routing.registerRoute(
    new RegExp(apiRoot),
    workbox.strategies.networkOnly({
      plugins: [bgSyncPlugin],
    }),
    "POST",
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
  /^http[s]?:\/\/cdnjs.cloudflare.com\/ajax\/libs\//,
  workbox.strategies.staleWhileRevalidate(),
  "GET",
);

workbox.routing.registerRoute(
  /^http[s]?:\/\/ajax.googleapis.com\/ajax\/libs\//,
  workbox.strategies.staleWhileRevalidate(),
  "GET",
);

workbox.routing.registerRoute(
  /^http[s]?:\/\/maxcdn.bootstrapcdn.com\/font-awesome\//,
  workbox.strategies.staleWhileRevalidate(),
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
  /^http[s]?:\/\/tile3.f4map.com\/tiles\/f4_2d\//,
  workbox.strategies.staleWhileRevalidate(),
  "GET",
);

workbox.routing.registerRoute(
  /^http[s]?:\/\/api.tiles.mapbox.com\/v4\/smartercleanup.pe3o4gdn\//,
  workbox.strategies.staleWhileRevalidate(),
  "GET",
);

workbox.routing.registerRoute(
  /^http[s]?:\/\/api.mapbox.com\/fonts\//,
  workbox.strategies.staleWhileRevalidate(),
  "GET",
);

workbox.routing.registerRoute(
  /^https:\/\/assets.mapseed.org\/geo\//,
  workbox.strategies.staleWhileRevalidate(),
  "GET",
);

workbox.routing.registerRoute(
  /^https:\/\/vector-tiles.mapseed.org\//,
  workbox.strategies.staleWhileRevalidate(),
  "GET",
);

/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 */

importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/4.0.0/workbox-sw.js",
);

// TODO: send an alert to the user when this data is about to expire
// Ideally, users can look up when their cache is about to expire
// by storing the date that they successfully performed a sync in the db.
const TILE_CACHE_EXPIRATION = 24 * 60 * 60 * 90; // 90 days
const TILE_CACHE_NAME = "tiles-cache";

workbox.core.skipWaiting();
workbox.core.clientsClaim();

// This sets the logs level to mimic production level logging
// Ideally, we should be able to filter out workbox logs in chrome by
// using group, but there is a bug in chrome that prevents this:
// https://bugs.chromium.org/p/chromium/issues/detail?id=363796
// https://github.com/GoogleChrome/workbox/issues/1920
workbox.setConfig({ debug: false });

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.loadModule("workbox-strategies");
workbox.loadModule("workbox-routing");

// background sync for POST requests:
const bgSyncPlugin = new workbox.backgroundSync.Plugin("mapseedBgQueue", {
  maxRetentionTime: 72 * 60, // Retry for max of 72 Hours
});

const flavor = new URL(location).searchParams.get("flavor");

// Set the cache names for our runtime cache and precache
workbox.core.setCacheNameDetails({
  prefix: flavor,
  suffix: "v1",
});

const apiRoot = new URL(location).searchParams.get("apiRoot");
// runtime cache for all calls to the local, prod, and dev api's explicitely:
workbox.routing.registerRoute(
  new RegExp(apiRoot),
  new workbox.strategies.NetworkFirst({
    plugins: [new workbox.cacheableResponse.Plugin({ statuses: [0, 200] })],
  }),
  "GET",
);

// We still need to respond to the request when the app is offline...
// ...and update the map legend when a request "fails", but is in the cache

self.addEventListener("fetch", event => {
  if (event.request.method !== "POST") {
    return;
  }
  const url = new URL(event.request.url, location);
  const placesRegExp = new RegExp(
    `${apiRoot}[a-zA-Z-]+/datasets/[a-zA-Z-]+/places$`,
  );
  if (placesRegExp.exec(url.href.split("?")[0])) {
    const networkOnly = new workbox.strategies.NetworkOnly({
      plugins: [bgSyncPlugin],
    });
    const getResponse = async () => {
      let response;
      try {
        response = await networkOnly.handle({ event });
      } catch (err) {
        // the offline request was successfully cached in indexDB
        // HACK: we are using the workbox error message here to detect
        // whether our bgsync plugin performed a FETCH_DID_FAIL
        // TODO: ideally, we'd query index db here...
        // https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
        // https://github.com/GoogleChrome/samples/blob/gh-pages/service-worker/offline-analytics/service-worker.js
        // TODO: query indexdb for cached responses when the app first
        // loads, allowing us to persist offline responses
        if (err.name === "no-response") {
          // Our api client will check for this type of body, and
          // hydrate a Place model from it:
          const blob = new Blob(
            [JSON.stringify({ isOfflineResponse: true }, null, 2)],
            { type: "application/json" },
          );
          return new Response(blob);
        } else {
          throw err;
        }
      }
      return response;
    };
    event.respondWith(getResponse());
  }
});

self.addEventListener("install", function(event) {
  event.waitUntil(async () => {
    // Create our tiles-cache:
    caches.open(TILE_CACHE_NAME);
  });
});

// ideally, these should be in our pre-cached bundles:
const origin = location.origin;
workbox.routing.registerRoute(
  new RegExp(`${origin}/legacy-libs/`),
  new workbox.strategies.NetworkFirst({
    plugins: [new workbox.cacheableResponse.Plugin({ statuses: [0, 200] })],
  }),
  "GET",
);

workbox.routing.registerRoute(
  new RegExp(`${origin}/static/`),
  new workbox.strategies.NetworkFirst({
    plugins: [new workbox.cacheableResponse.Plugin({ statuses: [0, 200] })],
  }),
  "GET",
);

workbox.routing.registerRoute(
  /^http[s]?:\/\/cdnjs.cloudflare.com\/ajax\/libs\//,
  new workbox.strategies.StaleWhileRevalidate(),
  "GET",
);

workbox.routing.registerRoute(
  /^http[s]?:\/\/ajax.googleapis.com\/ajax\/libs\//,
  new workbox.strategies.StaleWhileRevalidate(),
  "GET",
);

workbox.routing.registerRoute(
  /^http[s]?:\/\/maxcdn.bootstrapcdn.com\/font-awesome\//,
  new workbox.strategies.StaleWhileRevalidate(),
  "GET",
);

workbox.routing.registerRoute(
  /^http[s]?:\/\/tile3.f4map.com\/tiles\/f4_2d\//,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: TILE_CACHE_NAME,
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: TILE_CACHE_EXPIRATION,
      }),
    ],
  }),
  "GET",
);

workbox.routing.registerRoute(
  /^http[s]?:\/\/api.tiles.mapbox.com\/v4\/smartercleanup.pe3o4gdn\//,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: TILE_CACHE_NAME,
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: TILE_CACHE_EXPIRATION,
      }),
    ],
  }),
  "GET",
);

workbox.routing.registerRoute(
  /^http[s]?:\/\/api.mapbox.com\/fonts\//,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: TILE_CACHE_NAME,
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: TILE_CACHE_EXPIRATION,
      }),
    ],
  }),
  "GET",
);

workbox.routing.registerRoute(
  /^https:\/\/assets.mapseed.org\/geo\//,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: TILE_CACHE_NAME,
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: TILE_CACHE_EXPIRATION,
      }),
    ],
  }),
  "GET",
);

workbox.routing.registerRoute(
  /^https:\/\/vector-tiles.mapseed.org\//,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: TILE_CACHE_NAME,
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: TILE_CACHE_EXPIRATION,
      }),
    ],
  }),
  "GET",
);

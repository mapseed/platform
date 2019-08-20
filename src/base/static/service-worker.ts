declare const NODE_ENV: string;
declare const PUBLIC_URL: string;

export function register() {
  if (NODE_ENV === "production" && "serviceWorker" in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374

      // eslint-disable-next-line no-console
      console.warn(
        `SW: registration aborted because origin ${window.location.origin} doesn't match publicUrl: ${publicUrl.origin}`,
      );
      return;
    }

    const swUrl = `${PUBLIC_URL}/service-worker.js`;
    window.addEventListener("load", function() {
      const apiRoot = encodeURIComponent("{{config.app.api_root}}");
      const flavor = encodeURIComponent("{{flavor}}");
      navigator.serviceWorker
        .register(`${swUrl}?apiRoot=${apiRoot}&flavor=${flavor}`)
        .then(function(registration) {
          // eslint-disable-next-line no-console
          console.log("SW registered: ", registration);
        })
        .catch(function(registrationError) {
          // eslint-disable-next-line no-console
          console.log("SW registration failed: ", registrationError);
        });
    });
  }
}

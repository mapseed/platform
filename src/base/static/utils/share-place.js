const SHARE_URL = "http://social.mapseed.org";

const buildSharingQuerystring = components => {
  return [
    "?url=",
    encodeURIComponent(components.redirectUrl),
    "&title=",
    encodeURIComponent(components.title),
    "&img=",
    encodeURIComponent(components.img),
    "&desc=",
    encodeURIComponent(components.desc),
    "&height=",
    encodeURIComponent(components.height),
    "&width=",
    encodeURIComponent(components.width),
  ].join("");
};

const getSocialUrl = ({
  place,
  appTitle,
  appThumbnail,
  appMetaDescription,
}) => {
  const components = {
    title: place.title || place.name || appTitle,
    desc: place.description || appMetaDescription,
    img:
      place.attachments.length > 0
        ? place.attachments[0].file
        : [
            window.location.protocol,
            "//",
            window.location.host,
            appThumbnail,
          ].join(""),
    redirectUrl: [
      window.location.protocol,
      "//",
      window.location.host,
      "/",
      place.datasetSlug + "/" + place.id,
    ].join(""),
  };
  const $img = $("img[src='" + components.img + "']");

  components["height"] = $img.height() || 630;
  components["width"] = $img.width() || 1200;

  // TODO: If the image was just created and only has a data url,
  // fetch the attachment to obtain the S3 url before contacting the
  // sharing microservice.
  const queryString = buildSharingQuerystring(components);
  return encodeURIComponent(`${SHARE_URL}${queryString}`);
};

export default ({
  place,
  service,
  appTitle,
  appMetaDescription,
  appThumbnail,
}) => {
  const shareUrl = getSocialUrl({
    place,
    appTitle,
    appMetaDescription,
    appThumbnail,
  });
  let url =
    service === "facebook"
      ? `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`
      : `https://twitter.com/intent/tweet?url=${shareUrl}`;
  window.open(url, "_blank").focus();
};

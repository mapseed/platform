import constants from "../constants";

// Replace rich text image markup with <img /> tags.
const insertEmbeddedImages = (html, attachments) => {
  const images = attachments
    .filter(attachment => attachment.type === "RT")
    .reduce((images, attachment) => {
      images[attachment.name] = attachment.file;
      return images;
    }, {});
  const regex = new RegExp(
    constants.RICH_TEXT_IMAGE_MARKUP_PREFIX +
      "(.*?)" +
      constants.RICH_TEXT_IMAGE_MARKUP_SUFFIX,
    "g",
  );

  return (
    html &&
    html.replace(regex, (match, imgName) => {
      return `<img src='${images[imgName]}' />`;
    })
  );
};

// Replace img tags in a string representation of HTML with their rich text
// markup equivalents. We temporarily convert the HTML string to DOM nodes to
// make processing easier.
// For example:
//      "<img src='data:image/jpeg;base64,df34HSnvUD25' name='d34gs3'>"
// becomes:
//      "{{#rich-text-image d34gs3}}"
const extractEmbeddedImages = html => {
  const node = document.createElement("div");
  node.innerHTML = html;
  const imgs = node.getElementsByTagName("img");
  Array.from(imgs).forEach(img => {
    if (img.src.startsWith("data:image")) {
      img.outerHTML = `${constants.RICH_TEXT_IMAGE_MARKUP_PREFIX}${img.name}${constants.RICH_TEXT_IMAGE_MARKUP_SUFFIX}`;
    }
  });

  return node.outerHTML;
};

export { insertEmbeddedImages, extractEmbeddedImages };

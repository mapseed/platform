require("dotenv").config({ path: "src/.env" });
import glob from "glob";
import path from "path";
import AWS from "aws-sdk";

if (!process.env.DEPLOY_DOMAIN) {
  throw "Set the DEPLOY_DOMAIN environment variable to the S3 bucket you want to deploy Mapseed to.";
}
if (!process.env.SSL_CERT_ARN) {
  throw "Set the SSL_CERT_ARN environment variable to the ARN of the AWS ACM SSL certificate associated with this flavor.";
}

// Files matching this pattern will be uploaded with their ContentEncoding
// metadata set to `gzip`. This prevents a bug where gzipped files can be
// deployed momentarily without a proper ContentEncoding header.
// See: https://github.com/jalMogo/mgmt/issues/266
const gzippedFiles = glob
  .sync("{./www/*.html,./www/config*.js,./www/**/spritesheet.js,./www/**/*.gz}")
  .map(file => path.relative("./www", file));

// eslint-disable-next-line no-console
console.log(`Updating website: ${process.env.DEPLOY_DOMAIN}`);
const config = {
  domain: process.env.DEPLOY_DOMAIN,
  region: process.env.DEPLOY_REGION || "us-west-2",
  uploadDir: "www",
  index: "index.html",
  enableCloudfront: true,
  certId: process.env.SSL_CERT_ARN,
  gzippedFiles: gzippedFiles,
};

const s3 = new AWS.S3({ region: config.region });
const cloudfront = new AWS.CloudFront();

const create = require("s3-website").s3site;
const deploy = require("s3-website").deploy;

function promisify(func, thisContext) {
  if (thisContext) {
    func = func.bind(thisContext);
  }
  return (...args) => {
    return new Promise((resolve, reject) => {
      func(...args, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };
}
const createPromise = promisify(create);
const deployPromise = promisify(deploy);
const getDistributionConfigPromise = promisify(
  cloudfront.getDistributionConfig,
  cloudfront,
);
const updateDistributionPromise = promisify(
  cloudfront.updateDistribution,
  cloudfront,
);
const copyObjectPromise = promisify(s3.copyObject, s3);

function getContentType(filepath) {
  if (filepath.match(/\.js(\.gz)?$/)) {
    return "text/javascript";
  } else if (filepath.match(/\.css(\.gz)?$/)) {
    return "text/css";
  } else if (filepath.endsWith(".html")) {
    return "text/html";
  } else {
    return "application/octet-stream";
  }

  // TODO: other types as needed
}

function buildParams(filepath, params) {
  return Object.assign(
    {
      CopySource: encodeURIComponent(
        process.env.DEPLOY_DOMAIN + "/" + filepath,
      ),
      Bucket: process.env.DEPLOY_DOMAIN,
      Key: filepath,
      MetadataDirective: "REPLACE",
      ContentType: getContentType(filepath),
    },
    params,
  );
}

function updateMetadata() {
  // eslint-disable-next-line no-console
  console.log("Updating metadata");
  let params;

  // NOTE: We need to update the Cache-Control header for the index.html object,
  // as well as any localized index objects (such as es.html, for example),
  // so CloudFront won't cache these objects and they can fetch updated hashed
  // CSS and JS bundles consistently. We also need to update localized config
  // files, since these are no longer embedded in the index files directly.
  let updatePromises = glob
    .sync("{./www/*.html,./www/config*.js}")
    .map(filepath => {
      filepath = path.relative("./www", filepath);
      params = {
        CacheControl: "no-cache, must-revalidate, max-age=0",
        // Note that even though we set the ContentEncoding metadata in the
        // initial file copy to S3, we have to duplicate it here because
        // there is not metadata "amend" operation in S3.
        ContentEncoding: "gzip",
      };
      return copyObjectPromise(buildParams(filepath, params));
    })
    .concat(
      glob.sync("./www/service-worker.js").map(filepath => {
        const relativePath = path.relative("./www", filepath);
        // NOTE: cache headers may not be needed anymore:
        // https://developers.google.com/web/updates/2018/06/fresher-sw
        params = {
          CacheControl: "max-age=0",
        };
        return copyObjectPromise(buildParams(relativePath, params));
      }),
    )
    .concat(
      glob.sync("./www/**/*.gz").map(filepath => {
        // Ensure gzipped files have "Content-Encoding" set
        filepath = path.relative("./www", filepath);
        params = {
          ContentEncoding: "gzip",
          CacheControl: "max-age=31536000", // One year
        };
        return copyObjectPromise(buildParams(filepath, params));
      }),
    )
    .concat(
      glob
        .sync("./www/static/css/images/markers/spritesheet*")
        .map(filepath => {
          // Don't cache spritesheet assets, as they are often updated but the
          // filename never changes.
          filepath = path.relative("./www", filepath);
          params = {
            CacheControl: "no-cache, must-revalidate, max-age=0",
          };
          return copyObjectPromise(buildParams(filepath, params));
        }),
    );

  return Promise.all(updatePromises);
}

createPromise(config)
  .then(website => {
    // eslint-disable-next-line no-console
    console.log("Getting cloudfront config");
    let distConfig = getDistributionConfigPromise({
      Id: website.cloudfront.Distribution.Id,
    });
    return Promise.all([Promise.resolve(website), distConfig]);
  })
  .then(([website, response]) => {
    // eslint-disable-next-line no-console
    console.log("Updating cloudfront config");
    let config = response.DistributionConfig;
    config.CustomErrorResponses = {
      Quantity: 1,
      Items: [
        {
          ErrorCode: 404,
          ErrorCachingMinTTL: 300,
          ResponseCode: "200",
          ResponsePagePath: "/index.html",
        },
      ],
    };
    return updateDistributionPromise({
      Id: website.cloudfront.Distribution.Id,
      IfMatch: response.ETag,
      DistributionConfig: config,
    });
  })
  .then(() => deployPromise(s3, config))
  .catch(err => {
    if (err.name === "CNAMEAlreadyExists") {
      // It's already been deployed
      // eslint-disable-next-line no-console
      console.log("Redeploying existing site");
      return deployPromise(s3, config);
    } else {
      throw err;
    }
  })
  .then(() => updateMetadata())
  // eslint-disable-next-line no-console
  .then(() => console.log("Website created and deployed!"))
  // eslint-disable-next-line no-console
  .catch(e => console.log(e));

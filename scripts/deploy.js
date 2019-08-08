/* eslint-disable @typescript-eslint/no-var-requires */
require("dotenv").config({ path: "src/.env" });
const glob = require("glob");
const path = require("path");
const AWS = require("aws-sdk");

if (!process.env.DEPLOY_DOMAIN) {
  throw "Set the DEPLOY_DOMAIN environment variable to the S3 bucket you want to deploy Mapseed to.";
}
if (!process.env.SSL_CERT_ARN) {
  throw "Set the SSL_CERT_ARN environment variable to the ARN of the AWS ACM SSL certificate associated with this flavor.";
}

// eslint-disable-next-line no-console
console.log(`Updating website: ${process.env.DEPLOY_DOMAIN}`);
const config = {
  domain: process.env.DEPLOY_DOMAIN,
  region: process.env.DEPLOY_REGION || "us-west-2",
  uploadDir: "www",
  index: "index.html",
  enableCloudfront: true,
  certId: process.env.SSL_CERT_ARN,
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

  let updatePromises = glob
    .sync(
      "{./www/*.bundle.js,./www/*.bundle.css,./www/**/*.{jpg,jpeg,png},./www/legacy-libs/*.js}",
    )
    .map(filepath => {
      filepath = path.relative("./www", filepath);
      params = {
        CacheControl: "max-age=31536000", // One year
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
      glob
        // Assets that should not be cached, because asset names never change
        // but the file contents do.
        .sync(
          "{./www/static/css/images/markers/spritesheet*,./www/index.html,./www/config.js}",
        )
        .map(filepath => {
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

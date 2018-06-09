require("dotenv").config({ path: "src/.env" });
const glob = require("glob");
const path = require("path");

if (!process.env.DEPLOY_DOMAIN) {
  throw "Set the DEPLOY_DOMAIN environment variable to the domain you want to deploy Mapseed to.";
}
const config = {
  domain: process.env.DEPLOY_DOMAIN,
  region: process.env.DEPLOY_REGION || "us-west-2",
  uploadDir: "www",
  index: "index.html",
  enableCloudfront: true,
};

const AWS = require("aws-sdk");
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
  // CSS and JS bundles consistently.
  let updatePromises = glob
    .sync("./www/*.html")
    .map(filepath => {
      filepath = path.relative("./www", filepath);
      params = {
        CacheControl: "no-cache, must-revalidate, max-age=0",
      };
      return copyObjectPromise(buildParams(filepath, params));
    })
    .concat(
      glob.sync("./www/**/*.gz").map(filepath => {
        // Ensure gzipped files have "Content-Encoding" set
        filepath = path.relative("./www", filepath);
        params = {
          ContentEncoding: "gzip",
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

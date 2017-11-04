require('dotenv').config({path: 'src/.env'});
const fs = require('fs-extra');
const glob = require('glob');

if (!process.env.DEPLOY_DOMAIN) {
  throw 'Set the DEPLOY_DOMAIN environment variable to the domain you want to deploy Mapseed to.';
}
const config = {
  domain: process.env.DEPLOY_DOMAIN,
  region: process.env.DEPLOY_REGION || 'us-west-2',
  uploadDir: 'www',
  index: 'index.html',
  enableCloudfront: true
};

const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: config.region });
const cloudfront = new AWS.CloudFront();

const create = require('s3-website').s3site;
const deploy = require('s3-website').deploy;

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
    })
  };
}
const createPromise = promisify(create);
const deployPromise = promisify(deploy);
const getDistributionConfigPromise = promisify(cloudfront.getDistributionConfig, cloudfront);
const updateDistributionPromise = promisify(cloudfront.updateDistribution, cloudfront);
const copyObjectPromise = promisify(s3.copyObject, s3);

function updateCacheControl() {
  console.log('Updating cache settings');
  // NOTE: We need to update the Cache-Control header for the index.html object,
  // as well as any localized index objects (such as es.html, for example),
  // so CloudFront won't cache these objects and they can fetch updated hashed
  // CSS and JS bundles consistently.
  let updatePromises = glob.sync("./www/*.html").map((path) => {
    splitPath = path.split("/");
    let indexFile = splitPath[splitPath.length - 1];
    let params = {
      CopySource: encodeURIComponent(process.env.DEPLOY_DOMAIN + '/' + indexFile),
      Bucket: process.env.DEPLOY_DOMAIN,
      Key: indexFile,
      CacheControl: "no-cache",
      ContentType: "text/html",
      MetadataDirective: 'REPLACE'
    };
    return copyObjectPromise(params);
  });

  return Promise.all(updatePromises);
}

createPromise(config)
  .then((website) => {
    console.log('Getting cloudfront config');
    let distConfig = getDistributionConfigPromise({Id: website.cloudfront.Distribution.Id});
    return Promise.all([Promise.resolve(website), distConfig]);
  })
  .then(([website, response]) => {
    console.log('Updating cloudfront config');
    let config = response.DistributionConfig;
    config.CustomErrorResponses = {
      Quantity: 1,
      Items: [
        {
          ErrorCode: 404,
          ErrorCachingMinTTL: 300,
          ResponseCode: '200',
          ResponsePagePath: '/index.html'
        }
      ]
    };
    return updateDistributionPromise({
      Id: website.cloudfront.Distribution.Id,
      IfMatch: response.ETag,
      DistributionConfig: config
    });
  })
  .then(() => deployPromise(s3, config))
  .catch(err => {
    if (err.name === 'CNAMEAlreadyExists') {
      // It's already been deployed
      console.log('Redeploying existing site');
      return deployPromise(s3, config);
    } else {
      throw err;
    }
  })
  .then(() => updateCacheControl())
  .then(() => console.log('Website created and deployed!'))
  .catch(e => console.log(e));

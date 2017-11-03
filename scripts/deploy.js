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
  error: 'index.html', // Setting as the error document allows client-side routing
  enableCloudfront: true
};

const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: config.region });

const create = require('s3-website').s3site;
const deploy = require('s3-website').deploy;

const updateCacheControl = () => {

  // NOTE: We need to update the Cache-Control header for the index.html object,
  // as well as any localized index objects (such as es.html, for example),
  // so CloudFront won't cache these objects and they can fetch updated hashed
  // CSS and JS bundles consistently.
  glob.sync("./www/*.html").forEach((path) => {
    splitPath = path.split("/");
    let indexFile = splitPath[splitPath.length - 1];
    let params = {
      Body: fs.readFileSync("./www/" + indexFile),
      Bucket: process.env.DEPLOY_DOMAIN,
      Key: indexFile,
      CacheControl: "no-cache, must-revalidate, max-age=0",
      ContentType: "text/html"
    };
    s3.putObject(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      }
    });
  });
}

create(config, (err, website) => {
  if (err && err.name === 'CNAMEAlreadyExists') {
    // It's already been deployed
    deploy(s3, config, (err, website) => {
      if (err) {
        throw err;
      } else {
        updateCacheControl();
        console.log('Website deployed!');
      }
    });
    return;
  } else if (err) {
    throw err;
  } else {
    updateCacheControl();
    console.log('Website created and deployed!');
  }
});

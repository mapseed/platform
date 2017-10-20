require('dotenv').config({path: 'src/.env'});
if (!process.env.DEPLOY_DOMAIN) {
  throw 'Set the DEPLOY_DOMAIN environment variable to the domain you want to deploy Mapseed to.';
}
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw 'Set the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables to your AWS credentials.';
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

create(config, (err, website) => {
  if (err && err.name === 'CNAMEAlreadyExists') {
    // It's already been deployed
    deploy(s3, config, (err, website) => {
      if (err) {
        throw err;
      } else {
        console.log('Website deployed!');
      }
    });
    return;
  } else if (err) {
    throw err;
  } else {
    console.log('Website created and deployed!');
  }
});

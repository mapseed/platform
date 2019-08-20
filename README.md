# Mapseed _(platform)_

[![Build Status](https://travis-ci.org/mapseed/platform.svg?branch=master)](http://travis-ci.org/mapseed/platform)

> A simple, beautiful way to collect information and tell geographic stories.

Mapseed is a platform that allows anyone to create community-driven maps on the web. These maps allow users to report issues or submit ideas and respond to the issues & ideas of others. Combine user-generated content with external data overlaid on the same map to allow anyone to see what's going on in the area at a glance.

This module, `platform`, is the tool for creating the maps themselves, while the [`api` module](https://github.com/mapseed/api) collects the user reports on the backend.

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
  - [Connecting to an API](#connecting-to-an-api)
  - [Configuring](#configuring)
  - [Starting your map server](#starting-your-map-server)
  - [Localizing your map](#localizing-your-map)  
  - [Using the in-app editor](#using-the-in-app-editor)
- [Maintainers](#maintainers)
- [Contribute](#contribute)
  - [Use the Dev API](#use-the-dev-api)
- [License](#license)

## Background

Mapseed was originally developed to empower community members to stay informed and track the cleanup of toxic waste along Seattle's Duwamish River. [HeyDuwamish.org](http://heyduwamish.org) runs on Mapseed. It's now used for several other [community maps](http://mapseed.org/#portfoliowrap)

The Mapseed platform is a fork of [Shareabouts](https://github.com/openplans/shareabouts), which was developed by [OpenPlans](http://openplans.org/) before they closed in 2015. It is a "spiritual successor" to [Qué Pasa Riachuelo?](https://github.com/garagelab/qpr2).

## Install

Mapseed requires [Node LTS](https://nodejs.org/en/download/package-manager/). We recommend managing node/npm versions using [nvm](https://github.com/creationix/nvm) or [asdf](https://github.com/asdf-vm/asdf).

To install npm dependencies:

```
# In project folder
npm install
```

## Usage

**If you want to create a map for your community, don't hesitate to get in touch. We can help you with the setup process!**

### Connecting to an API

In order to collect and store user reports, the map must be configured to connect to a [Mapseed API](https://github.com/mapseed/api) backend. By default, map flavors are configured to connect to a hosted development API for testing purposes.

### Configuring

To customize your map with everything from the input form you want users to complete to the extra data you want to display, you'll edit your flavor's `config.yml` file. For more information on the configuration process and what options are available, see [the config documentation](https://github.com/mapseed/platform/blob/master/doc/CONFIG.md).

### Running your map in a browser

If you want to see your map in action, simply run:

```
FLAVOR=<flavor> npm start
```

where `<flavor>` should be replaced with the name of a map flavor. If you're building your own flavor you can use that name, otherwise you can try a pre-made flavor, such as `duwamish_flavor`.

By default, this will serve your map at [http://localhost:8000](http://localhost:8000), but will *not* perform localization (should your map have multiple languages). To build a production bundle with localizations suitable for deployment, run:

```
FLAVOR=<flavor> npm run build
```

Alternatively, to build a production bundle and also start the development server at [http://localhost:8000](http://localhost:8000), run:

```
NODE_ENV=production FLAVOR=<flavor> npm start
```

By default, this will output all production files to a folder called `www` in the root of the project. This folder will contain all the assets required to deliver your map to users. Furthermore, the assets output to `www` will be entirely static, meaning they won't require a server to host, and can be made available via a static site hosting service such as AWS's S3.

### Deployment

To deploy to a website, run the following script:

```
npm run build-deploy
```

The appropriate env vars for `FLAVOR`, `MAPBOX_TOKEN` , `MAPQUEST_KEY`, `MAP_PROVIDER_TOKEN`, `API_ROOT`, `<flavor>_SITE_URL`, `<flavor>_GOOGLE_ANALYTICS_ID`, and `DEPLOY_DOMAIN` must be set in the `/src/.env` file.

NOTE: If you are getting this error:

>Error: getaddrinfo ENOTFOUND cloudfront.amazonaws.com cloudfront.amazonaws.com:443

then you may need to turn off your VPN.

NOTE: If the new bundle is not being served, then you may need to run a cache invalidation on your CDN.


### Using the Dev API

By default, map flavors that you run locally will coneect to a hosted development API. However, if you want to host your own [Mapseed API backend](https://github.com/mapseed/api), either for testing or production purposes, it will be necessary to build your map flavors against a `.env` file with the necessary configuration information.

To do so, create a file at `src/.env` (note the `.` character in the filename), and add information in the following format:

```
API_ROOT=http://localhost:8001/api/v2/ # note trailing slash

TREES_SITE_URL=http://localhost:8001/api/v2/username/datasets/trees
RESTORATION_SITE_URL=http://localhost:8001/api/v2/username/datasets/restoration
```

The value of `API_ROOT` should match the server on which your map datasets are running, and should contain a trailing `/` character. If you're hosting your API on a server called `api.mymap.com`, for example, the value of `API_ROOT` would be:

```
API_ROOT=http://api.mymap.com/api/v2/ # note trailing slash
```

For each dataset that your map connects to, you'll need a line that tells the map where to find this dataset. Dataset key names should take the format `<DATASET>_SITE_URL`, where `<DATASET>` is the UPPERCASE name of the dataset referenced in the `config.yml` file for your flavor.

Note that you can also set the `FLAVOR` variable in your `.env` file:

```
FLAVOR=duwamish_flavor
```

Doing so will remove the need to pass this value in when your run `npm start` or `npm run build`.

### Localizing your map

It is possible to render the text of your map flavor in multiple languages. Mapseed uses the [Gettext](https://www.gnu.org/software/gettext/) system to localize content. Gettext works by  producing a catalog of all the strings in your map flavor. Such catalogs usually have the file extension `.po`, and are designed to be distributed to translators. Translators translate content in the `.po` file and return the finished file when they're done. The translated `.po` file is saved in a designated place in your project's folder structure, and is used during the build process to produce localized versions of your map.

You'll generally encounter two scenarios when localizing your map: then need to produce a `.po` file for a brand new language which you've never translated before, and the need to update the `.po` files for all existing languages with new content.

To generate a `.po` file for a brand new language for a given flavor, run the following in the root of the project:

```
FLAVOR=<flavor> node scripts/make-flavor-messages.js --set-new-locale=<language_tag>
```

where `<flavor>` is the name of the flavor you'd like to localize, and `<language_tag>` is the standard language and country code for the target language. (See [here](https://www.w3.org/International/articles/language-tags/) for more information about language tags.)

To update all existing locales with new content for a given flavor, run the following in the root of the project:

```
FLAVOR=<flavor> node scripts/make-flavor-messages.js
```

where `<flavor>` is the name of the flavor whose locales you'd like to update:

`.po` files for a given flavor locale can be found in the `src/flavors/<flavor>/locale/<language_tag>/LC_MESSAGES/messages.po` file, where `<flavor>` is the name of the flavor and `<language_tag>` is the name of the language tag. Using the `make-flavor-messages.js` tool will create a new folder in the `locale` matching the new language. Translated `.po` files should be returned to the correct language folder in the `locale` directory to work correctly.

You may also wish to do the same for the base project itself:
```
node scripts/make-base-messages.js --set-new-locale=<language_tag>
```
For a new language locale
```
node scripts/make-base-messages.js
```
To update an existing locale

#### Marking content as localizable

Gettext will look for localizable content in two places: your flavor's `config.yml` file, and  any `jstemplates` files defined by your flavor. When Gettext produces a `.po` file, it will ignore content unless that content is explicitly marked as localizable.

To mark content in your `config.yml` file as localizable, wrap it in the following way:

```
_(This string will be localized.)

This string will not.
```

To mark content in your `jstemplates` files as localizable, wrap it in the following way:

```
{{#_}}<p>This string will be localized.</p>{{/_}}

<p>This string will not.</p>
```


### Using the in-app editor

Mapseed includes an in-app editor that you can use to update and hide places and comments on a per-dataset basis. Only authenticated administrators are allowed to make edits. Authentication is performed via third-party social media services (Twitter, Facebook, and Google+ are currently supported), so administrators will need an account on one of these services to use the editor.

Follow these instructions to grant administrator privileges to one or more users:

1. If the user to whom you'd like to grant administrator privileges has previously logged into your app via a social media service, skip to the next step. Otherwise, you'll need to manually add the user before granting privileges. Follow these steps:

    * In the admin panel, click `Users`, then `Add user +`, then create a new User. The username you enter here is arbitrary, although for convenience it may match the social media username of the person to whom you'd like to grant administrator privileges. Note that you may add several user social auths under a single User.

    * Next, in the `User social auths` panel, click `Add user social auth +`, select the User you just created under `User` (or choose an existing User), enter the name of the social service provider (`twitter`, `facebook`, or `google-oauth2`), then enter the social user's `Uid`. The `Uid` can be looked up online: [here](https://tweeterid.com/) for Twitter, and [here](https://lookup-id.com/) for Facebook. For Google, the `Uid` is the user's email address.

2. In the Django admin panel, click on `Data sets` and then the name of the dataset you'd like to grant administrator privileges for.

3. Under the `Groups` section, create a new group called `administrators` if it doesn't already exist. Note that this group must be called `administrators`.

4. Add users to whom you'd like to grant privileges by selecting the user in the `Available submitters` panel and clicking the right arrow to move them to the `Chosen submitters` panel. 

5. Click `Edit permissions` below the submitters panels, and grant `retrieve`, `create`, `update`, and `destroy` privileges. Also make sure that a `*` character is entered in the text box at left. The help text in the admin panel suggests that this box can be left blank, but this is in fact not true.

6. Click `Save`.

7. Now when any of the `Chosen submitters` are logged into your app via a social media service, an edit button will appear on place detail views that belong to datasets where they have administrator privileges. Administrators can edit the title and content of places, edit and delete individual comments, and hide entire places.


## Maintainers

- [futuresoup](https://github.com/futuresoup)
- [modulitos](https://github.com/modulitos)
- [goldpbear](https://github.com/goldpbear)

## Contribute

Questions and issues should be filed [right here on GitHub](https://github.com/mapseed/platform/issues).

If you'd like to contribute code, we'd love to have it! Fork and submit a PR (base your branch off `master`). No change is too small!

Credits
-------------
Many features are powered by Shareabouts, an open-source project of [OpenPlans](http://openplans.org).


## License

[GNU GPL](https://github.com/mapseed/platform/blob/master/LICENSE.txt)

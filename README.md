# Mapseed _(platform)_

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
  - [Using the in-app editor](#using-the-in-app-editor)
- [Maintainers](#maintainers)
- [Contribute](#contribute)
  - [Use the Dev API](#use-the-dev-api)
- [License](#license)

## Background

Mapseed was originally developed for tracking the environmental cleanup of the Duwamish River. [HeyDuwamish.org](http://heyduwamish.org) runs on Mapseed. It's now used for several other websites, including [HeyWillamette.org](http://heywillamette.org). You can find out more at [SmarterCleanup.org](http://smartercleanup.org).

The Mapseed platform is a fork of [Shareabouts](https://github.com/openplans/shareabouts), which was developed by [OpenPlans](http://openplans.org/) before they closed in 2015. It is a "spiritual successor" to [Qué Pasa Riachuelo?](https://github.com/garagelab/qpr2).

## Install

Hey Duwamish! requires Python 2.7 ([Instructions for Windows](/doc/WINDOWS_SETUP.md)) and [Node + and the latest npm](https://nodejs.org/en/download/package-manager/). We recommend managing node/npm versions using [nvm](https://github.com/creationix/nvm).

Install `pip` and `virtualenv`, if not already installed. These will keep your python code isolated from the rest of your machine and ensure you have the correct versions.

```
easy_install pip
pip install virtualenv
```
You may need to use `sudo`to install these tools.

```
sudo easy_install pip
sudo pip install virtualenv
```
If you are still getting an error, it means you need to install Python Setup Tools.
```
sudo apt-get install python-setuptools
```

Create a new virtual environment inside of the repository folder, and install the project requirements:

```
virtualenv env --python=python2.7
source env/bin/activate
pip install -r app-requirements.txt
```

Now install npm dependencies:

```
# In project folder
npm install
```

**NOTE:** If you run into trouble with gevent, you can safely comment it out of the requirements.txt file. It is not needed for local development. To comment it out, just add a hash "`#`" to the beginning of the line for `gevent`.

**NOTE:** If you have trouble with `pip install -r app-requirements.txt`, you may need to install the Python development libraries (for Python.h). The Windows installation has them by default, but some UNIX-based systems with a pre-installed Python may not. On such systems, you may need to run `sudo apt-get install python-dev` or download a fresh installer from python.org.

**NOTE:** For Linux users on RHEL/CentOS distros, you will need to have the following libraries installed: `sudo yum groupinstall 'Development Tools'` and `sudo yum install python-devel postgresql-devel`

**NOTE:** Mac OS X users need a command line C/C++ compiler in place for the above steps to work. This can be done by downloading Xcode from the App Store and then installing the Command Line Tools via Xcode's Preferences > Downloads area.

## Usage

**If you want to create a map for your community, don't hesitate to get in touch. We can help you with the setup process!**

### Connecting to an API

In order to collect and store user reports, the map must be configured to connect to a [Mapseed API](https://github.com/mapseed/api) backend.

### Configuring

To customize your map with everything from your API URL to the extra data you want to display, you'll edit your flavor's `config.yml` file. For more information on the configuration process and what options are available, see [the config documentation](https://github.com/mapseed/platform/blob/master/doc/CONFIG.md).

### Starting your map server

If you want to see your map in action, simply run:

```
npm start
```

By default, this will serve your map at [http://localhost:8000](http://localhost:8000).

**NOTE:** If you're new to programming with virtualenv, be sure to remember to activate your virtual environment every time you start a new terminal session:

```
source env/bin/activate
```

### Use the Dev API

If you want to develop without setting up your own [Mapseed API backend](https://github.com/mapseed/api), we've got you covered! Copy and paste this into `src/.env` to connect your local install to the Dev API (full of dummy Duwamish data):

```
FLAVOR=duwamish_flavor
SITE_URL=https://dev-api.heyduwamish.org/api/v2/smartercleanup/datasets/duwamish/
SITE_KEY=MGMzOWU2ZmUwZmFkZDYzZTI1ZmQ3MDhi

DUWAMISH_SITE_URL=https://dev-api.heyduwamish.org/api/v2/smartercleanup/datasets/duwamish
DUWAMISH_DATASET_KEY=MGMzOWU2ZmUwZmFkZDYzZTI1ZmQ3MDhi
```

### Using the in-app editor

The platform includes an in-app editor that you can use to update and hide places and comments on a per-dataset basis. Only authenticated administrators are allowed to make edits. Authentication is performed via third-party social media services (Twitter, Facebook, and Google+ are currently supported), so administrators will need an account on one of these services to use the editor.

Follow these instructions to grant administrator privileges to one or more users:

1. If the user to whom you'd like to grant administrator privileges has previously logged into your app via a social media service, skip to the next step. Otherwise, you'll need to manually add the user before granting privileges. Follow these steps:

    * In the admin panel, click `Users`, then `Add user +`, then create a new User. The username you enter here is arbitrary, although for convenience it may match the social media username of the person to whom you'd like to grant administrator privileges. Note that you may add several user social auths under a single User.

    * Next, in the `User social auths` panel, click `Add user social auth +`, select the User you just created under `User` (or choose an existing User), enter the name of the social service provider (`twitter`, `facebook`, or `google-oauth2`), then enter the social user's `Uid`. The `Uid` can be looked up online: [here](https://tweeterid.com/) for Twitter, and [here](https://lookup-id.com/) for Facebook. For Google, the `Uid` is the user's Gmail address.

2. In the Django admin panel, click on `Data sets` and then the name of the dataset you'd like to grant administrator privileges for.

3. Under the `Groups` section, create a new group called `administrators` if it doesn't already exist. Note that this group must be called `administrators`.

4. Add users to whom you'd like to grant privileges by selecting the user in the `Available submitters` panel and clicking the right arrow to move them to the `Chosen submitters` panel. 

5. Click `Edit permissions` below the submitters panels, and grant `retrieve`, `create`, `update`, and `destroy` privileges. Also make sure that a `*` character is entered in the text box at left. The help text in the admin panel suggests that this box can be left blank, but this is in fact not true.

6. Click `Save`.

7. Now when any of the `Chosen submitters` are logged into your app via a social media service, an edit button will appear on place detail views that belong to datasets where they have administrator privileges. Administrators can edit the title and content of places, edit and delete individual comments, and hide entire places.


## Maintainers

- [futuresoup](https://github.com/futuresoup)
- [LukeSwart](https://github.com/LukeSwart)

## Contribute

Questions and issues should be filed [right here on GitHub](https://github.com/mapseed/platform/issues).

If you'd like to contribute code, we'd love to have it! Fork and submit a PR (base your branch off `master`). No change is too small!

Credits
-------------
Many features are powered by Shareabouts, an open-source project of [OpenPlans](http://openplans.org).


## License

[GNU GPL](https://github.com/mapseed/platform/blob/master/LICENSE.txt)

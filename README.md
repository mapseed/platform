### Hey Duwamish! - [HeyDuwamish.org](http://heyduwamish.org)
### Hey Willamette! - [HeyWillamette.org](http://heywillamette.org)

Community powered mapping for environmental health, starting with our most polluted rivers.

[![Build Status](https://secure.travis-ci.org/mapseed/platform.png)](http://travis-ci.org/mapseed/platform)
===========
For a brief summary, please view: [http://smartercleanup.org/](http://smartercleanup.org/)

Take a look at our [roadmap](https://github.com/mapseed/platform/wiki/Roadmap) to see where we're headed

Local Setup
-------------
Hey Duwamish! requires Python 2.7 ([Instructions for Windows found **here**](/doc/WINDOWS_SETUP.md)).

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

NOTE: If you run into trouble with gevent, you can safely comment it out of the requirements.txt file. It is not needed for local development. To comment it out, just add a hash "`#`" to the beginning of the line for `gevent`.

NOTE: If you have trouble with `pip install -r app-requirements.txt`, you may need to install the Python development libraries (for Python.h). The Windows installation has them by default, but some UNIX-based systems with a pre-installed Python may not. On such systems, you may need to run `sudo apt-get install python-dev` or download a fresh installer from python.org.

NOTE: For Linux users on RHEL/CentOS distros, you will need to have the following libraries installed: `sudo yum groupinstall 'Development Tools'` and `sudo yum install python-devel postgresql-devel`

NOTE: Mac OS X users need a command line C/C++ compiler in place for the above steps to work. This can be done by downloading Xcode from the App Store and then installing the Command Line Tools via Xcode's Preferences > Downloads area.

### Install npm dependencies

Make sure that you are somewhere inside the project folder, then run:

`npm install`

Also, for best results, [install Node version 7+ and the latest npm](https://nodejs.org/en/download/package-manager/).

### Configuring the Dev API

Now that you have the client installed, all you need to do is load the API. The API powers the database that manages the community generated reports.

The platform is capable of manging multiple "flavors" - a flavor is a custom front end map deployment that can have it's own configuration and style rules, but still connect with other flavors on a shared back end, powered by the same data API.

Hey Duwamish has its own flavor configuration in the ``duwamish_flavor`` folder for Seattle residents, and
Hey Willamette has its own flavor configuration in the ``willamette`` folder for Portland residents.

We have a Dev API with dummy data that you can load locally. To enable it, go to the `src` folder and create a new hidden text file called `.env` and paste in the following information:

```
FLAVOR=duwamish_flavor
SITE_URL=https://dev-api.heyduwamish.org/api/v2/smartercleanup/datasets/duwamish/
SITE_KEY=MGMzOWU2ZmUwZmFkZDYzZTI1ZmQ3MDhi

DUWAMISH_SITE_URL=https://dev-api.heyduwamish.org/api/v2/smartercleanup/datasets/duwamish
DUWAMISH_DATASET_KEY=MGMzOWU2ZmUwZmFkZDYzZTI1ZmQ3MDhi

TREES_SITE_URL=https://dev-api.heyduwamish.org/api/v2/smartercleanup/datasets/trees/
TREES_DATASET_KEY=YmIxZjA1OTlmNjUxYWM5NDgwM2Q5NmMx

AIR_SITE_URL=https://dev-api.heyduwamish.org/api/v2/smartercleanup/datasets/air/
AIR_DATASET_KEY=MTc3Y2E2OGM2NDQyMWYyZjJhNWVhM2E4
```

If you want to load a different flavor, like Hey Willamette, just replace the first line with ``FLAVOR=willamette``

NOTE: Flavors can load data from any number of Shareabouts datasets, provided you have a URL and key for each dataset you'd like to load. Dataset URLs and keys are set in your `.env` file, as follows:

```
<DATASET-ID>_SITE_URL=https://path/to/dataset/
<DATASET-ID>_DATASET_KEY=dataset_key
```

`<DATASET-ID>` should be replaced with the id (in UPPERCASE) of your dataset. This is the same id that is referenced in your flavor's `config.yml` file, and corrseponds to the value of the dataset's `Slug` property defined when the dataset was created.

Now you're ready to run your server locally. Just enter this command:

```
npm start
```
The server will, by default, be started at http://localhost:8000/. [Here is the documentation](https://github.com/openplans/shareabouts/blob/master/doc/CONFIG.md) if you want to reconfigure it.

NOTE: If you're new to programming with virtualenv, be sure to remember to activate your virtual environment every time you start a new terminal session:

```
source env/bin/activate
```

### Using the in-app editor
The platform includes an in-app editor (currently only available on the `develop` branch) that you can use to update and hide places and comments on a per-dataset basis. Only authenticated administrators are allowed to make edits. Authentication is performed via third-party social media services (Twitter and Facebook are currently supported), so administrators will need an account on either of these services to use the editor.

Follow these instructions to grant administrator privileges to one or more users:
1. If the user to whom you'd like to grant administrator privileges has previosuly logged into your app via a social media service, skip to the next step. Otherwise, you'll need to manually add the user before granting privileges. Follow these steps:
    - In the admin panel, click `Users`, then `Add user +`, then create a new user. The username you enter here must match the social media username of the person to whom you'd like to grant administrator privileges. 
    - Next, in the `User social auths` panel, click `Add user social auth +`, select the user you just created under `User`, enter the name of the social service provider (`twitter` or `facebook`), then enter the social user's `Uid`. The `Uid` can be looked up online: [here](https://tweeterid.com/) for Twitter, and [here](https://lookup-id.com/) for Facebook.
2. In the Django admin panel, click on `Data sets` and then the name of the dataset you'd like to grant administrator privileges for.
3. Under the `Groups` section, create a new group called `administrators` if it doesn't already exist. Note that this group must be called `administrators`.
4. Add users to whom you'd like to grant privileges by selecting the user in the `Available submitters` panel and clicking the right arrow to move them to the `Chosen submitters` panel. 
5. Click `Edit permissions` below the submitters panels, and grant `retrieve`, `create`, `update`, and `destroy` privileges. Also make sure that a `*` character is entered in the text box at left. The help text in the admin panel suggests that this box can be left blank, but this is in fact not true.
6. Click `Save`.
7. Now when any of the `Chosen submitters` are logged into your app via a social media service, an edit button will appear on place detail views that belong to datasets where they have administrator privileges. Administrators can edit the title and content of places, edit and delete individual comments, and hide entire places.

Credits
-------------
Many features are powered by Shareabouts, an open-source project of [OpenPlans](http://openplans.org).

Read more about Shareabouts and find links to recent sites [on the OpenPlans website](http://openplans.org/shareabouts/).


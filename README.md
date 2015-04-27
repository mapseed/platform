Hey Duwamish!
===========
For a brief summary, please view: [http://smartercleanup.org/](http://smartercleanup.org/)

We are building a geography based community monitoring platform. Our goal is to empower residents to monitor environmental health issues and engage with local leaders to address their concerns. Our first release is focused on the Lower Duwamish River superfund site in Seattle, WA.

We were inspired by the GarageLab collective in Buenos Aires, Argentina who built [Que Pasa Riachuelo](http://quepasariachuelo.org.ar/) to monitor the pollution along the Riachuelo river basin.

More details on getting involved with **Hey Duwamish!** can be found [here](http://wiki.smartercleanup.org/doku.php?id=contribute)

Features
-------------
<dl>
  <dt>Submit a Report</dt>
  <dd>Adding reports is easy. The simple interface lets users quickly drop pins on the map with descriptions and other useful information.</dd>

  <dt>Comment on Reports</dt>
  <dd>Engage your audience in meaningful conversation. Users can leave [rich media] comments on reports.</dd>

  <dt>Explore Rich Environmental Data</dt>
  <dd>Overlay pertinent geographic data. Applying custom vector data to our Geoserver, the Hey Duwamish! map can pull in GeoJson and WMS URLs as additional map layers.</dd>

  <dt>Mapbox Projeplct Integration</dt>
  <dd>Import a Mapbox project to enhance project management into the map</dd>

  <dt>Explore Reports and Comments</dt>
  <dd>The map allows users to find reports and comments in their areas of interest.</dd>

  <dt>Show Support</dt>
  <dd>Need to know which reports are most popular? Users can vote for their favorite reports to show their support.</dd>

  <dt>Social Sharing</dt>
  <dd>Harness the power of viral marketing. Users engage their social network when they share reports on Twitter and Facebook.</dd>

  <dt>Activity Feed</dt>
  <dd>See a list of recently submitted reports, comments, and support.</dd>

  <dt>Responsive Design</dt>
  <dd>We've designed Hey Duwamish to work great and look beautiful on all screen sizes—desktop, mobile, and touch screens!</dd>

Alternatively, you may want to use a [different hosting service](https://github.com/openplans/shareabouts/blob/master/doc/DEPLOY.md) and set up the components of Shareabouts manually.

  <dt>Internationalization</dt>
  <dd>We currently offer a Spanish version of our website, but we are looking to include a Vietnamese version soon</dd>
</dl>

Contributing
------------
In the spirit of [free software](http://www.fsf.org/licensing/essays/free-sw.html), **everyone** is encouraged to help improve this project.

Here are some ways *you* can contribute:

* by reporting bugs
* by suggesting new features
* by writing or editing documentation
* by writing specifications
* by writing code (**no patch is too small**: fix typos, add comments, clean up inconsistent whitespace)
* by refactoring code
* by resolving issues
* by reviewing patches

Catch us on Freenode at #Smartercleanup

Local Setup
-------------
Hey Duwamish! requires python2.6 or greater.

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
Create a new virtual environment inside of the repository folder, and install the project requirements:

```
virtualenv env
source env/bin/activate
pip install -r requirements.txt
```
NOTE: As of January 2015, some Postgres dependencies are required. These can be resolved using `sudo apt-get install  postgresql libpq-dev` on Debian/Ubuntu or `brew install postgresql` on a Mac.

NOTE: If you run into trouble with gevent, you can safely comment it out of the requirements.txt file. It is not needed for local development. To comment it out, just add a hash "`#`" to the beginning of the line for `gevent`.

NOTE: If you have trouble with `pip install -r requirements.txt`, you may need to install the Python development libraries (for Python.h). The Windows installation has them by default, but some UNIX-based systems with a pre-installed Python may not. On such systems, you may need to run `sudo apt-get install python-dev` or download a fresh installer from python.org.

NOTE: Mac OS X users need a command line C/C++ compiler in place for the above steps to work. This can be done by downloading Xcode from the App Store and then installing the Command Line Tools via Xcode's Preferences > Downloads area.

Next, add the `.env` file under `src/.env` that was provided to you by your project contact. The file should contain the following format:

```
SITE_KEY='abcd'
SITE_URL='http://example.com'
```

To run the development server:

```
src/manage.py runserver
```
The server will, by default, be started at http://localhost:8000/. It is already configured for Hey Duwamish! but [here is the documentation](https://github.com/openplans/shareabouts/blob/master/doc/CONFIG.md) if you want to reconfigure it.

NOTE: If you're new to programming with virtualenv, be sure to remember to activate your virtual environment every time you start a new terminal session:

```
source env/bin/activate
```

Credits
-------------
Many features are powered by Shareabouts, an open-source project of [OpenPlans](http://openplans.org).

Read more about Shareabouts and find links to recent sites [on the OpenPlans website](http://openplans.org/shareabouts/).


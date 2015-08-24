Windows Local Setup
===========

Hey Duwamish! requires Python 2.6 or greater  (and PostgreSQL development libraries by default to build).

Install `pip` and `virtualenv`, if not already installed. These will keep your python code isolated from the rest of your machine and ensure you have the correct versions.
```
easy_install pip
pip install virtualenv
```


Microsoft Visual C++ Compiler for Python is required. For version 2.7, get it from http://aka.ms/vcpython27 and install.


Create a new virtual environment inside of the repository folder:
```
virtualenv env
env\scripts\activate
```


[**Download and install the PostgreSQL dependencies at this link**](http://www.stickpeople.com/projects/python/win-psycopg/).

Scroll down to the the **Release Files** section of the page. Choose the download for your machine architecture and Python version. Download to the `env` folder (the project's virtual environment).

**Do not double-click the package to run;** instead, use easy_install. The command should look something like:
```
(env) C:\duwamish> easy_install env\psycopg2-2.6.1.win32-py2.7-pg9.4.4-release.exe 
```


Install the project requirements:
```
pip install -r requirements.txt
```


**NOTE: You can run the project locally without completing this step:*

Next, add the `.env` file under `src/.env` that was provided to you by your project contact. The file should contain the following format:

```
SITE_KEY='abcd'
SITE_URL='http://example.com'
```

To run the development server:
```
	python src\manage.py runserver
```
The server will, by default, be started at http://localhost:8000/. It is already configured for Hey Duwamish! but [here is the documentation](https://github.com/openplans/shareabouts/blob/master/doc/CONFIG.md) if you want to reconfigure it.


NOTE: If you're new to programming with virtualenv, be sure to remember to activate your virtual environment every time you start a new terminal session:

```
env\scripts\activate
```

Credits
-------------
Many features are powered by Shareabouts, an open-source project of [OpenPlans](http://openplans.org).

Read more about Shareabouts and find links to recent sites [on the OpenPlans website](http://openplans.org/shareabouts/).

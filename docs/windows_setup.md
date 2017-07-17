---
layout: page
title: Windows Setup
# icon: fa-paper-plane
last_updated: November 5th, 2015
permalink: /windows-setup/
---

{% capture main %}
# Windows Local Setup

Hey Duwamish! requires Python 2.6 or greater  (and PostgreSQL development libraries by default to build).

Install `pip` and `virtualenv`, if not already installed. These will keep your python code isolated from the rest of your machine and ensure you have the correct versions.
```
easy_install pip
pip install virtualenv
```


---

Microsoft Visual C++ Compiler for Python is required.

For version 2.7, get it from http://aka.ms/vcpython27 and install.

---


Create a new virtual environment inside of the repository folder:
```
virtualenv env
env\scripts\activate
```

Or, if you're using Anaconda:
```
conda create --name duwamish27 python=2.7
activate duwamish27
```

---

Install the project requirements:
```
pip install -r app-requirements.txt
```


---

Congratulations! You have now installed our platform. To configure your installation and run the server, follow the steps in our documentation here: https://github.com/smartercleanup/duwamish#configuring-the-dev-api

## Credits

Many features are powered by Shareabouts, an open-source project of [OpenPlans](http://openplans.org).

Read more about Shareabouts and find links to recent sites [on the OpenPlans website](http://openplans.org/shareabouts/).
{% endcapture %}

{% capture toc %}
* TOC
{:toc}
{: #doc-menu .nav .doc-menu}
{% endcapture %}


{% include toc-template.html %}

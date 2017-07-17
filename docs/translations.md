---
layout: page
title: Translations
# icon: fa-paper-plane
last_updated: October 5th, 2015
permalink: /translations/
---

{% capture main %}
# Guide for Contributing Translations to Hey Duwamish

[Guía para hacer traducciones para Hey Duwamish en español](/traducciones/)

If you are a translator and wondering about how to start contributing to Hey Duwamish, this guide is for you!

1. **Get the translation files**

  Our **Spanish** translation files are here:
   - [src/flavors/duwamish_flavor/locale/es/LC_MESSAGES/django.po](https://github.com/smartercleanup/duwamish/blob/master/src/flavors/duwamish_flavor/locale/es/LC_MESSAGES/django.po)
   - [src/base/locale/es/LC_MESSAGES/django.po](https://github.com/smartercleanup/duwamish/blob/master/src/base/locale/es/LC_MESSAGES/django.po)

  Our **Vietnamese** translation files are here:
   - [src/flavors/duwamish_flavor/locale/vi/LC_MESSAGES/django.po](https://github.com/smartercleanup/duwamish/blob/master/src/flavors/duwamish_flavor/locale/vi/LC_MESSAGES/django.po)
   - [src/base/locale/vi/LC_MESSAGES/django.po](https://github.com/smartercleanup/duwamish/blob/master/src/base/locale/vi/LC_MESSAGES/django.po)

  These translation files are using a common translation format called a "PO file". A useful tool for editing a PO File can be found here: http://poedit.net/

2. **Complete the translations**

  For example, you may see the following block in a translation file:

  ```python
  #: src/base/jstemplates/auth-nav.html:1
  #: src/base/jstemplates/place-form.html:3
  msgid "Log Out"
  msgstr ""
  ```

  This means that there is some text on the site somewhere that reads "Log Out", and by filling in the `msgstr` variable, we are updating the translation. For example, changing `msgstr ""` to `msgstr "đảng xuãt"`, will allow the program to scan this file and update the translations on the website.

  So you would want to make it look like this:

  ```python
  #: src/base/jstemplates/auth-nav.html:1
  #: src/base/jstemplates/place-form.html:3
  msgid "Log Out"
  msgstr "đảng xuãt"
  ```
  That's it!

  For more information about PO files, refer to the [official PO file documentation](https://www.gnu.org/software/gettext/manual/html_node/PO-Files.html)
{% endcapture %}

{% capture toc %}
* TOC
{:toc}
{: #doc-menu .nav .doc-menu}
{% endcapture %}


{% include toc-template.html %}

Guide for Contributing Translations to Hey Duwamish
==================================================

[Guía para hacer traducciones para Hey Duwamish en español](/doc/TRADUCCIONES.md)

If you are a translator and wondering about how to start contributing to Hey Duwamish, this guide is for you!

1. **Get the translation files**

  **For Spanish translators:** Find our translation files under `src/flavors/duwamish_flavor/locale/es/LC_MESSAGES/django.po` and `src/sa_web/locale/es/LC_MESSAGES/django.po`.

  **For Vietnamese translators:** Find our translation files under `src/flavors/duwamish_flavor/locale/vi/LC_MESSAGES/django.po` and `src/sa_web/locale/vi/LC_MESSAGES/django.po`.

2. **Complete the translations**

  For example, you may see the following block in a translation file:

  ```python
  #: src/sa_web/jstemplates/auth-nav.html:1
  #: src/sa_web/jstemplates/place-form.html:3
  msgid "Log Out"
  msgstr ""
  ```

  This means that there is some text on the site somewhere that reads "Log Out", and by filling in the `msgstr` variable, we are updating the translation. For example, changing `msgstr ""` to `msgstr "đảng xuãt"`, will allow the program to scan this file and update the translations on the website.

  So you would want to make it look like this:

  ```python
  #: src/sa_web/jstemplates/auth-nav.html:1
  #: src/sa_web/jstemplates/place-form.html:3
  msgid "Log Out"
  msgstr "đảng xuãt"
  ```
  That's it!

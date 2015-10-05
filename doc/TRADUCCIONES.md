Guía para contribuir traducciones para Hey Duwamish
===================================================

[Guide for Contributing Translations for Hey Duwamish](/doc/TRANSLATIONS.md)

Si eres un@ traductor@, y no estás segur@ cómo contribuir a Hey Duwamish, ¡esta guía es para tí!

1. **Colectar los archivos de traducción**

  Encuentra nuestros archivos de traducción en las archivos: `src/flavors/duwamish_flavor/locale/es/LC_MESSAGES/django.po` y `src/sa_web/locale/es/LC_MESSAGES/django.po`.

2. **Completar las traducciones**

  Por ejemplo, un archivo puede contener este texto:

  ```python
  #: src/sa_web/jstemplates/auth-nav.html:1
  #: src/sa_web/jstemplates/place-form.html:3
  msgid "Log Out"
  msgstr ""
  ```

  Lo encima significa que existe texto inglés en el website que dice "Log Out", y podemos traducir este texto por completar la sección que empieza con `msgstr`. Entonces, editamos `msgstr ""` a `msgstr "Cerrar Sesión"` para que el software haga la versión española en el website.

  Por consiguente, lo haríamos así:

  ```python
  #: src/sa_web/jstemplates/auth-nav.html:1
  #: src/sa_web/jstemplates/place-form.html:3
  msgid "Log Out"
  msgstr "Cerrar Sesión"
  ```

  ¡Es todo!

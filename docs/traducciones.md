---
layout: page
title: Traducciones
# icon: fa-paper-plane
last_updated: October 5th, 2015
permalink: /traducciones/
---

{% capture main %}
# Guía para contribuir traducciones para Hey Duwamish

[Guide for Contributing Translations for Hey Duwamish](/translations/)

Si eres un@ traductor@, y no estás segur@ cómo contribuir a Hey Duwamish, ¡esta guía es para tí!

1. **Colectar los archivos de traducción**

  Se encuentra nuestros archivos de traducción en los archivos aquí:

   - [src/flavors/duwamish_flavor/locale/es/LC_MESSAGES/django.po](https://github.com/smartercleanup/duwamish/blob/master/src/flavors/duwamish_flavor/locale/es/LC_MESSAGES/django.po)
   - [src/base/locale/es/LC_MESSAGES/django.po](https://github.com/smartercleanup/duwamish/blob/master/src/base/locale/es/LC_MESSAGES/django.po)

  Estos archivos se desarollan con arreglo al formato de un "PO file". Un editor de texto que facilita el desarollamiento de los archivos de PO está aquí: http://poedit.net/

2. **Completar las traducciones**

  Por ejemplo, un archivo puede contener este texto:

  ```python
  #: src/base/jstemplates/auth-nav.html:1
  #: src/base/jstemplates/place-form.html:3
  msgid "Log Out"
  msgstr ""
  ```

  Lo encima significa que existe texto inglés en el website que dice "Log Out", y podemos traducir este texto por completar la sección que empieza con `msgstr`. Entonces, editamos `msgstr ""` a `msgstr "Cerrar Sesión"` para que el software haga la versión española en el website.

  Por consiguente, lo haríamos así:

  ```python
  #: src/base/jstemplates/auth-nav.html:1
  #: src/base/jstemplates/place-form.html:3
  msgid "Log Out"
  msgstr "Cerrar Sesión"
  ```

  ¡Es todo!

  Para obtener más información sobre los archivos de PO, [consulte la documentación oficial](https://www.gnu.org/software/gettext/manual/html_node/PO-Files.html)
{% endcapture %}

{% capture toc %}
* TOC
{:toc}
{: #doc-menu .nav .doc-menu}
{% endcapture %}


{% include toc-template.html %}

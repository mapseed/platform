---
layout: page
title: Mapseed Docs
icon: fa-globe
last_updated: July 16th, 2017
permalink: /
---

{% for p in site.pages %}
{% if p.title != page.title %}
* [{{p.title}}]({{p.url}})
{% endif %}
{% endfor %}

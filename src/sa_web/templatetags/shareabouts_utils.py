import json
from django.template import Library
from django.utils.safestring import mark_safe
from django.conf import settings
from ..config import ShareaboutsLocalConfig

register = Library()


@register.filter
def as_json(data):
    return mark_safe(json.dumps(data))


@register.filter
def get_item(dictionary, key):
    return dictionary.get(key)


@register.assignment_tag
def get_flavor_static_url():
    static_url = ShareaboutsLocalConfig(
        settings.SHAREABOUTS.get('CONFIG')).static_url()
    return static_url

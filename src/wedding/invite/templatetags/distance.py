from django import template
from django.utils.translation import get_language_from_request

register = template.Library()


@register.simple_tag(takes_context=True)
def locale_distance(context, value):
    meters = int(value)
    request = context.get("request")
    lang = get_language_from_request(request)
    if(lang[:2] == 'en'):
        return '{} miles'.format(round(meters/1609.344, 1))
    else:
        return '{} km'.format(round(meters/1000, 1))


register.filter('seconds_to_minutes', lambda value: round(int(value) / 60))

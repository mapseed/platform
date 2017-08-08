import requests
import yaml
import ujson as json
import logging
import os
import time
import hashlib
import httpagentparser
import urllib2
from .config import get_shareabouts_config
from django.shortcuts import render
from django.conf import settings
from django.core.cache import cache
from django.core.mail import EmailMultiAlternatives
from django.http import HttpResponse, Http404
from django.template import TemplateDoesNotExist, RequestContext
from django.template.loader import render_to_string
from django.utils.timezone import now
from django.views.decorators.csrf import ensure_csrf_cookie
from django.core.urlresolvers import resolve, reverse
from proxy.views import proxy_view as remote_proxy_view

log = logging.getLogger(__name__)

@ensure_csrf_cookie
def index(request, place_id=None):
    # Load app config settings
    config = get_shareabouts_config(settings.SHAREABOUTS.get('CONFIG'))
    config.update(settings.SHAREABOUTS.get('CONTEXT', {}))

    # Get the content of the static pages linked in the menu.
    pages_config = config.get('pages', [])
    pages_config_json = json.dumps(pages_config)

    # The user token will be a pair, with the first element being the type
    # of identification, and the second being an identifier. It could be
    # 'username:mjumbewu' or 'ip:123.231.132.213', etc.  If the user is
    # unauthenticated, the token will be session-based.
    if 'user_token' not in request.session:
        t = int(time.time() * 1000)
        ip = request.META['REMOTE_ADDR']
        unique_string = str(t) + str(ip)
        session_token = 'session:' + hashlib.md5(unique_string).hexdigest()
        request.session['user_token'] = session_token
        request.session.set_expiry(0)

    user_token_json = u'"{0}"'.format(request.session['user_token'])

    # Get the browser that the user is using.
    user_agent_string = request.META.get('HTTP_USER_AGENT', '')
    if user_agent_string:
        user_agent = httpagentparser.detect(user_agent_string)
        user_agent_json = json.dumps(user_agent)
    else:
        # If no user agent is specified, stub a generic one in.
        user_agent_json = json.dumps({
            "os": {"name": ""},
            "browser": {"name": "", "version": None},
            "platform": {"name": "", "version": None}
        })
    
    # Get initial data for bootstrapping into the page.
    dataset_root = settings.SHAREABOUTS.get('DATASET_ROOT')
    if (dataset_root.startswith('file:')):
        dataset_root = request.build_absolute_uri(reverse('api_proxy', args=('',)))

    context = {'config': config,
               'user_token_json': user_token_json,
               'pages_config': pages_config,
               'pages_config_json': pages_config_json,
               'user_agent_json': user_agent_json,
               # Useful for customized meta tags
               'API_ROOT': dataset_root,
               'DATASET_ROOT': dataset_root
               }

    return render(request, 'index.html', context)


def place_was_created(request, path, response):
    path = path.strip('/')
    return (
        path.startswith('places') and
        not path.startswith('places/') and
        response.status_code == 201)


def send_place_created_notifications(request, response):
    config = get_shareabouts_config(settings.SHAREABOUTS.get('CONFIG'))
    config.update(settings.SHAREABOUTS.get('CONTEXT', {}))

    # Before we start, check whether we're configured to send at all on new
    # place.
    should_send = config.get('notifications', {}).get('on_new_place', False)
    if not should_send:
        return

    # First, check that we have all the settings and data we need. Do not bail
    # after each error, so that we can report on all the validation problems
    # at once.
    errors = []

    try:
        # The reuest has any potentially private data fields.
        requested_place = json.loads(request.body)
    except ValueError:
        errors.append("Received invalid place JSON from request: %r" %
                      (request.body,))

    try:
        # The response has things like ID and cretated datetime
        try:
            response.render()
        except:
            pass
        place = json.loads(response.content)
    except ValueError:
        errors.append("Received invalid place JSON from response: %r" %
                      (response.content,))

    try:
        from_email = settings.EMAIL_ADDRESS
    except AttributeError:
        errors.append("EMAIL_ADDRESS setting must be configured in order to "
                      "send notification emails.")

    try:
        email_field = config.get('notifications', {}).get(
            'submitter_email_field', 'submitter_email')
        recipient_email = requested_place['properties'][email_field]
    except KeyError:
        errors.append("No '%s' field found on the place. "
                      "Be sure to configure the 'notifications.submitter_"
                      "email_field' property if necessary." % (email_field,))

    # Bail if any errors were found. Send all errors to the logs and otherwise
    # fail silently.
    if errors:
        for error_msg in errors:
            log.error(error_msg)
        return

    # If the user didn't provide an email address, then no need to go further.
    if not recipient_email:
        return

    # Set optional values
    bcc_list = getattr(settings, 'EMAIL_NOTIFICATIONS_BCC', [])

    # If we didn't find any errors, then render the email and send.
    context_data = RequestContext(request, {
        'place': place,
        'email': recipient_email,
        'config': config,
    })
    subject = render_to_string('new_place_email_subject.txt', context_data)
    body = render_to_string('new_place_email_body.txt', context_data)

    try:
        html_body = render_to_string('new_place_email_body.html', context_data)
    except TemplateDoesNotExist:
        html_body = None

    # connection = smtp.EmailBackend(
    #     host=...,
    #     port=...,
    #     username=...,
    #     use_tls=...)

    # NOTE: In Django 1.7+, send_mail can handle multi-part email with the
    # html_message parameter, but pre 1.7 cannot and we must construct the
    # multipart message manually.
    msg = EmailMultiAlternatives(
        subject,
        body,
        from_email,
        to=[recipient_email],
        bcc=bcc_list)
    # connection=connection)

    if html_body:
        msg.attach_alternative(html_body, 'text/html')

    msg.send()
    return


def proxy_view(request, url, requests_args={}):
    # For full URLs, use a real proxy.
    if url.startswith('http:') or url.startswith('https:'):
        return remote_proxy_view(request, url, requests_args=requests_args)

    # For local paths, use a simpler proxy. If there are headers specified
    # in the requests_args, keep those.
    else:
        match = resolve(url)
        for name, value in requests_args.get('headers', {}).items():
            name = name.upper().replace('-', '_')
            if name not in ('ACCEPT', 'CONTENT_TYPE'):
                name = 'HTTP_' + name
            request.META[name] = value
        return match.func(request, *match.args, **match.kwargs)


def readonly_response(request, data):
    response_string = json.dumps(data)
    content_type = 'application/json'

    if 'callback' in request.GET:
        response_string = '%s(%s);' % (request.GET['callback'], response_string)
        content_type = 'application/javascript'

    return HttpResponse(response_string, content_type=content_type)


def readonly_file_api(request, path, datafilename='data.json'):
    if path.endswith('actions'):
        return readonly_response(request, {
            'results': [],
            'metadata': {
                'length': 0,
                'next': None,
                'previous': None
            },
        })

    with open(datafilename) as datafile:
        data = json.load(datafile)

        try:
            page_size = int(request.GET.get('page_size'))
        except (TypeError, ValueError):
            page_size = 100

        try:
            page = int(request.GET.get('page'))
        except (TypeError, ValueError):
            page = 1

        start = (page - 1) * page_size
        end = page * page_size
        count = len(data['features'])

        if path.endswith('places'):
            return readonly_response(request, {
                'type': 'FeatureCollection',
                'features': data['features'][start:end],
                'metadata': {
                    'length': count,
                    'next': (end < count) or None,
                    'previous': (start > 0) or None,
                    'page': page,
                    'num_pages': count // page_size + (0 if count % page_size == 0 else 1)
                },
            })

        components = path.split('/')

        seen_places = False
        place_id = set_name = submission_id = None

        for component in components:
            if component == 'places':
                seen_places = True
                continue

            if not seen_places:
                continue

            if place_id is None:
                place_id = int(component)
                continue

            if set_name is None:
                set_name = component
                continue

            if submission_id is None:
                submission_id = int(component)

        for feature in data['features']:
            if feature['id'] != place_id:
                continue

            submissions = feature['properties']['submission_sets'].get(set_name, [])

            # If there's a submission_id, then we're getting a submission
            # instance.
            if submission_id:
                for submission in submissions:
                    if submission['id'] != submission_id:
                        continue

                    return readonly_response(request, submission)
                else:
                    raise Http404

            # If there's no submission_id but there's a set_name, then we're
            # getting a list of submissions.
            elif set_name:
                return readonly_response(request, {
                    'results': submissions,
                    'metadata': {
                        'length': len(submissions),
                        'next': None,
                        'previous': None,
                        'page': 1,
                        'num_pages': 1
                    },
                })

            # Otherwise, we're getting a place instance (place lists and actions
            # are covered above).
            else:
                return readonly_response(request, feature)
        else:
            raise Http404

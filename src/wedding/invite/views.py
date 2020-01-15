from django.http import HttpResponse, JsonResponse, HttpResponseRedirect, Http404, QueryDict

from django.utils import translation
from django.views.generic import DetailView, View, TemplateView
from django.views.generic.edit import FormView
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from wedding.hotels.models import Hotel
from .models import Guest, Response, Table, TableGuest
from .utils import phone_normalise
from urllib.parse import unquote

from .forms import ResponseForm, PhoneForm

# from django.db import connection, reset_queries


class InvitesView(DetailView):

    template_name = 'index.html'
    model = Guest

    def get(self, request, *args, **kwargs):
        lang = request.GET.get('lang')
        if(lang == 'de'):
            translation.activate(lang)
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        return Guest.invited.get_queryset()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        person = context.get('object')
        other_guest = Guest.objects.filter(
            additions=person.additions).exclude(pk=person.pk).order_by('pk')
        context['other_guest'] = other_guest
        context['wedding_date'] = settings.WEDDING_DATE
        context['hotels'] = Hotel.objects.all()
        context['rsvp'] = {
            'form': self._get_forms(person, other_guest),
            'submitted': False
        }

        count = 0
        for form in context['rsvp'].get('form'):
            if form.instance.pk:
                count += 1
        context['rsvp']['submitted'] = count > len(context['other_guest'])
        return context

    def _get_forms(self, person, other_guest):
        forms = [self._get_form(person)]
        for guest in other_guest:
            forms.append(self._get_form(guest))
        return forms

    def _get_form(self, guest):
        try:
            return ResponseForm(
                instance=guest.response, prefix=guest.pk)
        except Guest.response.RelatedObjectDoesNotExist:
            return ResponseForm(initial={'guest': guest}, prefix=guest.pk)

class EveningView(TemplateView):
    
    template_name = 'evening.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['wedding_date'] = settings.WEDDING_DATE
        context['hotels'] = Hotel.objects.all()
        return context


class Count(TemplateView):
    template_name = 'count.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['response'] = Response.objects.select_related(
            'guest').filter(response=True)
        context['adultCount'] = Response.objects.filter(
            response=True, guest__is_child=False).count()
        context['childCount'] = Response.objects.filter(
            response=True, guest__is_child=True).count()
        context['notAttendingCount'] = Response.objects.filter(
            response=False).count()
        context['noReplyCount'] = Response.objects.filter(
            response=None).count()
        return context


class ResponseSubmit(View):
    http_method_names = ['post']

    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get_object(self, queryset=None):
        slug = self.kwargs.get('slug')
        try:
            return Guest.objects.get(slug=slug)
        except:
            raise Http404('Not Found')

    def post(self, request, *args, **kwargs):
        guests = self.get_object().additions.guest_set.all()
        responseCollection = []
        jsonData = {
            'allValid': False,
            'errors': {}
        }
        for guest in guests:
            response = ResponseForm(
                request.POST, prefix=guest.pk, instance=guest.response if hasattr(guest, 'response') else None)
            if response.is_valid():
                responseCollection.append(response)
            else:
                jsonData['errors'][response.prefix] = response.errors.as_json(
                    escape_html=True)

        if(len(responseCollection) == len(guests)):
            for r in responseCollection:
                r.save()
            jsonData['allValid'] = True

        return JsonResponse(jsonData)


class StatusSubmit(View):
    http_method_names = ['post']

    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        status = request.POST.get('MessageStatus')
        to = request.POST.get('To')
        try:
            guest = Guest.objects.get(
                mobile_number=phone_normalise(unquote(to)))
            guest.message_status = status
            guest.save()
        except Guest.DoesNotExist:
            guest = Guest.objects.get(
                mobile_number=phone_normalise(unquote(to))+' ')
            guest.message_status = status
            guest.save()

        return JsonResponse({})


class Tables(TemplateView):
    http_method_names = ['post', 'get']
    template_name = 'table.html'

    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        # reset_queries()
        name = request.POST.get('name')
        action = request.POST.get('action')
        if(action == 'table'):
            table = Table(name=name)
            table.save()
        if(action == 'addGuest'):
            # try:
            self.add_guest(request)
        if(action == 'removeGuest'):
            self.remove_guest(request)
        if(action == 'updateGuest'):
            self.update_guest(request)
            # except:
            #     return HttpResponse('Table or guest does not exists', status=500)
        data = self.get_json_data()
        # data['debug'] = connection.queries
        return JsonResponse(data, safe=True)

    def remove_guest(self, request):
        tableGuestPk = request.POST.get('tableGuestPk')
        TableGuest.objects.get(pk=int(tableGuestPk)).delete()

    def add_guest(self, request):
        guestId = request.POST.get('guestId')
        tableId = request.POST.get('tableId')
        table = Table.objects.get(pk=int(tableId))
        guest = Guest.objects.get(pk=int(guestId))
        tableGuest = TableGuest()
        tableGuest.guest = guest
        tableGuest.table = table
        tableGuest.save()

    def update_guest(self, request):
        seatId = request.POST.get('seatId')
        tableId = request.POST.get('tableId')
        tableGuest = TableGuest.objects.get(pk=int(seatId))
        tableGuest.table_id = int(tableId)
        tableGuest.save()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        tables = Table.objects.prefetch_related(
            'tableguest_set', 'tableguest_set__guest').all()
        context['tables'] = tables
        tableGuestIds = list(
            TableGuest.objects.all().values_list('guest_id', flat=True))

        context['response'] = Response.objects.select_related(
            'guest').filter(response=True).exclude(guest_id__in=tableGuestIds)

        return context

    def get_json_data(self):
        context = {}
        tables = Table.objects.prefetch_related(
            'tableguest_set').all()
        tableDict = {}
        tableGuestIds = list(
            TableGuest.objects.all().values_list('guest_id', flat=True))

        for table in tables:
            tableDict[table.name] = {
                "pk": table.pk,
                "seats": list(table.tableguest_set.prefetch_related('guest').all().values('guest_id', 'guest__first_name', 'guest__last_name', 'pk'))
            }

        context['response'] = list(Response.objects.select_related(
            'guest').filter(response=True).exclude(guest_id__in=tableGuestIds).values('guest__first_name', 'guest__last_name', 'guest__pk'))

        context['tables'] = tableDict
        return context


class NotFound(FormView):
    template_name = 'not_found/index.html'
    form_class = PhoneForm

    def form_valid(self, form):
        try:
            guest = Guest.invited.get(
                mobile_number=form.cleaned_data.get('phone'))
            return HttpResponseRedirect(guest.get_absolute_url())
        except:
            form.add_error(
                'phone', 'Can not find invite contact Sophie or Adam')
            return self.render_to_response(self.get_context_data(form=form))


def csv_export_confirmed(request):
    guest_response = Response.objects.select_related('guest').filter(
        response=True).values_list('guest__first_name', flat=True)
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="namecard.csv"'
    response.write('\n'.join(list(guest_response)))
    return response

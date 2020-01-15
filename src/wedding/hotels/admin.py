from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.http import JsonResponse
from .models import Hotel
import requests


@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ('name',)
    change_form_template = 'admin/hotel/change_form.html'

    def get_urls(self):
        urls = super().get_urls()
        my_urls = [
            path('places/', self.admin_site.admin_view(self.place_view))
        ]
        return my_urls + urls

    def place_view(self, request):
        place_id = request.GET.get('placeid')

        settings.GOOGLE_KEY
        params = {
            'key': settings.GOOGLE_KEY,
            'placeid': place_id,
            'fields': 'name,formatted_phone_number,geometry,address_component',
        }

        r = requests.get(
            'https://maps.googleapis.com/maps/api/place/details/json', params=params)

        params_direction_church = {
            'key': settings.GOOGLE_KEY,
            'origin': 'place_id:{}'.format(place_id),
            'destination': 'place_id:{}'.format(settings.CHURCH_GEO)
        }

        r_church = requests.get(
            'https://maps.googleapis.com/maps/api/directions/json', params=params_direction_church)

        params_direction_reception = {
            'key': settings.GOOGLE_KEY,
            'origin': 'place_id:{}'.format(place_id),
            'destination': settings.RECEPTION_GEO
        }

        r_reception = requests.get(
            'https://maps.googleapis.com/maps/api/directions/json', params=params_direction_reception)

        json = {
            'church': r_church.json(),
            'place': r.json(),
            'reception': r_reception.json()
        }
        return JsonResponse(json)

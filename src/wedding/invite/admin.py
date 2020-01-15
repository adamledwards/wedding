from django.contrib import admin
from django import forms
from django.urls import reverse
from django.utils.safestring import mark_safe

from .models import Guest, Invite, Response, Table, TableGuest


class GuestInline(admin.TabularInline):
    model = Guest
    extra = 0
    exclude = ['country', 'slug']


@admin.register(Invite)
class InviteAdmin(admin.ModelAdmin):
    inlines = [
        GuestInline,
    ]


@admin.register(Guest)
class InviteAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'message_status',
                    'mobile_number', 'view_on_site_link')

    def full_name(self, obj):
        return '{0} {1}'.format(obj.first_name, obj.last_name)

    def view_on_site(self, obj):
        url = reverse('guest', kwargs={'slug': obj.slug})
        return url

    def view_on_site_link(self, obj):
        return mark_safe('<a href="{}" >View on site<a/>'.format(self.view_on_site(obj)))


@admin.register(Response)
class ResponseAdmin(admin.ModelAdmin):
    list_display = ('guest', 'response', 'message')


admin.site.register(Table)

admin.site.register(TableGuest)

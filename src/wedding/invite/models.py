from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.utils.translation import gettext_lazy as _
from django.db import models
from django.utils.text import slugify
from django.urls import reverse
from base64 import urlsafe_b64decode, urlsafe_b64encode
from .utils import phone_normalise


class GuestManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().exclude(mobile_number__isnull=True).exclude(mobile_number="")


class Guest(models.Model):
    first_name = models.CharField(max_length=200)
    last_name = models.CharField(max_length=200)
    mobile_number = models.CharField(max_length=15, blank=True, null=True)
    is_child = models.BooleanField(default=False)
    additions = models.ForeignKey(
        'Invite', on_delete=models.SET_NULL, null=True)

    slug = models.SlugField(unique=True, blank=True)

    message_status = models.CharField(max_length=200, blank=True, null=True)

    objects = models.Manager()
    invited = GuestManager()

    def save(self, *args, **kwargs):
        if self.mobile_number:
            self.mobile_number = phone_normalise(
                self.mobile_number.replace(" ", ""))
        if not self.slug:
            self.slug = self._get_unique_slug()
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('guest', args=(self.slug,))

    def _get_unique_slug(self):
        slug = slugify('{}{}'.format(self.last_name[:3], self.first_name[:3]))
        num = 1
        unique_slug = slug
        while Guest.objects.filter(slug=unique_slug).exists():
            unique_slug = '{}-{}'.format(slug, num)
            num += 1
        return unique_slug

    def __str__(self):
        return '{0} {1}'.format(self.first_name, self.last_name)

    class Meta:
        unique_together = ('first_name', 'last_name')


class Invite(models.Model):
    COUNTRY = (
        ('UK', 'United Kingdom'),
        ('DE', 'Germany'),
    )
    country = models.CharField(max_length=2, choices=COUNTRY, default='UK')

    def __str__(self):
        invites = list(self.guest_set.values_list(
            'first_name', flat=True).order_by('pk').all())
        return ' , '.join(invites)


class Response(models.Model):
    guest = models.OneToOneField(Guest, on_delete=models.DO_NOTHING)
    response = models.BooleanField(null=True)
    message = models.TextField(null=True, blank=True)

    def __str__(self):
        return '{0}'.format(self.guest)

    def clean(self):
        if self.response == None:
            raise ValidationError(
                _('Please submit a response'), code='no-response')


class Table(models.Model):
    name = models.TextField(null=True, blank=True)

    def __str__(self):
        return '{0}'.format(self.name)


class TableGuest(models.Model):
    guest = models.OneToOneField(Guest, on_delete=models.DO_NOTHING)
    table = models.ForeignKey(Table, on_delete=models.DO_NOTHING)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['updated']

    def __str__(self):
        return '{0} {1}'.format(self.guest, self.table)

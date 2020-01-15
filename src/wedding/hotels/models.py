from django.db import models


class Hotel(models.Model):

    name = models.CharField(max_length=200)
    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=255, default='Colchester')
    post_code = models.CharField(max_length=8)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    place_id = models.CharField(max_length=255)

    image = models.ImageField(blank=True, null=True)
    reception_distance = models.IntegerField(blank=True, null=True)
    reception_duration = models.IntegerField(blank=True, null=True)
    church_distance = models.IntegerField(blank=True, null=True)
    church_duration = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return self.name

# Generated by Django 2.1.5 on 2019-02-10 22:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('invite', '0009_guest_slug'),
    ]

    operations = [
        migrations.AlterField(
            model_name='guest',
            name='slug',
            field=models.SlugField(blank=True, unique=True),
        ),
    ]

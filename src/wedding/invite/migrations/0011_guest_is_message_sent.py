# Generated by Django 2.1.5 on 2019-02-12 16:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('invite', '0010_auto_20190210_2206'),
    ]

    operations = [
        migrations.AddField(
            model_name='guest',
            name='is_message_sent',
            field=models.BooleanField(default=False),
        ),
    ]

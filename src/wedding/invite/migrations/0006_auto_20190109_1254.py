# Generated by Django 2.1.5 on 2019-01-09 12:54

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('invite', '0005_auto_20190107_2110'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='response',
            name='invite',
        ),
        migrations.AlterField(
            model_name='response',
            name='guest',
            field=models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='invite.Guest', unique=True),
        ),
        migrations.AlterUniqueTogether(
            name='guest',
            unique_together={('first_name', 'last_name')},
        ),
    ]

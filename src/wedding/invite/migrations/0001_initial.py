# Generated by Django 2.1.4 on 2018-12-29 22:12

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Guest',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(max_length=200)),
                ('last_name', models.CharField(max_length=200)),
                ('country', models.CharField(choices=[('UK', 'United Kingdom'), ('DE', 'Germany')], default='UK', max_length=2)),
                ('mobile_number', models.CharField(blank=True, max_length=15, null=True)),
                ('is_head', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Invite',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('invitee', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='invitee', to='invite.Guest')),
            ],
        ),
        migrations.CreateModel(
            name='Response',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('response', models.BooleanField(null=True)),
                ('guest', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='invite.Guest')),
                ('invite', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='invite.Invite')),
            ],
        ),
        migrations.AddField(
            model_name='guest',
            name='additions',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='invite.Invite'),
        ),
    ]

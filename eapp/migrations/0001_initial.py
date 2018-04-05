# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='App',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(unique=True, max_length=100)),
                ('url', models.CharField(default=b'', max_length=200)),
                ('version', models.CharField(default=b'1.0.0', max_length=10)),
                ('type', models.CharField(max_length=20, null=True)),
                ('status', models.CharField(default=b'online', max_length=10)),
                ('index', models.IntegerField(default=0, null=True)),
                ('color', models.CharField(default=b'blue_two', max_length=20)),
                ('icon', models.CharField(default=b'', max_length=20)),
                ('img', models.CharField(default=b'', max_length=100)),
                ('description', models.TextField(null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.CharField(default=b'guest', max_length=30)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]

# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Board',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=100)),
                ('name', models.CharField(max_length=100)),
                ('type', models.CharField(max_length=20)),
                ('url', models.TextField()),
                ('search', models.TextField(null=True)),
                ('search_param', models.TextField(default=b'', null=True)),
                ('fixed_data', models.CharField(default=b'0', max_length=10)),
                ('color', models.CharField(max_length=10, null=True)),
                ('size', models.CharField(max_length=20, null=True)),
                ('state', models.CharField(default=b'show', max_length=20, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.CharField(default=b'guest', max_length=100)),
                ('group', models.CharField(default=b'public', max_length=50, null=True)),
                ('comment', models.TextField(null=True)),
                ('index', models.IntegerField(default=0, null=True)),
                ('template', models.CharField(default=b'online_service', max_length=100, null=True)),
                ('js_template', models.CharField(default=b'', max_length=100, null=True)),
                ('status', models.CharField(default=b'enable', max_length=20, null=True)),
                ('refresh', models.IntegerField(default=0, null=True)),
                ('process', models.CharField(default=b'1', max_length=2, null=True)),
                ('shared_by', models.CharField(max_length=100, null=True)),
                ('pre_size', models.CharField(default=b'eight wide', max_length=20, null=True)),
                ('height', models.CharField(default=450, max_length=20, null=True)),
                ('pre_height', models.CharField(default=450, max_length=20, null=True)),
                ('footer_height', models.IntegerField(default=0)),
                ('enable_header_menu', models.CharField(default=b'', max_length=20)),
                ('enable_resize', models.CharField(default=b'', max_length=20)),
                ('enable_save', models.CharField(default=b'True', max_length=20)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]

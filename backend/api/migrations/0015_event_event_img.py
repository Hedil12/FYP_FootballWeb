# Generated by Django 5.1.2 on 2025-01-18 20:51

import cloudinary.models
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0014_alter_event_event_types_alter_store_is_available_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='event_img',
            field=cloudinary.models.CloudinaryField(blank=True, default='', max_length=255, null=True, verbose_name='image'),
        ),
    ]

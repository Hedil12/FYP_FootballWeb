# Generated by Django 5.1.2 on 2025-01-11 14:09

import cloudinary.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_alter_storeimage_image'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='store',
            name='has_discounts',
        ),
        migrations.AddField(
            model_name='store',
            name='item_img',
            field=cloudinary.models.CloudinaryField(max_length=255, null=True, verbose_name='image'),
        ),
        migrations.AlterField(
            model_name='store',
            name='is_available',
            field=models.BooleanField(default=False),
        ),
        migrations.DeleteModel(
            name='StoreImage',
        ),
    ]

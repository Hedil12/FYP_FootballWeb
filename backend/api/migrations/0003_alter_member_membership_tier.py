# Generated by Django 5.1.2 on 2024-11-06 19:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_event_incentive_member_product_delete_note'),
    ]

    operations = [
        migrations.AlterField(
            model_name='member',
            name='membership_tier',
            field=models.CharField(choices=[('Gold', 'Gold'), ('Silver', 'Silver'), ('Bronze', 'Bronze'), ('Admin', 'Admin')], default='Bronze', max_length=10),
        ),
    ]

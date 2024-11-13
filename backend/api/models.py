from django.db import models
from django.contrib.auth.hashers import make_password

class Membership(models.Model):
    membership_tier = models.BigAutoField(primary_key=True)
    membership_name = models.CharField(max_length=255)
    cashback_rates = models.DecimalField(max_digits=8, decimal_places=2)
    discount_rates = models.DecimalField(max_digits=8, decimal_places=2)

class Role(models.Model):
    role_id = models.BigAutoField(primary_key=True)
    role_type = models.CharField(max_length=255)

class Member(models.Model):
    member_id = models.BigAutoField(primary_key=True)
    membership = models.ForeignKey(Membership, on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    member_name = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    member_email = models.EmailField(max_length=255, unique=True)
    cashback_points = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    expiration_date = models.DateField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.password and not self.password.startswith('pbkdf2_sha256$'):
            self.password = make_password(self.password)
        super(Member, self).save(*args, **kwargs)


class Store(models.Model):
    item_id = models.BigAutoField(primary_key=True)
    item_name = models.CharField(max_length=255)
    item_desc = models.CharField(max_length=255)
    item_qty = models.BigIntegerField()
    item_price = models.DecimalField(max_digits=8, decimal_places=2)
    discount_rates = models.DecimalField(max_digits=8, decimal_places=2)

class Cart(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    item = models.ForeignKey(Store, on_delete=models.CASCADE)
    date_of_purchase = models.DateField()
    total_amount = models.DecimalField(max_digits=8, decimal_places=2)

    class Meta:
        unique_together = (("member", "item"),)

class Event(models.Model):
    event_id = models.BigAutoField(primary_key=True)
    event_name = models.CharField(max_length=255)
    event_desc = models.CharField(max_length=255)
    event_types = models.CharField(max_length=255)
    event_date_start = models.DateField()
    event_date_end = models.DateField()
    location = models.CharField(max_length=255)

class MemberEvent(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)

    class Meta:
        unique_together = (("member", "event"),)
